import type { Plugin, ResolvedConfig } from 'vite';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, type NsDevPlatform, type NsDevSessionDescriptor } from '../shared/runtime/browser-runtime-contract.js';
import { resolveDeviceReachableHost } from '../../helpers/dev-host.js';
import { setUserDefineEntries } from '../../helpers/global-defines.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
const require = createRequire(import.meta.url);

const VIRTUAL_ID = 'virtual:ns-hmr-client';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export function computeClientImportSpecifier(options: { projectRoot: string; clientFsPath: string }) {
	const { projectRoot, clientFsPath } = options;
	let clientImport = clientFsPath;
	try {
		const fsPosix = clientFsPath.replace(/\\/g, '/');
		const rel = path.relative(projectRoot, clientFsPath);
		const relPosix = rel.replace(/\\/g, '/');

		if (path.isAbsolute(rel)) {
			clientImport = pathToFileURL(clientFsPath).toString();
		} else {
			// Prefer routing via the absolute fs path's `node_modules/...` tail. This
			// covers monorepo / pnpm setups where node_modules is hoisted ABOVE the
			// project root and `path.relative` would otherwise produce a
			// "../../node_modules/..." specifier. That relative form is sent to the
			// device's bootstrap as `__NS_BROWSER_RUNTIME_CLIENT_IMPORT__`, where the
			// URL constructor resolves it against `${origin}/__ns_dev__/client` and
			// collapses the leading `..` segments back to `${origin}/node_modules/...`.
			// That URL bypasses the `/ns/m/` AST-normalizer pipeline (which strips
			// browser-only `/@vite/client` imports), so the on-device HTTP loader
			// eventually tries to fetch `/@vite/client` and fails with
			// "HTTP import failed (status=0)" / "Instantiation failed (http-loader)".
			const lastNm = fsPosix.lastIndexOf('/node_modules/');
			if (lastNm !== -1) {
				return `/ns/m${fsPosix.slice(lastNm)}`;
			}

			// Monorepo dist symlink (e.g. `"@nativescript/vite": "file:../../dist/packages/vite"`):
			// require.resolve follows the node_modules symlink to its REAL path under
			// the workspace root, which contains no `/node_modules/` segment. The
			// `../../dist/...` relative form below would resolve on-device to
			// `${origin}/dist/...`, which Vite's middleware 404s (outside root, not
			// /@fs/). Route through /ns/m with a workspace-root-relative path so the
			// fetch goes through the same served-module pipeline as everything else.
			const wsRoot = getMonorepoWorkspaceRoot(projectRoot)?.replace(/\\/g, '/');
			if (wsRoot && fsPosix.startsWith(wsRoot + '/')) {
				return `/ns/m/${fsPosix.slice(wsRoot.length + 1)}`;
			}

			const normalizedRel = (relPosix.startsWith('.') ? relPosix : `/${relPosix}`).replace(/\/+/g, '/');
			clientImport = normalizedRel.startsWith('/node_modules/') ? `/ns/m${normalizedRel}` : normalizedRel;
		}
	} catch {
		clientImport = clientFsPath.replace(/\\/g, '/');
	}
	return clientImport;
}

export function resolveProjectMainEntryPath(projectRoot: string) {
	try {
		const packageJsonPath = path.join(projectRoot, 'package.json');
		const raw = fs.readFileSync(packageJsonPath, 'utf-8');
		const parsed = JSON.parse(raw) as { main?: string };
		const mainEntry = typeof parsed.main === 'string' && parsed.main ? parsed.main : 'src/app.ts';
		const resolved = path.resolve(projectRoot, mainEntry);
		const relative = path.relative(projectRoot, resolved).replace(/\\/g, '/');
		return `/${relative}`.replace(/\/+/g, '/');
	} catch {
		return '/src/app.ts';
	}
}

