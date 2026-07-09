import { getGlobalScope } from './shared/runtime/global-scope.js';
import { markDevBootComplete } from './shared/runtime/boot-complete.js';
import { readNsRuntimeDevHostApi } from './shared/runtime/browser-runtime-contract.js';
// Entry runtime executed on device via HTTP ESM.

type EntryOpts = {
	origin: string;
	main: string; // project-relative, e.g. "/src/app.ts"
	ver: string | number;
	verbose?: boolean;
};

type HmrCssApplier = (cssText: string, refreshRoot?: boolean) => void;
type HttpImportFn = (url: string) => Promise<any>;
type HttpPreloadResult = { ok: boolean; ms: number; url: string; err?: string };

// `addTaggedAdditionalCSS` accepts either raw CSS text (string) or a
// pre-parsed rework `css` AST object — `CSSSource.fromDetect` routes
// based on typeof. We type the param as `any` so HMR can pass the AST
// stashed by the bundle on `globalThis.__NS_HMR_APP_CSS_AST__`, which
// keeps the cold-boot application path identical between HMR and the
// no-HMR rolldown bundle (both use the rework AST).
type TaggedCssAdd = (cssOrAst: any, tag: string) => unknown;
type TaggedCssRemove = (tag: string) => unknown;
type TaggedCssApi = { add?: TaggedCssAdd; remove?: TaggedCssRemove };

// Must match the tag used by the boot virtual `app.css` emitter in
// `helpers/main-entry.ts` so HMR's remove/add pair replaces the
// boot-time selectors instead of stacking on top of them.
export const APP_CSS_TAG = 'app.css';

function resolveTaggedCssApi(coreModule: any): TaggedCssApi {
	const candidates: any[] = [coreModule, coreModule?.default, globalThis];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const add = candidate.addTaggedAdditionalCSS;
		const remove = candidate.removeTaggedAdditionalCSS;
		if (typeof add === 'function' && typeof remove === 'function') {
			return { add: add.bind(candidate), remove: remove.bind(candidate) };
		}
	}
	return {};
}

function updateBootOverlay(stage: string, info?: any): void {
	try {
		const api = globalThis.__NS_HMR_DEV_OVERLAY__;
		if (api && typeof api.setBootStage === 'function') {
			api.setBootStage(stage, info);
		}
	} catch {}
}

