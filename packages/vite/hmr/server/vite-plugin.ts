import type { Plugin, ResolvedConfig } from 'vite';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';
import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, type NsDevPlatform, type NsDevSessionDescriptor } from '../shared/runtime/browser-runtime-contract.js';
const require = createRequire(import.meta.url);

const VIRTUAL_ID = 'virtual:ns-hmr-client';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export function computeClientImportSpecifier(options: { projectRoot: string; clientFsPath: string }) {
	const { projectRoot, clientFsPath } = options;
	let clientImport = clientFsPath;
	try {
		const rel = path.relative(projectRoot, clientFsPath);
		const relPosix = rel.replace(/\\/g, '/');

		if (path.isAbsolute(rel)) {
			clientImport = pathToFileURL(clientFsPath).toString();
		} else {
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
	const mirroredEntryPathname = entryPathname.startsWith('/ns/m/') ? entryPathname : `/ns/m${entryPathname.startsWith('/') ? entryPathname : `/${entryPathname}`}`;

	return {
		sessionId: options.sessionId,
		origin,
		entryUrl: `${origin}${mirroredEntryPathname}`,
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

export function createNsDevClientBootstrapCode(options: { wsUrl: string; origin: string; clientImport: string; verbose?: boolean }) {
	const normalizedOrigin = options.origin.replace(/\/$/, '');
	const resolvedClientImport = resolveBootstrapImportUrl(normalizedOrigin, options.clientImport);
	const vendorBundleUrl = `${normalizedOrigin}/@nativescript/vendor.mjs`;
	const vendorBootstrapUrl = `${normalizedOrigin}/ns/m/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js`;

	return `
import { installVendorBootstrap as __nsBrowserRuntimeInstallVendorBootstrap } from ${JSON.stringify(vendorBootstrapUrl)};
import { vendorManifest as __nsBrowserRuntimeVendorManifest, __nsVendorModuleMap as __nsBrowserRuntimeVendorModuleMap } from ${JSON.stringify(vendorBundleUrl)};

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

async function __nsBrowserRuntimeReplaySeededCss() {
	const cssText = globalThis.__NS_HMR_APP_CSS__;
	if (typeof cssText !== 'string' || !cssText.length || globalThis.__NS_HMR_HTTP_APP_CSS_APPLIED__) {
		return;
	}
	const apply = globalThis.__nsApplyStyleUpdate;
	if (typeof apply !== 'function') {
		if (__NS_BROWSER_RUNTIME_VERBOSE__) {
			console.warn('[ns-browser-runtime-client] __nsApplyStyleUpdate is unavailable; skipping seeded app.css replay');
		}
		return;
	}
	const cssUrl = __NS_BROWSER_RUNTIME_ORIGIN__ + '/src/app.css?direct=1&t=' + String(Date.now());
	apply({ url: cssUrl, cssText });
	globalThis.__NS_HMR_HTTP_APP_CSS_APPLIED__ = true;
	if (__NS_BROWSER_RUNTIME_VERBOSE__) {
		console.info('[ns-entry] app.css applied in HTTP core realm');
	}
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
	const apply = globalThis.__nsApplyStyleUpdate;
	if (!updates.length || typeof apply !== 'function') {
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
			apply({ url, cssText });
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
	console.info('[ns-browser-runtime-client] delegated to full HMR client; closing bootstrap fallback socket', reason || 'delegated');
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
		console.warn('[ns-browser-runtime-client] full HMR client did not confirm websocket readiness; keeping bootstrap fallback active');
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
				console.warn('[ns-browser-runtime-client] boot completion was not observed; full HMR client start is still pending');
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

	const guessLanHost = (): string | undefined => {
		try {
			const nets = os.networkInterfaces();
			for (const name of Object.keys(nets)) {
				const addrs = nets[name] || [];
				for (const a of addrs) {
					if (!a) continue;
					// Node typings vary across versions; keep checks defensive
					const family = (a as any).family;
					const internal = !!(a as any).internal;
					const address = String((a as any).address || '');
					if (internal) continue;
					if (family === 'IPv4' || family === 4) {
						if (address && address !== '127.0.0.1') return address;
					}
				}
			}
		} catch {}
		return undefined;
	};

	return {
		name: 'ns-hmr-client',
		configResolved(c) {
			config = c;
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
						const code = createNsDevClientBootstrapCode({
							origin,
							wsUrl,
							clientImport,
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

			// Build ws url from Vite server info
			let host = process.env.NS_HMR_HOST || (config?.server?.host as any);
			// If Vite is bound to all interfaces, prefer a LAN IP so physical devices work.
			// The HMR client will still try emulator/localhost fallbacks when needed.
			const hostStr = typeof host === 'string' ? host : '';
			const isWildcard = host === true || hostStr === '0.0.0.0' || hostStr === '::' || hostStr === '';
			if (isWildcard) {
				host = guessLanHost() || (opts.platform === 'android' ? '10.0.2.2' : 'localhost');
			} else if (!host) {
				host = opts.platform === 'android' ? guessLanHost() || '10.0.2.2' : 'localhost';
			}
			const port = Number(config?.server?.port || 5173);
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
