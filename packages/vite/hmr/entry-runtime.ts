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

declare const __NS_APP_ROOT_VIRTUAL__: string;

function updateBootOverlay(stage: string, info?: any): void {
	try {
		const api = (globalThis as any).__NS_HMR_DEV_OVERLAY__;
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
	const g = globalThis as any;
	g.__NS_HMR_BOOT_MAIN_URL__ = url;
	g.__NS_HMR_BOOT_MAIN_ATTEMPT__ = attempt;
	g.__NS_HMR_BOOT_MAIN_ATTEMPTS__ = attempts;
	g.__NS_HMR_BOOT_MODULE_COUNT__ = 0;
	g.__NS_HMR_BOOT_LAST_MODULE__ = '';
	g.__NS_HMR_BOOT_LAST_PROGRESS_AT__ = 0;
	g.__NS_HMR_BOOT_IMPORT_STARTED_AT__ = Date.now();
}

function clearBootImportProgress(): void {
	const g = globalThis as any;
	delete g.__NS_HMR_BOOT_MAIN_URL__;
	delete g.__NS_HMR_BOOT_MAIN_ATTEMPT__;
	delete g.__NS_HMR_BOOT_MAIN_ATTEMPTS__;
	delete g.__NS_HMR_BOOT_MODULE_COUNT__;
	delete g.__NS_HMR_BOOT_LAST_MODULE__;
	delete g.__NS_HMR_BOOT_LAST_PROGRESS_AT__;
	delete g.__NS_HMR_BOOT_IMPORT_STARTED_AT__;
}

function buildBootImportDetail(url: string): string {
	const g = globalThis as any;
	const count = Number(g.__NS_HMR_BOOT_MODULE_COUNT__ || 0);
	const lastModule = typeof g.__NS_HMR_BOOT_LAST_MODULE__ === 'string' ? g.__NS_HMR_BOOT_LAST_MODULE__ : '';
	const lines = [count > 0 ? `Evaluated ${count} modules` : 'Resolving the module graph'];
	lines.push(lastModule || url);
	return lines.join('\n');
}

function computeBootImportProgress(): number {
	const g = globalThis as any;
	const count = Number(g.__NS_HMR_BOOT_MODULE_COUNT__ || 0);
	const startedAt = Number(g.__NS_HMR_BOOT_IMPORT_STARTED_AT__ || Date.now());
	const elapsedMs = Math.max(0, Date.now() - startedAt);
	const progressFromCount = count > 0 ? Math.min(10, Math.round((Math.log(count + 1) / Math.LN2) * 2)) : 0;
	const progressFromTime = Math.min(8, Math.floor(elapsedMs / 800));
	return Math.min(94, 82 + Math.max(progressFromCount, progressFromTime));
}

function startBootImportHeartbeat(url: string, attempt: number, attempts: number): () => void {
	const timer = setInterval(() => {
		updateBootOverlay('importing-main', {
			detail: buildBootImportDetail(url),
			attempt,
			attempts,
			progress: computeBootImportProgress(),
		});
	}, 350);

	return () => clearInterval(timer);
}

export function installHttpCoreCssSupport(coreModule: any, verbose?: boolean): HmrCssApplier | null {
	try {
		const g = globalThis as any;
		const core = coreModule?.default ?? coreModule;
		const Application = (core && (typeof core.addCss === 'function' ? core : undefined)) || (core?.Application && typeof core.Application.addCss === 'function' ? core.Application : undefined) || (coreModule?.Application && typeof coreModule.Application.addCss === 'function' ? coreModule.Application : undefined) || g.Application;
		if (!Application?.addCss) {
			return null;
		}

		const applyCss: HmrCssApplier = (cssText: string, refreshRoot = true) => {
			if (typeof cssText !== 'string' || !cssText.length) {
				return;
			}

			Application.addCss(cssText);
			if (!refreshRoot) {
				return;
			}

			try {
				const rootView = Application.getRootView?.();
				if (rootView && typeof rootView._onCssStateChange === 'function') {
					rootView._onCssStateChange();
				} else if (rootView) {
					const cls = rootView.className || '';
					rootView.className = cls + ' ';
					rootView.className = cls;
				}
			} catch {}
		};

		g.__NS_HMR_APPLY_CSS__ = applyCss;

		const appCssText = g.__NS_HMR_APP_CSS__;
		if (typeof appCssText === 'string' && appCssText.length && !g.__NS_HMR_HTTP_APP_CSS_APPLIED__) {
			applyCss(appCssText);
			g.__NS_HMR_HTTP_APP_CSS_APPLIED__ = true;
			if (verbose) {
				console.info('[ns-entry] app.css applied in HTTP core realm');
			}
		}

		return applyCss;
	} catch (error: any) {
		try {
			if (verbose) console.warn('[ns-entry] failed to install HTTP core CSS support:', error?.message || error);
		} catch {}
		return null;
	}
}

export async function preloadHttpCoreStyleScope(importHttp: HttpImportFn, origin: string, ver: string | number, verbose?: boolean): Promise<HttpPreloadResult> {
	const url = String(origin || '') + '/ns/core/' + String(ver || '0') + '?p=ui/styling/style-scope.js';
	const t0 = Date.now();
	try {
		await importHttp(url);
		if (verbose) {
			console.info('[ns-entry] HTTP core style-scope preloaded');
		}
		return { ok: true, ms: Date.now() - t0, url };
	} catch (error: any) {
		const result = { ok: false, ms: Date.now() - t0, url, err: String(error && (error.message || error)) };
		try {
			if (verbose) console.warn('[ns-entry] HTTP core style-scope preload failed:', error?.message || error);
		} catch {}
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
		if ((globalThis as any).__NS_ENV_VERBOSE__) console.warn('[ns-entry][diag]', u === (globalThis as any).__NS_ENTRY_LAST_TARGET__ ? 'sanitized' : 'raw', hash ? `(hash ${hash})` : '', '\n' + context);
	} catch (fe: any) {
		try {
			if ((globalThis as any).__NS_ENV_VERBOSE__) console.warn('[ns-entry][diag] fetch failed', u, fe && (fe.message || fe));
		} catch {}
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
		(globalThis as any).__NS_HTTP_ORIGIN__ = ORIGIN;
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
		const configureRuntime = (globalThis as any).__nsConfigureRuntime;
		const g: any = globalThis as any;
		const importMapPromise: Promise<void> = (async () => {
			if (typeof configureRuntime !== 'function') {
				if (VERBOSE) {
					console.info('[ns-entry] __nsConfigureRuntime not available (older runtime); skipping import map');
				}
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
		const t_rt = Date.now();
		const rtPromise: Promise<any> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('loading-runtime-bridge', {
				detail: ORIGIN + '/ns/rt/' + VER,
			});
			try {
				const mod = await importHttp(ORIGIN + '/ns/rt/' + VER);
				TRACE.preload.rt = { ok: true, ms: Date.now() - t_rt, url: ORIGIN + '/ns/rt/' + VER };
				return mod;
			} catch (e_rt: any) {
				TRACE.preload.rt = { ok: false, ms: Date.now() - t_rt, url: ORIGIN + '/ns/rt/' + VER, err: String(e_rt && (e_rt.message || e_rt)) };
				try {
					console.warn('[ns-entry] /ns/rt preload failed:', e_rt && (e_rt.message || e_rt));
				} catch {}
				return null;
			}
		});

		// /ns/core and the style-scope preload are both core-realm side effects
		// that run independently of /ns/rt. We fire them in parallel with rt so
		// the aggregate cost is max(rt, core, styleScope) instead of the sum.
		const t_core = Date.now();
		const corePromise: Promise<any> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('loading-core-bridge', {
				detail: ORIGIN + '/ns/core/' + VER,
			});
			try {
				const mod = await importHttp(ORIGIN + '/ns/core/' + VER);
				TRACE.preload.core = { ok: true, ms: Date.now() - t_core, url: ORIGIN + '/ns/core/' + VER };
				return mod;
			} catch (e_core: any) {
				TRACE.preload.core = { ok: false, ms: Date.now() - t_core, url: ORIGIN + '/ns/core/' + VER, err: String(e_core && (e_core.message || e_core)) };
				try {
					console.warn('[ns-entry] /ns/core preload failed:', e_core && (e_core.message || e_core));
				} catch {}
				return null;
			}
		});
		const styleScopePromise: Promise<HttpPreloadResult> = importMapPromise.then(async () => {
			await updateBootOverlayAndYield('preloading-style-scope', {
				detail: ORIGIN + '/ns/core/' + VER + '?p=ui/styling/style-scope.js',
			});
			return preloadHttpCoreStyleScope(importHttp, ORIGIN, VER, VERBOSE);
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

		const MAIN_URL = ORIGIN + '/ns/m' + MAIN + '?v=' + VER;
		const MAIN_IMPORT_URL = ORIGIN + '/ns/m/__ns_boot__/b1' + MAIN + '?v=' + VER;
		if (VERBOSE) console.log(D, 'importing main module:', MAIN_URL);
		(globalThis as any).__NS_ENTRY_LAST_TARGET__ = MAIN_IMPORT_URL; // used by fetchCodeframe sanitized-vs-raw tag
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
		(globalThis as any).__NS_ENTRY_OK__ = true;
		updateBootOverlay('ready', {
			detail: 'HTTP HMR boot is ready. The app root should take over now.',
		});
		if (VERBOSE) console.log(D, '__NS_HMR_BOOT_COMPLETE__ = true');
		(globalThis as any).__NS_HMR_BOOT_COMPLETE__ = true;

		// The placeholder patches Application.run() → resetRootView(), so the
		// app's Application.run() call in the main module transparently replaced
		// the placeholder with the real app UI. Restore original run() now.
		try {
			const g: any = globalThis as any;
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
		const TARGET = loc.url || (globalThis as any).__NS_ENTRY_LAST_TARGET__;
		(errInfo as any).url = loc.url;
		(errInfo as any).line = loc.line;
		(errInfo as any).column = loc.column;
		updateBootOverlay('error', {
			detail: errInfo.message,
		});
		(globalThis as any).__NS_ENTRY_ERROR__ = errInfo;
		TRACE.error = errInfo;
		try {
			console.error('[ns-entry] failed to import main via HTTP', errInfo.message);
			if (errInfo.stack && VERBOSE) console.error(errInfo.stack);
		} catch {}
		// Always provide minimal diagnostics on error, even if verbose=false
		try {
			const urls: string[] = [TARGET];
			if (typeof TARGET === 'string' && /\/ns\/(asm|sfc|m)/.test(TARGET)) {
				urls.push(TARGET + (TARGET.includes('?') ? '&' : '?') + 'raw=1');
			}
			for (const u of urls) await fetchCodeframe(u, loc.line);
			if (VERBOSE) console.info('[ns-entry][diag] Tip: append ?raw=1 to /ns/m, /ns/sfc, or /ns/asm URLs to compare raw vs sanitized output.');
		} catch {}
		(globalThis as any).__NS_ENTRY_OK__ = false;
		// Re-throw so the HTTP bootloader can try other origin candidates.
		throw e;
	} finally {
		try {
			TRACE.t1 = Date.now();
			(globalThis as any).__NS_ENTRY_TRACE__ = TRACE;
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