export function createNsDevSessionDescriptor(options: { projectRoot: string; requestHost: string; platform: NsDevPlatform; sessionId: string; secure?: boolean; mainEntryPathname?: string }): NsDevSessionDescriptor {
	const protocol = options.secure ? 'https' : 'http';
	const wsProtocol = options.secure ? 'wss' : 'ws';
	const origin = `${protocol}://${options.requestHost}`;
	const entryPathname = options.mainEntryPathname || resolveProjectMainEntryPath(options.projectRoot);
	// Canonical (untagged) entry URL. Boot-progress instrumentation is
	// injected self-gating by the /ns/m module server (the snippet no-ops
	// once `__NS_HMR_BOOT_COMPLETE__` flips), so the entry URL needs no
	// `__ns_boot__` decoration — module identity IS the URL.
	const canonicalEntryPathname = entryPathname.startsWith('/ns/m/') ? entryPathname : `/ns/m${entryPathname.startsWith('/') ? entryPathname : `/${entryPathname}`}`;

	return {
		sessionId: options.sessionId,
		origin,
		entryUrl: `${origin}${canonicalEntryPathname}`,
		clientUrl: `${origin}/__ns_dev__/client`,
		wsUrl: `${wsProtocol}://${options.requestHost}/ns-hmr`,
		platform: options.platform,
		runtimeConfigUrl: `${origin}/ns/import-map.json`,
		hostModules: [...NS_DEFAULT_HOST_MODULES],
		features: { ...NS_DEFAULT_DEV_FEATURE_FLAGS },
	};
}

function resolveBootstrapImportUrl(origin: string, clientImport: string): string {
	const normalizedOrigin = origin.replace(/\/$/, '');
	if (!clientImport) {
		return clientImport;
	}
	if (/^(?:https?|file):\/\//i.test(clientImport)) {
		return clientImport;
	}
	if (clientImport.startsWith('/')) {
		return `${normalizedOrigin}${clientImport}`;
	}
	try {
		return new URL(clientImport, `${normalizedOrigin}/__ns_dev__/client`).toString();
	} catch {
		return clientImport;
	}
}