async function updateBootOverlayAndYield(stage: string, info?: any): Promise<void> {
	updateBootOverlay(stage, info);
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function prepareBootImportProgress(url: string, attempt: number, attempts: number): void {
	const g = globalThis;
	g.__NS_HMR_BOOT_MAIN_URL__ = url;
	g.__NS_HMR_BOOT_MAIN_ATTEMPT__ = attempt;
	g.__NS_HMR_BOOT_MAIN_ATTEMPTS__ = attempts;
	g.__NS_HMR_BOOT_MODULE_COUNT__ = 0;
	g.__NS_HMR_BOOT_LAST_MODULE__ = '';
	g.__NS_HMR_BOOT_LAST_PROGRESS__ = 0;
	g.__NS_HMR_BOOT_LAST_PROGRESS_AT__ = 0;
	g.__NS_HMR_BOOT_IMPORT_STARTED_AT__ = Date.now();
}

function clearBootImportProgress(): void {
	const g = getGlobalScope();
	delete g.__NS_HMR_BOOT_MAIN_URL__;
	delete g.__NS_HMR_BOOT_MAIN_ATTEMPT__;
	delete g.__NS_HMR_BOOT_MAIN_ATTEMPTS__;
	delete g.__NS_HMR_BOOT_MODULE_COUNT__;
	delete g.__NS_HMR_BOOT_LAST_MODULE__;
	delete g.__NS_HMR_BOOT_LAST_PROGRESS__;
	delete g.__NS_HMR_BOOT_LAST_PROGRESS_AT__;
	delete g.__NS_HMR_BOOT_IMPORT_STARTED_AT__;
}

function buildBootImportDetail(url: string): string {
	const g = globalThis;
	const count = Number(g.__NS_HMR_BOOT_MODULE_COUNT__ || 0);
	const lastModule = typeof g.__NS_HMR_BOOT_LAST_MODULE__ === 'string' ? g.__NS_HMR_BOOT_LAST_MODULE__ : '';
	const lines = [count > 0 ? `Evaluated ${count} modules` : 'Resolving the module graph'];
	lines.push(lastModule || url);
	return lines.join('\n');
}

// Inlined copy of `boot-progress.ts::computeBootImportProgress` +
// `applyMonotonicBootProgress`. This file is the device-side entry
// runtime for the http-bootloader fallback path; relative imports from
// `shared/runtime/` would cross the runtime boundary and slow
// first-byte. Keep the formula in sync with `boot-progress.ts` —
// `boot-progress.spec.ts` pins the canonical values.
function computeBootImportProgress(): number {
	const g = globalThis;
	const count = Number(g.__NS_HMR_BOOT_MODULE_COUNT__ || 0);
	const startedAt = Number(g.__NS_HMR_BOOT_IMPORT_STARTED_AT__ || Date.now());
	const elapsedMs = Math.max(0, Date.now() - startedAt);
	const progressFromCount = Math.min(40, Math.floor(count / 2));
	const progressFromTime = Math.min(62, Math.floor(elapsedMs / 250));
	const candidate = Math.min(94, 30 + Math.min(62, progressFromCount + progressFromTime));
	const previousRaw = g.__NS_HMR_BOOT_LAST_PROGRESS__;
	const previous = typeof previousRaw === 'number' && Number.isFinite(previousRaw) ? previousRaw : 0;
	const next = Math.max(previous, candidate);
	try {
		g.__NS_HMR_BOOT_LAST_PROGRESS__ = next;
	} catch {}
	return next;
}

function startBootImportHeartbeat(url: string, attempt: number, attempts: number): () => void {
	// 250 ms cadence matches `session-bootstrap.ts::startBootImportHeartbeat`
	// so both boot paths feel equally responsive.
	const timer = setInterval(() => {
		const g = globalThis;
		if (g.__NS_HMR_BOOT_COMPLETE__) {
			return;
		}
		updateBootOverlay('importing-main', {
			detail: buildBootImportDetail(url),
			attempt,
			attempts,
			progress: computeBootImportProgress(),
		});
	}, 250);

	return () => clearInterval(timer);
}

export function installHttpCoreCssSupport(coreModule: any, verbose?: boolean): HmrCssApplier | null {
	try {
		const g = getGlobalScope();
		const core = coreModule?.default ?? coreModule;
		const Application = (core && (typeof core.addCss === 'function' ? core : undefined)) || (core?.Application && typeof core.Application.addCss === 'function' ? core.Application : undefined) || (coreModule?.Application && typeof coreModule.Application.addCss === 'function' ? coreModule.Application : undefined) || g.Application;
		if (!Application?.addCss) {
			return null;
		}

		// Re-trigger styling on every reachable root view. The core bridge's
		// Application realm is not always the realm whose Application.run()
		// committed the root (monorepo per-module serving loads core through
		// /ns/m/packages/... while the bridge re-exports @fs-spelled modules),
		// so also consult the seeded global and the Application singletons the
		// root-placeholder run-wrapper records in __NS_DEV_KNOWN_APPLICATIONS__.
		const refreshRootViews = () => {
			const candidates: any[] = [Application, g.Application];
			try {
				const known = (g as any).__NS_DEV_KNOWN_APPLICATIONS__;
				if (Array.isArray(known)) candidates.push(...known);
			} catch {}
			const seenRoots = new Set<any>();
			for (const candidate of candidates) {
				try {
					const rootView = candidate?.getRootView?.();
					if (!rootView || seenRoots.has(rootView)) continue;
					seenRoots.add(rootView);
					if (typeof rootView._onCssStateChange === 'function') {
						rootView._onCssStateChange();
					} else {
						const cls = rootView.className || '';
						rootView.className = cls + ' ';
						rootView.className = cls;
					}
				} catch {}
			}
		};

		// Replace selectors via remove + add tagged pair so deleted
		// rules disappear (the additive `Application.addCss` cannot
		// undo previously installed selectors).
		const taggedCss = resolveTaggedCssApi(coreModule);
		const applyCss: HmrCssApplier = (cssText: string, refreshRoot = true) => {
			if (typeof cssText !== 'string' || !cssText.length) {
				return;
			}

			let appliedTagged = false;
			if (taggedCss.add && taggedCss.remove) {
				try {
					taggedCss.remove(APP_CSS_TAG);
					taggedCss.add(cssText, APP_CSS_TAG);
					appliedTagged = true;
				} catch (taggedError: any) {
					if (verbose) console.warn('[ns-entry] tagged CSS replace failed, falling back to addCss:', taggedError?.message || taggedError);
				}
			}
			if (!appliedTagged) {
				Application.addCss(cssText);
			}
			if (!refreshRoot) {
				return;
			}
			refreshRootViews();
		};

		g.__NS_HMR_APPLY_CSS__ = applyCss;

		// Device CSS applier for the fallback HTTP-bootloader path (the native
		// dev-session path installs the same one from `hmr/client`). Per-tag
		// remove+add keeps each source independently replaceable on hot-update.
		const registerCss = (tag: string, cssText: string) => {
			if (typeof cssText !== 'string' || !cssText.length) {
				return;
			}
			try {
				if (taggedCss.add && taggedCss.remove) {
					taggedCss.remove(tag);
					taggedCss.add(cssText, tag);
				} else if (Application.addCss) {
					Application.addCss(cssText);
				}
			} catch (cssErr: any) {
				if (verbose) console.warn('[ns-entry] CSS register/apply failed for', tag, cssErr?.message || cssErr);
				return;
			}
			// Live edit (boot complete): refresh the root so mounted views pick up
			// the replaced selectors. Cold boot needs no refresh (views not built yet).
			if (g.__NS_HMR_BOOT_COMPLETE__) {
				refreshRootViews();
			}
		};
		g.__NS_REGISTER_CSS__ = registerCss;
		// Drain any CSS registered before this applier was installed.
		try {
			const pending = g.__NS_PENDING_CSS__;
			if (pending && typeof pending === 'object') {
				for (const pendingTag of Object.keys(pending)) {
					registerCss(pendingTag, pending[pendingTag]);
				}
				g.__NS_PENDING_CSS__ = null;
			}
		} catch {}

		if (!g.__NS_HMR_HTTP_APP_CSS_APPLIED__) {
			// Cold boot: prefer the pre-parsed rework AST stashed by
			// `helpers/main-entry.ts` so the HTTP-core realm follows the
			// SAME application path as the no-HMR rolldown bundle. If the
			// AST isn't present (e.g. older bundle, future entry shape),
			// fall back to the raw text path. Live HMR edits arriving via
			// the dev-server WebSocket continue to use `applyCss(rawText)`
			// — `addTaggedAdditionalCSS` accepts either via
			// `CSSSource.fromDetect`.
			const appCssAst = (g as any).__NS_HMR_APP_CSS_AST__;
			const appCssText = g.__NS_HMR_APP_CSS__;
			let cssApplied = false;

			if (appCssAst && typeof appCssAst === 'object' && taggedCss.add && taggedCss.remove) {
				try {
					taggedCss.remove(APP_CSS_TAG);
					taggedCss.add(appCssAst, APP_CSS_TAG);
					cssApplied = true;
					if (verbose) console.info('[ns-entry] app.css applied in HTTP core realm via AST');
				} catch (astError: any) {
					if (verbose) console.warn('[ns-entry] AST CSS apply failed, falling back to raw text:', astError?.message || astError);
				}
			}

			if (!cssApplied && typeof appCssText === 'string' && appCssText.length) {
				applyCss(appCssText);
				cssApplied = true;
				if (verbose) console.info('[ns-entry] app.css applied in HTTP core realm via raw text');
			}

			if (cssApplied) {
				g.__NS_HMR_HTTP_APP_CSS_APPLIED__ = true;
				// On the http-bootloader path this install runs BEFORE the app
				// mounts, so no refresh is needed. On the dev-session path the
				// bootstrap installs this lazily AFTER boot completes — views
				// are already mounted with stale (empty) styling, so re-style.
				if (g.__NS_HMR_BOOT_COMPLETE__) {
					refreshRootViews();
				}
			}
		}

		return applyCss;
	} catch (error: any) {
		if (verbose) console.warn('[ns-entry] failed to install HTTP core CSS support:', error?.message || error);
		return null;
	}
}

export async function preloadHttpCoreStyleScope(importHttp: HttpImportFn, origin: string, verbose?: boolean): Promise<HttpPreloadResult> {
	// Use the canonical, unversioned subpath form `/ns/core/ui/styling/style-scope`.
	// Every consumer of `@nativescript/core/ui/styling/style-scope` (cold-boot
	// preload here, app-side imports, vendor `require()` shims via the runtime
	// import map) lands on the same URL string, so iOS's HTTP-ESM loader keys
	// them to one module record and the style-scope module's class identity is
	// shared across realms.
	const url = String(origin || '') + '/ns/core/ui/styling/style-scope';
	const t0 = Date.now();
	try {
		await importHttp(url);
		if (verbose) {
			console.info('[ns-entry] HTTP core style-scope preloaded');
		}
		return { ok: true, ms: Date.now() - t0, url };
	} catch (error: any) {
		const result = { ok: false, ms: Date.now() - t0, url, err: String(error && (error.message || error)) };
		if (verbose) console.warn('[ns-entry] HTTP core style-scope preload failed:', error?.message || error);
		return result;
	}
}

function parseStackUrlLineCol(err: any): { url?: string; line?: number; column?: number } {
	try {
		const stack = (err && (err.stack || err.message)) || '';
		const m = stack.match(/(https?:[^\s)]+):(\d+):(\d+)/);
		if (m) return { url: m[1], line: Number(m[2] || 0), column: Number(m[3] || 0) };
	} catch {}
	return {};
}

