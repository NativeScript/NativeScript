/**
 * Protocol dispatch — routes every parsed HMR wire message to the right
 * handler. Dispatch order is load-bearing: `ns:hmr-pending` short-circuits
 * before the strategy await; `angular:component-update` (custom event) must
 * `return` after registry dispatch so the reboot path never runs for in-place
 * template swaps.
 */

import { pendingModuleFetches, moduleFetchCache, resolveHmrHttpOrigin, graph, setGraphVersion, getGraphVersion, getCore, ENV_VERBOSE } from './utils.js';
import { handleCssUpdates } from './css-handler.js';
import { buildCssApplyingDetail, buildCssAppliedDetail } from './css-update-overlay.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { getOverlayApi as getHmrOverlayApi, setUpdateStage as setUpdateOverlayStage } from './overlay-driver.js';
import { getNsHotRegistry } from './hot-context.js';
import { applyHmrPendingFrame } from './hmr-pending-overlay.js';
import { getClientStrategy, CLIENT_STRATEGY_READY } from './strategy-loader.js';
import { noteHealthyHmrMessage } from './ws-transport.js';
import { applyFullGraph, applyDelta, processQueue, markFullGraphReceived, reimportInferredFullGraphChanges } from './update-pipeline.js';
import { performResetRoot } from './root-reset.js';

const VERBOSE = ENV_VERBOSE;

// Eagerly drive the HMR-applying overlay's 'received' frame as soon
// as the server emits `ns:hmr-pending`, BEFORE the framework-specific
// (`ns:angular-update` / `ns:css-updates`) payload arrives. The
// flavor-specific handler later walks through 'evicting' →
// 'reimporting' → 'rebooting' → 'complete'. Calling 'received' twice
// in the same cycle is safe: the overlay preserves
// `updateCycleStartedAt` when a 'received' frame replaces an existing
// 'received' frame so the minimum-visible window is still timed
// against the FIRST frame.
//
// Soft-fails when the overlay isn't installed (production builds,
// vitest, etc.) or when the user opted out via
// `__NS_HMR_PROGRESS_OVERLAY_ENABLED__ === false`.
function setHmrPendingOverlay(filePath: string) {
	applyHmrPendingFrame(filePath, { getOverlay: getHmrOverlayApi });
}