export function createNsDevClientBootstrapCode(options: { wsUrl: string; origin: string; clientImport: string; hotContextImport?: string; verbose?: boolean }) {
	const normalizedOrigin = options.origin.replace(/\/$/, '');
	const resolvedClientImport = resolveBootstrapImportUrl(normalizedOrigin, options.clientImport);
	const vendorBundleUrl = `${normalizedOrigin}/@nativescript/vendor.mjs`;
	const vendorBootstrapUrl = `${normalizedOrigin}/ns/m/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js`;
	const resolvedHotContextImport = resolveBootstrapImportUrl(normalizedOrigin, options.hotContextImport || '/ns/m/node_modules/@nativescript/vite/hmr/client/hot-context.js');
	const entryRuntimeUrl = `${normalizedOrigin}/ns/m/node_modules/@nativescript/vite/hmr/entry-runtime.js`;
	// Canonical, unversioned core-bridge URL (see helpers/ns-core-url.ts) — the
	// app graph already loaded this exact URL during boot, so importing it here
	// resolves to the SAME module record/realm instead of minting a new one.
	const coreBridgeUrl = `${normalizedOrigin}/ns/core`;

	return `
import { installVendorBootstrap as __nsBrowserRuntimeInstallVendorBootstrap } from ${JSON.stringify(vendorBootstrapUrl)};
import { vendorManifest as __nsBrowserRuntimeVendorManifest, __nsVendorModuleMap as __nsBrowserRuntimeVendorModuleMap } from ${JSON.stringify(vendorBundleUrl)};
import { installNsHotRegistry as __nsBrowserRuntimeInstallHotRegistry } from ${JSON.stringify(resolvedHotContextImport)};

// Install the JS hot registry FIRST: every served app module's injected
// prelude reads globalThis.__NS_HOT_REGISTRY__ at evaluation time, and this
// bootstrap is imported before the entry graph (see session-bootstrap.ts).
try {
	__nsBrowserRuntimeInstallHotRegistry();
} catch (hotErr) {
	console.warn('[ns-browser-runtime-client] failed to install hot registry', hotErr);
}

const __NS_BROWSER_RUNTIME_WS_URL__ = ${JSON.stringify(options.wsUrl)};
const __NS_BROWSER_RUNTIME_ORIGIN__ = ${JSON.stringify(options.origin)};
const __NS_BROWSER_RUNTIME_CLIENT_IMPORT__ = ${JSON.stringify(resolvedClientImport)};
const __NS_BROWSER_RUNTIME_VERBOSE__ = ${options.verbose ? 'true' : 'false'};
let __nsBrowserRuntimeHmrClientStartPromise;
let __nsBrowserRuntimeSocket;
let __nsBrowserRuntimeSocketReconnectTimer;
let __nsBrowserRuntimeDelegationTimer;
let __nsBrowserRuntimeDelegationWarningIssued = false;
let __nsBrowserRuntimeBootWaitWarningIssued = false;

function __nsBrowserRuntimeWithSocketRole(url, role) {
	try {
		const resolved = new URL(url);
		resolved.searchParams.set('ns_hmr_role', role);
		return resolved.toString();
	} catch {
		const sep = url.includes('?') ? '&' : '?';
		return url + sep + 'ns_hmr_role=' + encodeURIComponent(role);
	}
}

const __NS_BROWSER_RUNTIME_FALLBACK_WS_URL__ = __nsBrowserRuntimeWithSocketRole(__NS_BROWSER_RUNTIME_WS_URL__, 'bootstrap');
const __NS_BROWSER_RUNTIME_FULL_CLIENT_WS_URL__ = __nsBrowserRuntimeWithSocketRole(__NS_BROWSER_RUNTIME_WS_URL__, 'full');

function __nsBrowserRuntimeEnsureVendorBootstrap() {
	__nsBrowserRuntimeInstallVendorBootstrap(__nsBrowserRuntimeVendorManifest, __nsBrowserRuntimeVendorModuleMap, __NS_BROWSER_RUNTIME_VERBOSE__);
	const registry = globalThis.__nsVendorRegistry;
	if (!(registry && typeof registry.get === 'function')) {
		throw new Error('NativeScript vendor registry was not initialized');
	}
}

// Pure-JS CSS apply for the bootstrap fallback client. Prefers the HTTP
// core realm applier installed by the entry runtime
// (__NS_HMR_APPLY_CSS__), then falls back to Application.addCss through
// the vendor realm. No native CSS hook exists anymore.
function __nsBrowserRuntimeApplyCss(cssText) {
	if (typeof cssText !== 'string' || !cssText.length) {
		return false;
	}
	try {
		const applyInCoreRealm = globalThis.__NS_HMR_APPLY_CSS__;
		if (typeof applyInCoreRealm === 'function') {
			applyInCoreRealm(cssText, true);
			return true;
		}
	} catch (cssErr) {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] __NS_HMR_APPLY_CSS__ threw', cssErr);
		}
	}
	try {
		const registry = globalThis.__nsVendorRegistry;
		const coreMod = registry && typeof registry.get === 'function' ? registry.get('@nativescript/core') : null;
		const core = (coreMod && (coreMod.default || coreMod)) || coreMod;
		const Application = core && core.Application;
		if (Application && typeof Application.addCss === 'function') {
			Application.addCss(cssText);
			try {
				const rootView = typeof Application.getRootView === 'function' ? Application.getRootView() : null;
				if (rootView && typeof rootView._onCssStateChange === 'function') {
					rootView._onCssStateChange();
				}
			} catch {}
			return true;
		}
	} catch (cssErr) {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] Application.addCss fallback threw', cssErr);
		}
	}
	if (__NS_BROWSER_RUNTIME_VERBOSE__) {
		console.warn('[ns-browser-runtime-client] no CSS applier available; skipping CSS update');
	}
	return false;
}

async function __nsBrowserRuntimeInstallHttpCoreCssApplier() {
	// Monorepo / per-module core dev boots ship a minimal vendor bundle with NO
	// @nativescript/core, so neither quick applier above exists. Install the
	// same HTTP-core-realm applier the http-bootloader fallback path uses
	// (entry-runtime's installHttpCoreCssSupport): it prefers the pre-parsed
	// app.css AST (globalThis.__NS_HMR_APP_CSS_AST__), applies the seeded CSS,
	// flips __NS_HMR_HTTP_APP_CSS_APPLIED__, and installs __NS_HMR_APPLY_CSS__
	// so later live CSS edits land in the core realm the app actually uses.
	try {
		const entryRuntime = await import(${JSON.stringify(entryRuntimeUrl)});
		const installHttpCoreCssSupport = entryRuntime && entryRuntime.installHttpCoreCssSupport;
		if (typeof installHttpCoreCssSupport !== 'function') {
			if (__NS_BROWSER_RUNTIME_VERBOSE__) {
				console.warn('[ns-browser-runtime-client] entry runtime is missing installHttpCoreCssSupport; skipping CSS install');
			}
			return false;
		}
		const coreBridge = await import(${JSON.stringify(coreBridgeUrl)});
		const applier = installHttpCoreCssSupport(coreBridge, __NS_BROWSER_RUNTIME_VERBOSE__);
		if (applier && __NS_BROWSER_RUNTIME_VERBOSE__) {
			console.info('[ns-entry] app.css applied in HTTP core realm');
		}
		return !!applier;
	} catch (cssErr) {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] HTTP core realm CSS install failed', cssErr);
		}
		return false;
	}
}

async function __nsBrowserRuntimeReplaySeededCss() {
	const cssText = globalThis.__NS_HMR_APP_CSS__;
	if (typeof cssText !== 'string' || !cssText.length || globalThis.__NS_HMR_HTTP_APP_CSS_APPLIED__) {
		return;
	}
	if (__nsBrowserRuntimeApplyCss(cssText)) {
		globalThis.__NS_HMR_HTTP_APP_CSS_APPLIED__ = true;
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.info('[ns-entry] app.css applied in HTTP core realm');
		}
		return;
	}
	await __nsBrowserRuntimeInstallHttpCoreCssApplier();
}

async function __nsBrowserRuntimeFetchText(url) {
	try {
		if (typeof globalThis.fetch === 'function') {
			const res = await globalThis.fetch(url);
			return await res.text();
		}
		const Http = globalThis.Http;
		if (Http && typeof Http.getString === 'function') {
			return await Http.getString(url);
		}
	} catch (error) {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] failed to fetch text', url, error);
		}
	}
	return '';
}

async function __nsBrowserRuntimeHandleCssUpdates(msg) {
	const updates = Array.isArray(msg?.updates) ? msg.updates : [];
	if (!updates.length) {
		return;
	}
	for (const update of updates) {
		const cssPath = update?.path || update?.acceptedPath || '';
		if (!cssPath) {
			continue;
		}
		const timestamp = update?.timestamp || Date.now();
		const sep = cssPath.includes('?') ? '&' : '?';
		const url = __NS_BROWSER_RUNTIME_ORIGIN__ + cssPath + sep + 'direct=1&t=' + String(timestamp);
		const cssText = await __nsBrowserRuntimeFetchText(url);
		if (typeof cssText === 'string' && cssText.length) {
			__nsBrowserRuntimeApplyCss(cssText);
		}
	}
}

function __nsBrowserRuntimeHandleAngularUpdate() {
	const reboot = globalThis.__reboot_ng_modules__;
	if (typeof reboot !== 'function') {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] Angular reboot hook unavailable');
		}
		return;
	}
	try {
		globalThis.__NS_HMR_IMPORT_NONCE__ = (typeof globalThis.__NS_HMR_IMPORT_NONCE__ === 'number' ? globalThis.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
	} catch {}
	try {
		globalThis.__NS_DEV_RESET_IN_PROGRESS__ = true;
	} catch {}
	try {
		reboot(false);
	} finally {
		try {
			globalThis.__NS_DEV_RESET_IN_PROGRESS__ = false;
		} catch {}
	}
}

function __nsBrowserRuntimeHandleSocketMessage(msg) {
	if (!msg || typeof msg.type !== 'string') {
		return;
	}
	if (msg.type === 'ns:hmr-full-graph') {
		globalThis.__NS_HMR_BROWSER_RUNTIME_GRAPH_VERSION__ = typeof msg.version === 'number' ? msg.version : 0;
		return;
	}
	if (globalThis.__NS_HMR_BROWSER_RUNTIME_DELEGATED__) {
		return;
	}
	if (msg.type === 'ns:angular-update') {
		__nsBrowserRuntimeHandleAngularUpdate();
		return;
	}
	if (msg.type === 'ns:css-updates') {
		void __nsBrowserRuntimeHandleCssUpdates(msg);
	}
}

function __nsBrowserRuntimeScheduleReconnect() {
	if (__nsBrowserRuntimeSocketReconnectTimer) {
		return;
	}
	__nsBrowserRuntimeSocketReconnectTimer = setTimeout(() => {
		__nsBrowserRuntimeSocketReconnectTimer = null;
		__nsBrowserRuntimeConnectSocket();
	}, 1000);
}

function __nsBrowserRuntimeClearDelegationTimer() {
	if (__nsBrowserRuntimeDelegationTimer) {
		clearTimeout(__nsBrowserRuntimeDelegationTimer);
		__nsBrowserRuntimeDelegationTimer = null;
	}
}

function __nsBrowserRuntimeCloseFallbackSocket(reason) {
	__nsBrowserRuntimeClearDelegationTimer();
	const ws = __nsBrowserRuntimeSocket;
	if (ws) {
		try {
			ws.onopen = null;
			ws.onmessage = null;
			ws.onerror = null;
			ws.onclose = null;
		} catch {}
		try {
			ws.close();
		} catch {}
	}
	__nsBrowserRuntimeSocket = null;
	globalThis.__NS_HMR_BROWSER_RUNTIME_SOCKET_READY__ = false;
	if (__NS_BROWSER_RUNTIME_VERBOSE__) {
		console.info('[ns-browser-runtime-client] delegated to full HMR client; closing bootstrap fallback socket', reason || 'delegated');
	}
}

function __nsBrowserRuntimeWaitForDelegation(startedAt) {
	if (globalThis.__NS_HMR_BROWSER_RUNTIME_DELEGATED__) {
		__nsBrowserRuntimeClearDelegationTimer();
		return;
	}
	if (globalThis.__NS_HMR_CLIENT_SOCKET_READY__) {
		globalThis.__NS_HMR_BROWSER_RUNTIME_DELEGATED__ = true;
		__nsBrowserRuntimeCloseFallbackSocket('full-client-ready');
		return;
	}
	if (!__nsBrowserRuntimeDelegationWarningIssued && Date.now() - startedAt >= 10000) {
		__nsBrowserRuntimeDelegationWarningIssued = true;
		// Verbose-only: the 10s threshold trips on every real Angular
		// cold boot. The bootstrap fallback keeps running; the message
		// is diagnostic, not actionable.
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] full HMR client did not confirm websocket readiness; keeping bootstrap fallback active');
		}
		__nsBrowserRuntimeClearDelegationTimer();
		return;
	}
	__nsBrowserRuntimeDelegationTimer = setTimeout(() => {
		__nsBrowserRuntimeDelegationTimer = null;
		__nsBrowserRuntimeWaitForDelegation(startedAt);
	}, 100);
}

function __nsBrowserRuntimeTrackDelegation() {
	if (globalThis.__NS_HMR_BROWSER_RUNTIME_DELEGATED__) {
		return;
	}
	__nsBrowserRuntimeDelegationWarningIssued = false;
	__nsBrowserRuntimeClearDelegationTimer();
	__nsBrowserRuntimeWaitForDelegation(Date.now());
}

function __nsBrowserRuntimeConnectSocket() {
	const WebSocketCtor = globalThis.WebSocket;
	if (typeof WebSocketCtor !== 'function') {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] WebSocket API unavailable');
		}
		__nsBrowserRuntimeScheduleReconnect();
		return;
	}
	try {
		if (__nsBrowserRuntimeSocket) {
			const readyState = __nsBrowserRuntimeSocket.readyState;
			const openState = typeof __nsBrowserRuntimeSocket.OPEN === 'number' ? __nsBrowserRuntimeSocket.OPEN : 1;
			const connectingState = typeof WebSocketCtor.CONNECTING === 'number' ? WebSocketCtor.CONNECTING : 0;
			if (readyState === openState || readyState === connectingState) {
				return;
			}
		}
		const ws = new WebSocketCtor(__NS_BROWSER_RUNTIME_FALLBACK_WS_URL__);
		__nsBrowserRuntimeSocket = ws;
		ws.onopen = () => {
			globalThis.__NS_HMR_BROWSER_RUNTIME_SOCKET_READY__ = true;
			if (__NS_BROWSER_RUNTIME_VERBOSE__) {
				console.info('[ns-browser-runtime-client] connected', __NS_BROWSER_RUNTIME_FALLBACK_WS_URL__);
			}
		};
		ws.onmessage = (event) => {
			try {
				const raw = typeof event?.data === 'string' ? event.data : String(event?.data || '');
				if (!raw) {
					return;
				}
				__nsBrowserRuntimeHandleSocketMessage(JSON.parse(raw));
			} catch (error) {
				if (__NS_BROWSER_RUNTIME_VERBOSE__) {
					console.warn('[ns-browser-runtime-client] failed to process websocket message', error);
				}
			}
		};
		ws.onerror = (error) => {
			if (__NS_BROWSER_RUNTIME_VERBOSE__) {
				console.warn('[ns-browser-runtime-client] websocket error', error);
			}
		};
		ws.onclose = () => {
			if (__nsBrowserRuntimeSocket === ws) {
				__nsBrowserRuntimeSocket = null;
			}
			globalThis.__NS_HMR_BROWSER_RUNTIME_SOCKET_READY__ = false;
			__nsBrowserRuntimeScheduleReconnect();
		};
	} catch (error) {
		console.warn('[ns-browser-runtime-client] failed to create websocket', error);
		__nsBrowserRuntimeScheduleReconnect();
	}
}

async function __nsBrowserRuntimeEnsureFullClientStarted() {
	if (!__nsBrowserRuntimeHmrClientStartPromise) {
		__nsBrowserRuntimeHmrClientStartPromise = import(__NS_BROWSER_RUNTIME_CLIENT_IMPORT__)
			.then((mod) => {
				const start = mod?.default;
				if (typeof start !== 'function') {
					throw new Error('NativeScript HMR client bootstrap is missing a default export');
				}
				start({ wsUrl: __NS_BROWSER_RUNTIME_FULL_CLIENT_WS_URL__ });
				__nsBrowserRuntimeTrackDelegation();
			})
			.catch((error) => {
				globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__ = false;
				console.error('[ns-browser-runtime-client] failed to start full NativeScript HMR client', __NS_BROWSER_RUNTIME_CLIENT_IMPORT__, error);
				throw error;
			});
	}
	return __nsBrowserRuntimeHmrClientStartPromise;
}

__nsBrowserRuntimeEnsureVendorBootstrap();


if (!globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__) {
	globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__ = true;
	globalThis.__NS_HTTP_ORIGIN__ = __NS_BROWSER_RUNTIME_ORIGIN__;
	__nsBrowserRuntimeConnectSocket();
	const __nsBrowserRuntimeBootWaitStartedAt = Date.now();
	const __nsBrowserRuntimeWaitForBoot = () => {
		if (globalThis.__NS_HMR_BOOT_COMPLETE__) {
			if (__NS_BROWSER_RUNTIME_VERBOSE__) {
				console.info('[ns-browser-runtime-client] boot complete observed; starting full HMR client');
			}
			void __nsBrowserRuntimeReplaySeededCss();
			void __nsBrowserRuntimeEnsureFullClientStarted();
		} else {
			if (!__nsBrowserRuntimeBootWaitWarningIssued && Date.now() - __nsBrowserRuntimeBootWaitStartedAt >= 10000) {
				__nsBrowserRuntimeBootWaitWarningIssued = true;
				// Verbose-only: real Angular cold boots routinely take
				// 15-30s through importing-main. The poller keeps watching
				// __NS_HMR_BOOT_COMPLETE__; until it flips this looks like
				// an error to users but is purely informational.
				// (No backticks: this script body is embedded in a template
				// literal in vite-plugin.ts.)
				if (__NS_BROWSER_RUNTIME_VERBOSE__) {
					console.warn('[ns-browser-runtime-client] boot completion was not observed; full HMR client start is still pending');
				}
			}
			setTimeout(__nsBrowserRuntimeWaitForBoot, 100);
		}
	};
	__nsBrowserRuntimeWaitForBoot();
}
`;
}

