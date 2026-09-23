/**
 * HMR client entry for NativeScript devices.
 *
 * Avoid importing from '@nativescript/core' and other framework modules here to prevent creating a second module realm via HTTP ESM.
 * Always resolve core classes and Application from the vendor realm or globalThis at runtime.
 * The HMR client is evaluated via HTTP ESM on device; static imports would create secondary instances.
 *
 * This entry owns boot-time side effects (core aliases, launch-notification
 * bridge, CSS register) and wires the seams together:
 * - `ws-transport.ts` — socket connect/reconnect + connection overlay
 * - `protocol-dispatch.ts` — routes parsed wire messages
 * - `update-pipeline.ts` — graph state + evict-then-reimport queue
 * - `root-reset.ts` — root-view replacement
 * - `strategy-loader.ts` — flavor detection + framework strategy loading
 */

import { setHMRWsUrl, getHMRWsUrl, getCore, ENV_VERBOSE } from './utils.js';
import { applyCssText } from './css-handler.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { installLaunchNotificationBridge } from '../shared/runtime/launch-bridge.js';
import { connectHmr, setHmrMessageHandler } from './ws-transport.js';
import { handleHmrMessage } from './protocol-dispatch.js';
import { ensureCoreAliasesOnGlobalThis, performResetRoot } from './root-reset.js';
import { CLIENT_STRATEGY_READY, getClientStrategy } from './strategy-loader.js';

const VERBOSE = ENV_VERBOSE;

// Apply once on module evaluation so that /ns/rt exports resolve to functions
// before any SFCs are evaluated during HTTP-only dev boot.
ensureCoreAliasesOnGlobalThis();

// Late-registration bridge for one-shot iOS launch notifications
// (see shared/runtime/launch-bridge.ts).
//
// Under a webpack (or non-HMR vite) build the app bundle evaluates BEFORE
// `UIApplicationMain` finishes launching, so
// `Application.ios.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, cb)`
// registers in time. Under the HTTP dev session UIKit is fully launched long
// before the app graph evaluates — those observers register AFTER the
// notification fired and are never called, so apps that gate SDK init (auth,
// Firebase, Sentry) behind didFinishLaunching silently never initialize. The
// bridge wraps `addNotificationObserver` so a post-launch registration for
// Did/WillFinishLaunching still registers normally AND has its callback
// invoked on the next macrotask with a synthesized NSNotification.
//
// The DETERMINISTIC install happens in the /__ns_dev__/client bootstrap
// wrapper, which runs before the app entry. This module-eval attempt and the
// global hook are belt-and-braces for exotic boot paths — this client
// evaluates async and can lose the race against the entry graph, so it must
// never be the only wrap.
function tryInstallLaunchNotificationBridge(attempts: number, explicitApplication?: any) {
	let wrappedAny = false;
	try {
		wrappedAny = installLaunchNotificationBridge(explicitApplication, [getCore('Application')]);
	} catch {}
	if (!wrappedAny && attempts > 0) {
		setTimeout(() => tryInstallLaunchNotificationBridge(attempts - 1, explicitApplication), 100);
	}
}
tryInstallLaunchNotificationBridge(100);
try {
	(globalThis as any).__NS_DEV_INSTALL_LAUNCH_BRIDGE__ = (explicitApplication?: any) => tryInstallLaunchNotificationBridge(100, explicitApplication);
} catch {}

// Install the device CSS applier. CSS-bearing modules (a Vue SFC `<style>` via
// `/ns/asm`, an imported `.css` via `/ns/m`) call `__NS_REGISTER_CSS__(tag, css)`,
// or queue in `__NS_PENDING_CSS__` if they ran first; the drain below covers that.
// Routes through the shared `applyCssText` (tagged remove+add + root restyle),
// the same path app.css and live `.css` edits use.
function installCssRegister(): void {
	const g: any = getGlobalScope();
	if (typeof g.__NS_REGISTER_CSS__ === 'function') {
		return;
	}
	const apply = (tag: string, cssText: string) => {
		if (typeof cssText !== 'string' || !cssText.length) {
			return;
		}
		try {
			applyCssText(cssText, tag);
		} catch (cssErr: any) {
			if (VERBOSE) console.warn('[ns-hmr] CSS register/apply failed for', tag, cssErr?.message || cssErr);
		}
	};
	g.__NS_REGISTER_CSS__ = apply;
	try {
		const pending = g.__NS_PENDING_CSS__;
		if (pending && typeof pending === 'object') {
			for (const tag of Object.keys(pending)) {
				apply(tag, pending[tag]);
			}
			g.__NS_PENDING_CSS__ = null;
		}
	} catch {}
}
installCssRegister();

// Route incoming socket messages through the protocol dispatcher.
setHmrMessageHandler(handleHmrMessage);

export function initHmrClient(opts?: { wsUrl?: string }) {
	if (opts?.wsUrl) {
		setHMRWsUrl(opts.wsUrl);
	}
	if (VERBOSE) console.log('[hmr-client] Initializing HMR client', getHMRWsUrl() ? `(ws: ${getHMRWsUrl()})` : '');
	// Prevent duplicate client initialization across re-evaluations
	const g = globalThis;
	if (g.__NS_HMR_CLIENT_ACTIVE__) {
		if (VERBOSE) console.log('[hmr-client] HMR client already active; skipping duplicate init');
		return;
	}
	g.__NS_HMR_CLIENT_ACTIVE__ = true;
	ensureCoreAliasesOnGlobalThis();
	// Defer WebSocket connection until boot completes to avoid native V8 crashes
	// caused by concurrent WebSocket message handling + HTTP fetch during early startup.
	// The WebSocket is only needed for HMR updates, not the initial boot sequence.
	if (g.__NS_HMR_BOOT_COMPLETE__) {
		connectHmr();
	} else {
		const waitForBoot = () => {
			if (globalThis.__NS_HMR_BOOT_COMPLETE__) {
				if (VERBOSE) console.log('[hmr-client] boot complete, connecting HMR WebSocket');
				connectHmr();
			} else {
				setTimeout(waitForBoot, 100);
			}
		};
		if (VERBOSE) console.log('[hmr-client] deferring WebSocket connection until boot completes');
		setTimeout(waitForBoot, 100);
	}
	// Best-effort: install back wrapper even before first remount; original root may be captured later.
	// Deferred until the dynamically-imported strategy resolves.
	void CLIENT_STRATEGY_READY.then(() => getClientStrategy()?.installBackWrapper?.(performResetRoot, getCore));
}
export default function startViteHMR(opts?: { wsUrl?: string }) {
	if (VERBOSE) console.log('[hmr-client] Starting HMR client', opts);
	initHmrClient(opts);
}
