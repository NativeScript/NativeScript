import type { Plugin, ResolvedConfig } from 'vite';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';
import type { NsDevPlatform, NsDevSessionDescriptor } from '../shared/runtime/browser-runtime-contract.js';
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
			clientImport = (relPosix.startsWith('.') ? relPosix : `/${relPosix}`).replace(/\/+/g, '/');
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
		hostModules: ['ns-host://runtime', 'ns-host://style-adapter'],
		features: {
			fullReload: true,
			cssHmr: true,
		},
	};
}

export function createNsDevClientBootstrapCode(options: { wsUrl: string; origin: string; verbose?: boolean }) {
	const normalizedOrigin = options.origin.replace(/\/$/, '');
	const vendorBundleUrl = `${normalizedOrigin}/@nativescript/vendor.mjs`;
	const vendorBootstrapUrl = `${normalizedOrigin}/ns/m/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js`;

	return `
import { installVendorBootstrap as __nsBrowserRuntimeInstallVendorBootstrap } from ${JSON.stringify(vendorBootstrapUrl)};
import { vendorManifest as __nsBrowserRuntimeVendorManifest, __nsVendorModuleMap as __nsBrowserRuntimeVendorModuleMap } from ${JSON.stringify(vendorBundleUrl)};

const __NS_BROWSER_RUNTIME_WS_URL__ = ${JSON.stringify(options.wsUrl)};
const __NS_BROWSER_RUNTIME_ORIGIN__ = ${JSON.stringify(options.origin)};
const __NS_BROWSER_RUNTIME_VERBOSE__ = ${options.verbose ? 'true' : 'false'};
const __NS_BROWSER_RUNTIME_VENDOR_BUNDLE_URL__ = ${JSON.stringify(vendorBundleUrl)};
const __NS_BROWSER_RUNTIME_VENDOR_BOOTSTRAP_URL__ = ${JSON.stringify(vendorBootstrapUrl)};

function __nsBrowserRuntimeLog(...args) {
	if (__NS_BROWSER_RUNTIME_VERBOSE__) {
		console.log(...args);
	}
}

function __nsBrowserRuntimeEnsureVendorBootstrap(reason) {
	__nsBrowserRuntimeLog('[ns-browser-runtime-client] applying vendor bootstrap', __NS_BROWSER_RUNTIME_VENDOR_BUNDLE_URL__);
	__nsBrowserRuntimeInstallVendorBootstrap(__nsBrowserRuntimeVendorManifest, __nsBrowserRuntimeVendorModuleMap, __NS_BROWSER_RUNTIME_VERBOSE__);
	const registry = globalThis.__nsVendorRegistry;
	if (!(registry && typeof registry.get === 'function')) {
		throw new Error('NativeScript vendor registry was not initialized');
	}
	globalThis.__NS_HMR_BROWSER_RUNTIME_VENDOR_READY__ = true;
	globalThis.__NS_HMR_BROWSER_RUNTIME_VENDOR_HASH__ = __nsBrowserRuntimeVendorManifest?.hash ?? null;
	__nsBrowserRuntimeLog('[ns-browser-runtime-client] vendor bootstrap ready', {
		reason,
		hash: __nsBrowserRuntimeVendorManifest?.hash ?? null,
		modules: Object.keys(__nsBrowserRuntimeVendorModuleMap || {}).length,
	});
}

async function __nsBrowserRuntimeFetchText(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('CSS fetch failed: ' + response.status + ' for ' + url);
	}
	return await response.text();
}

async function __nsBrowserRuntimeApplyCssUpdates(updates) {
	for (const update of Array.isArray(updates) ? updates : []) {
		const cssPath = update?.path || update?.acceptedPath || '';
		if (!cssPath) continue;
		const timestamp = update?.timestamp || Date.now();
		const separator = cssPath.includes('?') ? '&' : '?';
		const url = __NS_BROWSER_RUNTIME_ORIGIN__ + cssPath + separator + 'direct=1&t=' + String(timestamp);
		const cssText = await __nsBrowserRuntimeFetchText(url);
		const apply = globalThis.__nsApplyStyleUpdate;
		if (typeof apply !== 'function') {
			throw new Error('__nsApplyStyleUpdate is unavailable');
		}
		apply({ url, cssText });
	}
}

async function __nsBrowserRuntimeReload(reason) {
	__nsBrowserRuntimeEnsureVendorBootstrap(reason);
	const reload = globalThis.__nsReloadDevApp;
	if (typeof reload !== 'function') {
		throw new Error('__nsReloadDevApp is unavailable for ' + reason);
	}
	await reload();
}

let __nsBrowserRuntimeInitialGraphSeen = false;
let __nsBrowserRuntimeSocket;

function __nsBrowserRuntimeConnect() {
	if (__nsBrowserRuntimeSocket) {
		const readyState = __nsBrowserRuntimeSocket.readyState;
		if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
			return;
		}
	}

	__nsBrowserRuntimeLog('[ns-browser-runtime-client] connecting', __NS_BROWSER_RUNTIME_WS_URL__);
	__nsBrowserRuntimeSocket = new WebSocket(__NS_BROWSER_RUNTIME_WS_URL__);
	__nsBrowserRuntimeSocket.onopen = () => {
		__nsBrowserRuntimeLog('[ns-browser-runtime-client] connected', __NS_BROWSER_RUNTIME_WS_URL__);
	};
	__nsBrowserRuntimeSocket.onmessage = async (event) => {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}

		switch (message?.type) {
			case 'ns:css-updates':
				await __nsBrowserRuntimeApplyCssUpdates(message.updates);
				return;
			case 'ns:hmr-full-graph':
				if (!__nsBrowserRuntimeInitialGraphSeen) {
					__nsBrowserRuntimeInitialGraphSeen = true;
					__nsBrowserRuntimeLog('[ns-browser-runtime-client] initial graph ready');
					return;
				}
				await __nsBrowserRuntimeReload('ns:hmr-full-graph');
				return;
			case 'ns:hmr-delta':
				__nsBrowserRuntimeInitialGraphSeen = true;
				await __nsBrowserRuntimeReload('ns:hmr-delta');
				return;
			case 'ns:angular-update':
			case 'ns:vue-sfc-registry-update':
			case 'full-reload':
				await __nsBrowserRuntimeReload(message.type);
				return;
			case 'error':
				console.error('[ns-browser-runtime-client] error payload', message.err || message);
				return;
			default:
				return;
		}
	};

	__nsBrowserRuntimeSocket.onerror = (error) => {
		console.warn('[ns-browser-runtime-client] websocket error', (error && (error.message || error)) || error);
	};
	__nsBrowserRuntimeSocket.onclose = () => {
		console.warn('[ns-browser-runtime-client] websocket closed; reconnecting', __NS_BROWSER_RUNTIME_WS_URL__);
		setTimeout(__nsBrowserRuntimeConnect, 1000);
	};
}

__nsBrowserRuntimeEnsureVendorBootstrap('session-start');


if (!globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__) {
	globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__ = true;
	globalThis.__NS_HTTP_ORIGIN__ = __NS_BROWSER_RUNTIME_ORIGIN__;
	const __nsBrowserRuntimeWaitForBoot = () => {
		if (globalThis.__NS_HMR_BOOT_COMPLETE__) {
			__nsBrowserRuntimeConnect();
		} else {
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
						const code = createNsDevClientBootstrapCode({
							origin,
							wsUrl,
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