export function nsHmrClientVitePlugin(opts: { platform: NsDevPlatform; verbose?: boolean }): Plugin {
	let config: ResolvedConfig | undefined;
	const sessionId = new Date().toISOString();

	return {
		name: 'ns-hmr-client',
		configResolved(c) {
			config = c;
			// Capture app-configured `__FOO__` defines so HMR-served modules get a
			// const shim for them (Vite's text-substitution doesn't reach raw-served
			// modules; without a shim a free `__FOO__` is mis-bound to /ns/rt → wrong
			// value under HMR vs the production bundle). See setUserDefineEntries.
			setUserDefineEntries(c.define as Record<string, unknown> | undefined);
		},
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				try {
					const url = new URL(req.url || '', 'http://localhost');
					if (url.pathname === '/__ns_dev__/client') {
						const requestHost = String(req.headers.host || 'localhost:5173');
						const secure = !!config?.server?.https;
						const origin = `${secure ? 'https' : 'http'}://${requestHost}`;
						const wsUrl = `${secure ? 'wss' : 'ws'}://${requestHost}/ns-hmr`;
						const clientFsPath = require.resolve('@nativescript/vite/hmr/client/index.js');
						const projectRoot = config?.root || process.cwd();
						const clientImport = computeClientImportSpecifier({ projectRoot, clientFsPath });
						let hotContextImport: string | undefined;
						try {
							const hotContextFsPath = require.resolve('@nativescript/vite/hmr/client/hot-context.js');
							hotContextImport = computeClientImportSpecifier({ projectRoot, clientFsPath: hotContextFsPath });
						} catch {}
						const code = createNsDevClientBootstrapCode({
							origin,
							wsUrl,
							clientImport,
							hotContextImport,
							verbose: opts.verbose,
						});

						res.setHeader('Access-Control-Allow-Origin', '*');
						res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
						if (req.method === 'OPTIONS') {
							res.statusCode = 204;
							res.end();
							return;
						}

						res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
						res.end(code);
						return;
					}
					if (url.pathname !== '/__ns_dev__/session') return next();

					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
					if (req.method === 'OPTIONS') {
						res.statusCode = 204;
						res.end();
						return;
					}

					const descriptor = createNsDevSessionDescriptor({
						projectRoot: config?.root || process.cwd(),
						requestHost: String(req.headers.host || 'localhost:5173'),
						platform: opts.platform,
						sessionId,
						secure: !!config?.server?.https,
					});

					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(descriptor, null, 2));
				} catch (error: any) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: error?.message || 'Failed to build NativeScript dev session descriptor' }));
				}
			});
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;

			/**
			 * Use a POSIX-style import specifier for the client entry to avoid
			 * Windows drive-letter paths (e.g. "D:\\...") accidentally
			 * becoming bare import ids that Rollup/Vite cannot resolve.
			 * We still resolve the real filesystem path for correctness, but convert it to a project-relative POSIX path before interpolating it into the generated module.
			 **/
			const clientFsPath = require.resolve('@nativescript/vite/hmr/client/index.js');
			// Prefer project root when available; otherwise fall back to cwd.
			const projectRoot = config?.root || process.cwd();
			const clientImport = computeClientImportSpecifier({ projectRoot, clientFsPath });

			// Build ws url from Vite server info. Routes through the same
			// canonical helper as `main-entry.ts` / `base.ts` so the
			// websocket endpoint embedded in `bundle.mjs` and every other
			// `/ns/*` URL share one origin string — required by the iOS
			// HTTP ESM cache identity rule, and necessary for Android
			// emulators that can't reach `0.0.0.0` / `localhost`.
			const port = Number(config?.server?.port || 5173);
			// Pass `port` through so the Android emulator path attempts
			// `adb reverse tcp:<port> tcp:<port>` before falling back to
			// `10.0.2.2`. The websocket URL and bundle.mjs URLs both
			// flow from this same helper, so they stay byte-identical
			// (required by the iOS HTTP ESM cache identity rule).
			const { host } = resolveDeviceReachableHost({
				host: config?.server?.host,
				platform: opts.platform,
				port,
			});
			const secure = !!config?.server?.https;
			const protocol = secure ? 'wss' : 'ws';
			const wsUrl = `${protocol}://${host}:${port}/ns-hmr`;

			// Import client and start it with explicit ws URL
			const banner = opts.verbose ? `console.log('[ns-hmr-client] starting client -> ${wsUrl} (HTTP loader enabled via __NS_HTTP_ORIGIN__)');` : '';
			return {
				code: `
import startViteHMR from "${clientImport}";
${banner}
startViteHMR({ wsUrl: ${JSON.stringify(wsUrl)} });
`,
				moduleType: 'js',
			};
		},
	};
}