export async function handleHmrMessage(ev: any) {
	let msg: any;
	try {
		msg = JSON.parse((ev as any).data);
	} catch {
		return;
	}

	if (msg) {
		noteHealthyHmrMessage();
	}

	if (VERBOSE && msg?.type) {
		console.log('[hmr-client] received message', msg.type);
	}

	// Notify optional app-level hook after an HMR batch is applied.
	function notifyAppHmrUpdate(kind: 'full-graph' | 'delta', changedIds: string[] | undefined) {
		try {
			const hook = globalThis.__NS_HMR_ON_UPDATE__;
			if (typeof hook === 'function') {
				hook({ type: kind, version: getGraphVersion(), changedIds: changedIds || [], raw: msg });
			}
		} catch {}
	}

	if (msg) {
		// `ns:hmr-pending` is a fire-and-forget UX hint emitted by the
		// server at the START of handleHotUpdate. We drive the
		// HMR-applying overlay's 'received' frame here (synchronously),
		// well before the authoritative payload (`ns:angular-update` /
		// `ns:css-updates`) lands. Skip running any other handlers —
		// the pending message has no module payload and intentionally
		// does not bump the graph version.
		if (msg.type === 'ns:hmr-pending' && typeof msg.path === 'string') {
			setHmrPendingOverlay(msg.path);
			return;
		}
		// The per-flavor client strategy is loaded by a dynamic import(); make
		// sure it has resolved (and `install()` has run) before any handler that
		// delegates through it. After the first message this is an already-settled
		// promise (microtask only); for Solid/TypeScript it is `Promise.resolve()`.
		await CLIENT_STRATEGY_READY;
		if (msg.type === 'ns:hmr-full-graph') {
			// Bump a monotonic nonce so HTTP ESM imports can always be cache-busted per update.
			try {
				const g: any = getGlobalScope();
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			// Capture previous graph snapshot so we can infer which modules changed.
			const prevGraph = new Map(graph);
			setGraphVersion(Number(msg.version || getGraphVersion() || 0));
			applyFullGraph(msg);
			markFullGraphReceived();

			// Gate: On first boot, the entry-runtime handles all initial module loading
			// (with the import map already configured). Don't re-import here — the graph
			// is stored above for future HMR delta comparisons, but modules are already
			// loaded correctly via the entry-runtime boot sequence.
			//
			// Two cases to catch:
			// 1. Boot still in progress (__NS_HMR_BOOT_COMPLETE__ is false)
			// 2. Boot already finished but this is the FIRST full-graph (prevGraph was
			//    empty). The WebSocket often connects after entry-runtime finishes, so
			//    boot is "complete" but we still shouldn't re-import — all modules were
			//    just loaded fresh. Only re-import on subsequent full-graphs (reconnect
			//    scenarios) where prevGraph already has entries.
			const fullIds = Array.isArray(msg.modules) ? msg.modules.map((m: any) => m?.id).filter(Boolean) : [];
			if (!globalThis.__NS_HMR_BOOT_COMPLETE__) {
				if (VERBOSE) console.info('[hmr][full-graph] skipping initial re-import (boot in progress)');
				notifyAppHmrUpdate('full-graph', fullIds);
				return;
			}
			if (prevGraph.size === 0) {
				if (VERBOSE) console.info('[hmr][full-graph] skipping re-import on first graph after boot (modules already fresh)');
				notifyAppHmrUpdate('full-graph', fullIds);
				return;
			}

			// Reconnect / resync case — re-import changed modules as normal.
			await reimportInferredFullGraphChanges(prevGraph);
			notifyAppHmrUpdate('full-graph', fullIds);
			return;
		}
		if (msg.type === 'ns:ts-module-registry') {
			// Informational broadcast from the typescript server strategy; the
			// client needs no state from it.
			return;
		}
		if (msg.type === 'ns:hmr-delta') {
			// Bump a monotonic nonce so HTTP ESM imports can always be cache-busted per update.
			try {
				const g: any = getGlobalScope();
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			applyDelta(msg);
			// Ensure queued module re-imports complete before notifying app hooks.
			// Otherwise app-level handlers can run against stale module bodies due to HTTP ESM caching.
			try {
				await processQueue();
			} catch {}

			const deltaIds = Array.isArray(msg.changed) ? msg.changed.map((c: any) => c?.id).filter(Boolean) : [];
			notifyAppHmrUpdate('delta', deltaIds);
			return;
		} else {
			// Vite custom-event dispatch.
			//
			// `server.ws.send('event-name', payload)` from any Vite plugin lands
			// on the wire as `{ type: 'custom', event: 'event-name', data: payload }`.
			// On the web, Vite's stock client owns a `customListenersMap` that
			// fires every `import.meta.hot.on('event-name', cb)` callback. We
			// don't run Vite's stock client on device — the JS hot registry
			// (`hot-context.ts`, installed by the bootstrap before the entry
			// graph) owns the listener registry populated by user code +
			// compiled Angular components via `import.meta.hot.on`.
			// Forwarding `type: 'custom'` here is the only thing standing
			// between server-emitted events and the listeners they were
			// meant for.
			//
			// `angular:component-update` is the canonical example. Analog's
			// plugin sends it on `.html` / component-style edits; the
			// compiled component `.mjs` registered a listener that
			// dynamic-imports `/@ng/component?c=<id>&t=<ts>` and calls
			// `ɵɵreplaceMetadata` on the live class — swapping the template
			// definition AND walking live `LView`s to recreate matching views
			// in-place. The page stays mounted and only the changed bits
			// re-render. We MUST `return` after dispatch so the reboot path
			// (`handleAngularHotUpdateMessage` → `__reboot_ng_modules__`)
			// never runs for these updates — that's the whole point of the
			// component-replacement pipeline.
			//
			// All other custom events are forwarded but NOT short-circuited
			// (Vite spec: custom events are additive — they don't replace
			// any framework-specific handling). The reboot path falls through
			// for `ns:angular-update` (the legacy/`.ts`-edit broadcast) and
			// for any framework not yet using the in-place replacement path.
			if (msg.type === 'custom' && typeof msg.event === 'string') {
				// Diagnostic policy: listener exceptions log loud (compiled
				// HmrLoad fetch/parse error). Successful dispatches are silent.
				try {
					getNsHotRegistry().dispatchHotEvent(msg.event, msg.data);
				} catch (err) {
					console.warn('[hmr-client][custom] dispatch threw for', msg.event, err);
				}
				if (msg.event === 'angular:component-update') {
					if (VERBOSE) console.log('[hmr-client][custom] dispatched angular:component-update — skipping reboot path');
					// Walk the apply-progress overlay through its remaining
					// stages for the in-place template-swap path. The full
					// reboot path (`handleAngularHotUpdateMessage`) drives the
					// overlay itself; the in-place path bypasses that handler
					// entirely because the work happens inside Angular's
					// `ɵɵreplaceMetadata` after the runtime forwards this event
					// to the compiled component's listener. Without this the
					// overlay would freeze at 5% ('received') even though the
					// visual swap completes a few frames later.
					//
					// Transition straight to 'reimporting' (metadata is being
					// fetched via `/@ng/component?c=...&t=...`), then schedule
					// 'complete' on the next macrotask so the auto-hide timer
					// kicks in — the template swap is fire-and-forget from here.
					try {
						const filePath = typeof (msg.data as any)?.id === 'string' ? decodeURIComponent((msg.data as any).id).split('@')[0] : undefined;
						const detail = filePath ? `Applying template update to ${filePath}` : 'Applying template update';
						setUpdateOverlayStage('reimporting', { detail });
						setTimeout(() => {
							try {
								setUpdateOverlayStage('complete', { detail: filePath ? `Updated ${filePath}` : 'Update applied' });
							} catch {}
						}, 16);
					} catch {}
					return;
				}
			}
			if (msg.type === 'ns:angular-update' && typeof msg.version === 'number') {
				setGraphVersion(Number(msg.version || getGraphVersion() || 0));
			}
			const strategy = getClientStrategy();
			if (strategy?.handleHotUpdateMessage && (await strategy.handleHotUpdateMessage(msg, { getCore, verbose: VERBOSE, performResetRoot, getOverlay: getHmrOverlayApi }))) {
				return;
			}
		}
	}
	// On-demand module fetch response (Option A)
	if (msg.type === 'ns:module-response' && typeof msg.requestId === 'number') {
		const pending = pendingModuleFetches.get(msg.requestId);
		if (pending) {
			pendingModuleFetches.delete(msg.requestId);
			if (msg.error) {
				if (VERBOSE) console.warn('[hmr-fetch] error', msg.error, 'spec=', pending.spec, 'id=', msg.requestId);
				pending.reject(new Error(`[hmr-fetch] ${msg.error} for ${pending.spec}`));
			} else {
				try {
					const origin = resolveHmrHttpOrigin();
					if (!origin) throw new Error('no-http-origin');
					const url = origin + '/ns/m' + (String(pending.spec).startsWith('/') ? pending.spec : '/' + pending.spec);
					moduleFetchCache.set(pending.spec, url);
					if (VERBOSE) console.log('[hmr-fetch] resolved via URL', pending.spec, '->', url, 'id=', msg.requestId);
					pending.resolve(url);
				} catch (e) {
					pending.reject(e);
				}
			}
		}
		return;
	}
	if (msg.type === 'ns:css-updates' && Array.isArray(msg.updates)) {
		// Drive the HMR-applying overlay past the 'received' (5%) frame
		// that `ns:hmr-pending` set earlier in the cycle. Without this
		// the overlay sticks at "Preparing update" forever for CSS-only
		// edits because `handleCssUpdates` is a leaf — there's no
		// downstream module-evaluation path that would hit the queue's
		// 'complete' transition.
		//
		// `reason: 'connect-sync'` (server-pushed boot-time stylesheet sync,
		// see hmr/server/css-connect-sync.ts) applies silently — no user edit
		// triggered it and no `ns:hmr-pending` preceded it.
		const cssCount = msg.updates.length;
		const silent = msg.reason === 'connect-sync';
		if (!silent) {
			try {
				setUpdateOverlayStage('reimporting', { detail: buildCssApplyingDetail(cssCount) });
			} catch {}
		}
		try {
			const origin = resolveHmrHttpOrigin(msg.origin);
			await handleCssUpdates(msg.updates, origin);
			if (!silent) {
				try {
					setUpdateOverlayStage('complete', { detail: buildCssAppliedDetail(cssCount) });
				} catch {}
			}
			return;
		} catch (e) {
			console.warn('[hmr-client] CSS updates handling failed:', e);
			if (!silent) {
				try {
					setUpdateOverlayStage('complete', { detail: 'CSS update failed' });
				} catch {}
			}
			return;
		}
	}
	if (msg.type === 'ns:vue-sfc-registry') {
		getClientStrategy()?.handleSfcRegistry?.(msg);
		return;
	}
	if (msg.type === 'ns:vue-sfc-registry-update') {
		if (typeof msg.version === 'number') setGraphVersion(msg.version);
		// `ns:hmr-pending` already set the overlay to 'received' (5%). The Vue
		// strategy walks 'evicting' → 'reimporting' → 'rebooting' → 'complete'
		// around the SFC load + reset so the toast always lands on 'complete'
		// (or a failure detail) and the auto-hide timer can dismiss it.
		await getClientStrategy()?.handleSfcRegistryUpdate?.(msg, getGraphVersion(), { getCore, verbose: VERBOSE, performResetRoot, getOverlay: getHmrOverlayApi });
		return;
	}
}