async function fetchCodeframe(u: string, line?: number) {
	try {
		const res = await fetch(u);
		const text = await res.text();
		const hash = res.headers && (res.headers as any).get ? (res.headers as any).get('X-NS-Source-Hash') || '' : '';
		const lines = String(text || '').split('\n');
		const L = line && line > 0 ? line : 1;
		const start = Math.max(1, L - 4),
			end = Math.min(lines.length, L + 3);
		let context = '';
		for (let i = start; i <= end; i++) {
			const mark = i === L ? '>' : ' ';
			const num = String(i).padStart(4, ' ');
			context += `${mark}${num}: ${lines[i - 1]}\n`;
		}
		if (globalThis.__NS_ENV_VERBOSE__) console.warn('[ns-entry][diag]', u === globalThis.__NS_ENTRY_LAST_TARGET__ ? 'sanitized' : 'raw', hash ? `(hash ${hash})` : '', '\n' + context);
	} catch (fe: any) {
		if (globalThis.__NS_ENV_VERBOSE__) console.warn('[ns-entry][diag] fetch failed', u, fe && (fe.message || fe));
	}
}

export default async function startEntry(opts: EntryOpts) {
	const D = '[entry-rt-diag]';
	const ORIGIN = String(opts.origin || '');
	const MAIN = String(opts.main || `${__NS_APP_ROOT_VIRTUAL__}/app.ts`);
	const VER = String(opts.ver || '0');
	const VERBOSE = !!opts.verbose;
	if (VERBOSE) console.log(D, 'startEntry called', { origin: ORIGIN, main: MAIN, ver: VER });
	// Announce chosen origin globally for any consumers (e.g., HMR client or helpers)
	try {
		globalThis.__NS_HTTP_ORIGIN__ = ORIGIN;
	} catch {}

	// Module-local trace snapshot
	const TRACE: any = { version: VER, origin: ORIGIN, mainPath: MAIN, t0: Date.now(), preload: { rt: {}, core: {}, coreStyleScope: {} }, main: {}, importMap: {} };

	// Native HTTP ESM import only.
	// Ensure a single canonical module realm.
	const importHttp = async (u: string) => {
		return await import(/* @vite-ignore */ u);
	};

	try {
		// Configure runtime with import map before loading any modules.
		// This enables the native runtime to resolve bare specifiers through the
		// import map instead of relying on Vite-side import rewriting.
		//
		// session-bootstrap may have already fetched the import map
		// and configured the runtime before we were invoked. In that case the
		// shared flag on globalThis lets us skip a redundant fetch (~100-200ms).
		//
		// once the import map is in place, the /ns/rt and /ns/core
		// imports (plus the style-scope preload) are independent HTTP GETs. We
		// fire them in parallel so the boot path is bounded by the slowest
		// payload rather than the sum.
		let configureRuntime = readNsRuntimeDevHostApi(globalThis).configureRuntime;
		const g = globalThis;
		const importMapPromise: Promise<void> = (async () => {
			if (typeof configureRuntime !== 'function') {
				// Re-read fresh — an earlier snapshot may predate the runtime
				// installing `__NS_DEV__` (observed on older runtimes).
				configureRuntime = readNsRuntimeDevHostApi(globalThis).configureRuntime;
			}
			if (typeof configureRuntime !== 'function') {
				// NOT verbose-gated: without the import map every bare specifier
				// in served modules is unresolvable and the session degrades into
				// an undebuggable stall. Surface the contract violation loudly.
				console.error('[ns-entry] __NS_DEV__.configureRuntime is unavailable — the import map cannot be installed and bare-specifier imports WILL fail. Update @nativescript/ios to a runtime that installs the __NS_DEV__ dev host API at context creation.');
				return;
			}
			if (g.__NS_IMPORT_MAP_CONFIGURED__ === true) {
				TRACE.importMap = { ok: true, ms: 0, cached: true };
				if (VERBOSE) console.info('[ns-entry] import map already configured by earlier boot stage');
				return;
			}
			await updateBootOverlayAndYield('configuring-import-map', {
				detail: ORIGIN + '/ns/import-map.json',
			});
			const t_imap = Date.now();
			try {
				const imapRes = await fetch(ORIGIN + '/ns/import-map.json');
				if (imapRes.ok) {
					const config = await imapRes.json();
					configureRuntime({
						importMap: config.importMap,
						volatilePatterns: config.volatilePatterns,
					});
					try {
						g.__NS_IMPORT_MAP_CONFIGURED__ = true;
					} catch {}
					TRACE.importMap = { ok: true, ms: Date.now() - t_imap, entries: Object.keys(config.importMap?.imports || {}).length };
					if (VERBOSE) console.info('[ns-entry] import map configured with', TRACE.importMap.entries, 'entries');
				} else {
					TRACE.importMap = { ok: false, ms: Date.now() - t_imap, status: imapRes.status };
					if (VERBOSE) console.warn('[ns-entry] import map fetch failed:', imapRes.status);
				}
			} catch (e_imap: any) {
				TRACE.importMap = { ok: false, ms: Date.now() - t_imap, err: String(e_imap && (e_imap.message || e_imap)) };
				if (VERBOSE) console.warn('[ns-entry] import map error:', e_imap?.message);
			}
		})();

		// Start the runtime bridge preload as soon as the import map is ready.
		// Any bare-specifier resolution inside /ns/rt depends on the import map,
		// so we chain it after importMapPromise — but otherwise let it race.
		// Canonical (unversioned) URL: one module record per bridge, matching
		// every served-module import of `/ns/rt`.
		const t_rt = Date.now();
		const RT_URL = ORIGIN + '/ns/rt';
		const rtPromise: Promise<any> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('loading-runtime-bridge', {
				detail: RT_URL,
			});
			try {
				const mod = await importHttp(RT_URL);
				TRACE.preload.rt = { ok: true, ms: Date.now() - t_rt, url: RT_URL };
				return mod;
			} catch (e_rt: any) {
				TRACE.preload.rt = { ok: false, ms: Date.now() - t_rt, url: RT_URL, err: String(e_rt && (e_rt.message || e_rt)) };
				console.warn('[ns-entry] /ns/rt preload failed:', e_rt && (e_rt.message || e_rt));
				return null;
			}
		});

		// /ns/core and the style-scope preload are both core-realm side effects
		// that run independently of /ns/rt. We fire them in parallel with rt so
		// the aggregate cost is max(rt, core, styleScope) instead of the sum.
		// Preload the canonical, unversioned `/ns/core` URL so this cold-boot
		// fetch shares an iOS HTTP-ESM module record (and a single class-
		// identity realm) with vendor `require('@nativescript/core')` lookups
		// resolved through the runtime import map, the `/ns/rt` bridge's
		// dynamic core import, and every served-module import. Threading a
		// `/<version>` segment here would create two separate module records
		// for byte-identical content, splitting `Frame`/`Page`/`View` class
		// identity across the boundary and leaving the dev placeholder root
		// visible after `Application.resetRootView(realFrame)` no-ops via a
		// failed `instanceof Frame` check.
		const t_core = Date.now();
		const CORE_URL = ORIGIN + '/ns/core';
		const corePromise: Promise<any> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('loading-core-bridge', {
				detail: CORE_URL,
			});
			try {
				const mod = await importHttp(CORE_URL);
				TRACE.preload.core = { ok: true, ms: Date.now() - t_core, url: CORE_URL };
				return mod;
			} catch (e_core: any) {
				TRACE.preload.core = { ok: false, ms: Date.now() - t_core, url: CORE_URL, err: String(e_core && (e_core.message || e_core)) };
				console.warn('[ns-entry] /ns/core preload failed:', e_core && (e_core.message || e_core));
				return null;
			}
		});
		const STYLE_SCOPE_URL = ORIGIN + '/ns/core/ui/styling/style-scope';
		const styleScopePromise: Promise<HttpPreloadResult> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('preloading-style-scope', {
				detail: STYLE_SCOPE_URL,
			});
			return preloadHttpCoreStyleScope(importHttp, ORIGIN, VERBOSE);
		});

		// Wait for all parallel preloads to resolve. Rejections are already
		// absorbed inside each wrapper, so Promise.all never throws here.
		const [, coreBridge, styleScopeResult] = await Promise.all([rtPromise, corePromise, styleScopePromise]);
		TRACE.preload.coreStyleScope = styleScopeResult;
		if (coreBridge) {
			await updateBootOverlayAndYield('installing-css', {
				detail: 'Applying app.css in the shared HTTP core realm.',
			});
			installHttpCoreCssSupport(coreBridge, VERBOSE);
		}

		// Canonical entry URL — no `__ns_boot__` path decoration. The
		// boot-progress snippet is injected self-gating by the /ns/m module
		// server (it no-ops once `__NS_HMR_BOOT_COMPLETE__` flips), so the
		// entry URL matches the steady-state HMR form and shares one module
		// identity. `?v=` is a dev-endpoint query the runtime canonicalizer
		// strips from the cache key.
		const MAIN_URL = ORIGIN + '/ns/m' + MAIN + '?v=' + VER;
		const MAIN_IMPORT_URL = MAIN_URL;
		if (VERBOSE) console.log(D, 'importing main module:', MAIN_URL);
		globalThis.__NS_ENTRY_LAST_TARGET__ = MAIN_IMPORT_URL; // used by fetchCodeframe sanitized-vs-raw tag
		const t_main = Date.now();
		let lastMainErr: any = null;
		for (let attempt = 0; attempt < 6; attempt++) {
			prepareBootImportProgress(MAIN_URL, attempt + 1, 6);
			const stopBootImportHeartbeat = startBootImportHeartbeat(MAIN_URL, attempt + 1, 6);
			try {
				await updateBootOverlayAndYield('importing-main', {
					detail: buildBootImportDetail(MAIN_URL),
					attempt: attempt + 1,
					attempts: 6,
					progress: computeBootImportProgress(),
				});
				const url = attempt === 0 ? MAIN_IMPORT_URL : MAIN_IMPORT_URL + '&r=' + String(Date.now());
				if (VERBOSE) console.log(D, 'import attempt', attempt, url);
				await importHttp(url);
				if (VERBOSE) console.log(D, 'import succeeded on attempt', attempt, 'took', Date.now() - t_main, 'ms');
				lastMainErr = null;
				break;
			} catch (e_main: any) {
				lastMainErr = e_main;
				if (VERBOSE) console.log(D, 'import attempt', attempt, 'FAILED:', e_main?.message || e_main);
				// brief backoff; allows dev server and device network to settle
				await new Promise((r) => setTimeout(r, 150 + attempt * 150));
			} finally {
				stopBootImportHeartbeat();
			}
		}
		clearBootImportProgress();
		if (lastMainErr) throw lastMainErr;
		TRACE.main = { ok: true, ms: Date.now() - t_main, url: MAIN_IMPORT_URL };
		await updateBootOverlayAndYield('waiting-for-app', {
			detail: 'Waiting for the real application root to replace the boot placeholder.',
		});
		globalThis.__NS_ENTRY_OK__ = true;
		updateBootOverlay('ready', {
			detail: 'HTTP HMR boot is ready. The app root should take over now.',
		});
		if (VERBOSE) console.log(D, '__NS_HMR_BOOT_COMPLETE__ = true');
		// Flips the JS global AND the native cold-boot gate
		// (`__NS_DEV__.setDevBootComplete`) so the runtime stops pumping the
		// JS-thread runloop between synchronous fetches.
		markDevBootComplete();

		// Belt-and-suspenders: kick off the placeholder finalize poll now. The
		// `Application.resetRootView` wrapper (installed by `installRootPlaceholder`
		// or `installCoreAliasesEarly`) is the primary trigger, but on Android
		// HTTP HMR boot the early hook can silently fail to install (it runs
		// before `@nativescript/core/bundle-entry-points` loads, when
		// `g.Application` is still `undefined`). Calling the restore hook here
		// runs `tryFinalizeBootPlaceholder` immediately and, if the real root
		// isn't committed yet (it usually isn't — Angular bootstrap is still
		// async), schedules a ~100 ms poll that succeeds the moment the
		// framework's `Application.run({ create })` or `resetRootView()` call
		// commits a non-placeholder root. Without this safety net Android can
		// hang at "Waiting for the app root view (94 %)" indefinitely.
		try {
			const g: any = getGlobalScope();
			const restorePlaceholder = g.__NS_DEV_RESTORE_PLACEHOLDER__;
			// Verbose-gated: if an app-root stall surfaces (e.g. Android
			// hanging at "Waiting for the app root view"), flip
			// `verbose: true` in the HMR config to see this plus the
			// matching `[ns-placeholder][diag]` chain.
			try {
				if (VERBOSE) {
					console.warn('[ns-entry][diag] main import done; kicking placeholder finalize', {
						hasRestoreCallback: typeof restorePlaceholder === 'function',
						hasPlaceholderRoot: !!g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__,
						hasApplication: !!(g.__NS_DEV_PLACEHOLDER_APPLICATION__ || g.Application),
					});
				}
			} catch {}
			if (typeof restorePlaceholder === 'function') {
				restorePlaceholder('main-import-done');
				if (VERBOSE) console.log(D, 'kicked __NS_DEV_RESTORE_PLACEHOLDER__ after main import');
			}
		} catch {}

		// The placeholder patches Application.run() → resetRootView(), so the
		// app's Application.run() call in the main module transparently replaced
		// the placeholder with the real app UI. Restore original run() now.
		try {
			const g: any = getGlobalScope();
			if (typeof g.__NS_DEV_ORIGINAL_APP_RUN__ === 'function') {
				// Restore original Application.run on ALL targets (mirrors placeholder patching)
				const origRun = g.__NS_DEV_ORIGINAL_APP_RUN__;
				const Application = g.Application || (g.__nsVendorRegistry?.get?.('@nativescript/core') || {}).Application;
				if (Application) {
					(Application as any).run = origRun;
					try {
						const proto = Object.getPrototypeOf(Application);
						if (proto && proto.run !== origRun) proto.run = origRun;
					} catch {}
				}
				// Also restore on vendor-registry Application if different
				try {
					const reg = g.__nsVendorRegistry;
					const vendorMod = reg?.get?.('@nativescript/core');
					const vendorApp = vendorMod?.Application || vendorMod?.default?.Application;
					if (vendorApp && vendorApp !== Application && vendorApp.run !== origRun) {
						vendorApp.run = origRun;
					}
				} catch {}
				delete g.__NS_DEV_ORIGINAL_APP_RUN__;
				if (VERBOSE) console.log(D, 'restored original Application.run');
			}
		} catch {}
	} catch (e: any) {
		clearBootImportProgress();
		const errInfo = { message: String(e && (e.message || e)), stack: e && e.stack ? String(e.stack) : '' };
		const loc = parseStackUrlLineCol(e);
		const TARGET = loc.url || globalThis.__NS_ENTRY_LAST_TARGET__;
		(errInfo as any).url = loc.url;
		(errInfo as any).line = loc.line;
		(errInfo as any).column = loc.column;
		updateBootOverlay('error', {
			detail: errInfo.message,
		});
		globalThis.__NS_ENTRY_ERROR__ = errInfo;
		TRACE.error = errInfo;
		console.error('[ns-entry] failed to import main via HTTP', errInfo.message);
		if (errInfo.stack && VERBOSE) console.error(errInfo.stack);
		// Always provide minimal diagnostics on error, even if verbose=false
		try {
			const urls: string[] = [TARGET];
			if (typeof TARGET === 'string' && /\/ns\/(asm|sfc|m)/.test(TARGET)) {
				urls.push(TARGET + (TARGET.includes('?') ? '&' : '?') + 'raw=1');
			}
			for (const u of urls) await fetchCodeframe(u, loc.line);
			if (VERBOSE) console.info('[ns-entry][diag] Tip: append ?raw=1 to /ns/m, /ns/sfc, or /ns/asm URLs to compare raw vs sanitized output.');
		} catch {}
		globalThis.__NS_ENTRY_OK__ = false;
		// Re-throw so the HTTP bootloader can try other origin candidates.
		throw e;
	} finally {
		try {
			TRACE.t1 = Date.now();
			globalThis.__NS_ENTRY_TRACE__ = TRACE;
			// Always print a concise, human-readable boot timeline so anyone
			// investigating perf can see before/after numbers without flipping
			// the verbose flag. Verbose mode still gets the full JSON dump.
			try {
				const parts: string[] = [];
				const push = (label: string, ms?: number) => {
					if (typeof ms === 'number') parts.push(`${label}=${ms}ms`);
				};
				push('importMap', TRACE.importMap?.ms);
				push('rt', TRACE.preload?.rt?.ms);
				push('core', TRACE.preload?.core?.ms);
				push('styleScope', TRACE.preload?.coreStyleScope?.ms);
				push('main', TRACE.main?.ms);
				const total = typeof TRACE.t0 === 'number' && typeof TRACE.t1 === 'number' ? TRACE.t1 - TRACE.t0 : undefined;
				push('total', total);
				const status = TRACE.error ? 'FAILED' : 'ok';
				console.info(`[ns-entry][boot] ${status} ${parts.join(' ')}`);
			} catch {}
			if (VERBOSE) console.info('[ns-entry][trace]', JSON.stringify(TRACE));
		} catch {}
	}
}
