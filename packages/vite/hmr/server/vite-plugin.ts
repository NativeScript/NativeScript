import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import fs from 'node:fs';
import path from 'path';
import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, VITE_HMR_WS_PROTOCOL, type NsDevPlatform, type NsDevSessionDescriptor } from '../shared/runtime/browser-runtime-contract.js';
import type { NsHmrStartOptions } from '../client/index.js';
import { setUserDefineEntries } from '../../helpers/global-defines.js';
import { NS_DEV_EXPR } from '../shared/runtime/dev-globals.js';
import { thinDeviceUrl, viteUrlForFile } from './thin/thin-mode.js';
import { registerThinRoute } from './thin/thin-route.js';
import { getServerOrigin } from './server-origin.js';
import { fileURLToPath } from 'node:url';

const runtimeFile = (relToHmrServer: string) => fileURLToPath(new URL(relToHmrServer, import.meta.url));

async function resolveCoreEntryFile(server: ViteDevServer): Promise<string> {
	const resolvedCore = await server.environments.client.pluginContainer.resolveId('@nativescript/core', path.join(server.config.root, 'index.html'));
	// Use the resolver's id verbatim (no realpath): it is what Vite's import
	// analysis serves, symlinked or not (the CLI runs with --preserve-symlinks).
	const coreFile = resolvedCore?.id?.split('?')[0];
	if (!coreFile) {
		throw new Error('Unable to resolve @nativescript/core from the project root');
	}
	return coreFile;
}

/**
 * Vite URL prefixes of the packages that evaluate once per process even when
 * they are served from outside `node_modules` (`/@fs/…`): `@nativescript/core`
 * and this package's dev client. An edit under them restarts the app
 * (`hmr/server/app-restart.ts`).
 */
export async function resolveNonEvictableViteUrlPrefixes(server: ViteDevServer): Promise<string[]> {
	const root = server.config.root;
	const coreFile = await resolveCoreEntryFile(server);
	return [`${viteUrlForFile(corePackageDir(coreFile), root)}/`, `${viteUrlForFile(runtimeFile('../../'), root)}/`];
}

async function resolveThinBootstrapUrls(server: ViteDevServer, origin: string): Promise<{ client: string; moduleUrls: NsDevBootstrapModuleUrls }> {
	const root = server.config.root;
	const urlFor = (file: string) => thinDeviceUrl(origin, viteUrlForFile(file, root));
	const coreFile = await resolveCoreEntryFile(server);
	return {
		client: urlFor(runtimeFile('../client/index.js')),
		moduleUrls: {
			vendorBootstrap: urlFor(runtimeFile('../shared/runtime/vendor-bootstrap.js')),
			entryRuntime: urlFor(runtimeFile('../entry-runtime.js')),
			launchBridge: urlFor(runtimeFile('../shared/runtime/launch-bridge.js')),
			coreBridge: urlFor(coreFile),
		},
	};
}

/** The `@nativescript/core` package directory of its resolved entry file. */
export function corePackageDir(coreFile: string): string {
	const posix = coreFile.replace(/\\/g, '/');
	const marker = '/@nativescript/core/';
	const at = posix.lastIndexOf(marker);
	return at >= 0 ? posix.slice(0, at + marker.length - 1) : path.posix.dirname(posix);
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

type WsOptionsLike = { path?: string; port?: number; clientPort?: number };

export type ViteHmrWsConfig = Pick<ResolvedConfig, 'base' | 'webSocketToken'> & { server: Pick<ResolvedConfig['server'], 'port' | 'hmr'> & { ws?: unknown } };

/**
 * Vite's HMR WebSocket URL for the device: `base` + the ws path, on the ws
 * port when it differs from the server's, with the token Vite checks whenever
 * the upgrade carries an `Origin` header (the Android socket sends one).
 * Vite 8.0 reads these options from `server.hmr`; later 8.x releases from
 * `server.ws`.
 */
export function resolveViteHmrWsUrl(origin: string, config: ViteHmrWsConfig): string {
	const isObject = (value: unknown): value is WsOptionsLike => !!value && typeof value === 'object';
	const server = config.server;
	const wsOptions = isObject(server.ws) ? server.ws : isObject(server.hmr) ? server.hmr : undefined;
	const url = new URL(origin);
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
	const wsPort = wsOptions?.clientPort || wsOptions?.port;
	if (wsPort && wsPort !== server.port) {
		url.port = String(wsPort);
	}
	url.pathname = path.posix.join(config.base || '/', wsOptions?.path || '');
	url.search = config.webSocketToken ? `?token=${encodeURIComponent(config.webSocketToken)}` : '';
	return url.toString();
}

export function createNsDevSessionDescriptor(options: { projectRoot: string; origin: string; wsUrl: string; platform: NsDevPlatform; sessionId: string; mainEntryPathname?: string }): NsDevSessionDescriptor {
	const origin = options.origin.replace(/\/$/, '');
	const entryPathname = options.mainEntryPathname || resolveProjectMainEntryPath(options.projectRoot);

	return {
		sessionId: options.sessionId,
		origin,
		entryUrl: thinDeviceUrl(origin, entryPathname),
		clientUrl: `${origin}/__ns_dev__/client`,
		wsUrl: options.wsUrl,
		wsProtocol: VITE_HMR_WS_PROTOCOL,
		platform: options.platform,
		runtimeConfigUrl: `${origin}/ns/import-map.json`,
		hostModules: [...NS_DEFAULT_HOST_MODULES],
		features: { ...NS_DEFAULT_DEV_FEATURE_FLAGS },
	};
}

/** Absolute device URLs for the bootstrap's own imports. */
export interface NsDevBootstrapModuleUrls {
	vendorBootstrap: string;
	entryRuntime: string;
	/** The `@nativescript/core` entry at the URL the app graph loads it from, so the bootstrap shares its module record. */
	coreBridge: string;
	launchBridge: string;
}

export function createNsDevClientBootstrapCode(options: { origin: string; clientImport: string; verbose?: boolean; moduleUrls: NsDevBootstrapModuleUrls; start: NsHmrStartOptions }) {
	const normalizedOrigin = options.origin.replace(/\/$/, '');
	const urls = options.moduleUrls;
	const verbose = options.verbose ? 'true' : 'false';

	return `
import { installVendorBootstrap as __nsInstallVendorBootstrap } from ${JSON.stringify(urls.vendorBootstrap)};
import { vendorManifest as __nsVendorManifest, __nsVendorModuleMap } from ${JSON.stringify(`${normalizedOrigin}/@nativescript/vendor.mjs`)};
import { installLaunchNotificationBridge as __nsInstallLaunchBridge } from ${JSON.stringify(urls.launchBridge)};
import * as __nsCoreBridge from ${JSON.stringify(urls.coreBridge)};
import { installHttpCoreCssSupport as __nsInstallHttpCoreCssSupport } from ${JSON.stringify(urls.entryRuntime)};

// Seeded app.css must land in the core realm before the app entry
// evaluates, as it does in non-HMR builds. Views mounted unstyled are
// restyled later, but anything that caches measurements on first layout
// (iOS ListView row heights) keeps the unstyled sizes.
try {
	__nsInstallHttpCoreCssSupport(__nsCoreBridge, ${verbose});
} catch (cssErr) {
	console.warn('[ns-dev-client] pre-entry app.css install failed', cssErr);
}

// The session bootstrap imports this module before the app entry, which makes
// it the one deterministic point to wrap Application's launch observers
// (see shared/runtime/launch-bridge.ts).
try {
	const __nsCoreNs = __nsCoreBridge && (__nsCoreBridge.default ?? __nsCoreBridge);
	__nsInstallLaunchBridge(__nsCoreNs && __nsCoreNs.Application);
} catch (launchBridgeErr) {
	console.warn('[ns-dev-client] launch-notification bridge install failed', launchBridgeErr);
}

__nsInstallVendorBootstrap(__nsVendorManifest, __nsVendorModuleMap, ${verbose});
if (!(globalThis.__nsVendorRegistry && typeof globalThis.__nsVendorRegistry.get === 'function')) {
	throw new Error('NativeScript vendor registry was not initialized');
}

const __nsHmrClientUrl = ${JSON.stringify(options.clientImport)};
const __nsHmrStartOptions = ${JSON.stringify(options.start)};
const __nsDev = ${NS_DEV_EXPR};

// The HMR socket opens only once the app has booted: socket traffic racing
// the boot-time module fetches has crashed the native runtime.
function __nsStartHmrClientAfterBoot() {
	if (!__nsDev.bootComplete) {
		setTimeout(__nsStartHmrClientAfterBoot, 100);
		return;
	}
	import(__nsHmrClientUrl)
		.then((mod) => mod.start(__nsHmrStartOptions))
		.catch((error) => console.error('[ns-dev-client] failed to start the HMR client', __nsHmrClientUrl, error));
}
__nsStartHmrClientAfterBoot();
`;
}

function sendCorsPreflight(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse): boolean {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	if (req.method === 'OPTIONS') {
		res.statusCode = 204;
		res.end();
		return true;
	}
	return false;
}

// The device keeps the `wsUrl` (and its `?token=`) it booted with, while
// `server.restart()` resolves a new config with a new random token. This
// module stays loaded across restarts, so it pins one token per process.
let processWebSocketToken: string | undefined;

/** Gives every config resolved in this process the first one's `webSocketToken`. */
export function pinWebSocketToken(config: { webSocketToken: string }): void {
	processWebSocketToken ??= config.webSocketToken;
	config.webSocketToken = processWebSocketToken;
}

export function nsHmrClientVitePlugin(opts: { platform: NsDevPlatform; verbose?: boolean }): Plugin {
	let config: ResolvedConfig | undefined;
	const sessionId = new Date().toISOString();

	return {
		name: 'ns-hmr-client',
		configResolved(c) {
			config = c;
			// Vite checks upgrades against `config.webSocketToken` of the config
			// it hands to `configResolved`, so pinning it here is what it uses.
			if (c.command === 'serve') pinWebSocketToken(c as { webSocketToken: string });
			// Capture app-configured `__FOO__` defines for the dev deps bundle,
			// which esbuild builds outside Vite's define substitution. See
			// setUserDefineEntries.
			setUserDefineEntries(c.define as Record<string, unknown> | undefined);
		},
		configureServer(server) {
			// One origin for every URL handed to the device: the one bundle.mjs
			// was built with, never the request's Host header.
			const getOrigin = () => getServerOrigin(server);
			registerThinRoute(server, getOrigin);
			server.middlewares.use(async (req, res, next) => {
				try {
					const url = new URL(req.url || '', 'http://localhost');
					if (url.pathname === '/__ns_dev__/client') {
						if (sendCorsPreflight(req, res)) return;
						const origin = getOrigin();
						const session = createNsDevSessionDescriptor({
							projectRoot: server.config.root,
							origin,
							wsUrl: resolveViteHmrWsUrl(origin, server.config),
							platform: opts.platform,
							sessionId,
						});
						const thin = await resolveThinBootstrapUrls(server, origin);
						const code = createNsDevClientBootstrapCode({
							origin,
							clientImport: thin.client,
							verbose: opts.verbose,
							moduleUrls: thin.moduleUrls,
							start: {
								wsUrl: session.wsUrl,
								wsProtocol: session.wsProtocol,
								entryUrl: session.entryUrl,
								origin: session.origin,
								root: server.config.root,
							},
						});
						res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
						res.end(code);
						return;
					}
					if (url.pathname !== '/__ns_dev__/session') return next();
					if (sendCorsPreflight(req, res)) return;

					const origin = getOrigin();
					const descriptor = createNsDevSessionDescriptor({
						projectRoot: config?.root || process.cwd(),
						origin,
						wsUrl: resolveViteHmrWsUrl(origin, server.config),
						platform: opts.platform,
						sessionId,
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
	};
}
