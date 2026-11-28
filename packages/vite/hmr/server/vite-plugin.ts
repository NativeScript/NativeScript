import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import fs from 'node:fs';
import net from 'node:net';
import path from 'path';
import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, VITE_HMR_WS_PROTOCOL, type NsDevPlatform, type NsDevSessionDescriptor } from '../shared/runtime/browser-runtime-contract.js';
import type { NsHmrStartOptions } from '../client/index.js';
import { deviceUrlForGraphUrl, viteUrlForFile } from './vite-url.js';
import { IMPORT_MAP_PATH, NS_DEV_SESSION_PATH } from './dev-routes.js';
import { registerDevBootRoutes } from './dev-boot-routes.js';
import { createDeviceRequestMiddleware, useFirst } from './device-requests.js';
import { getServerOrigin } from './server-origin.js';
import { devWsTokenFile, publishDevWsToken } from '../../helpers/dev-ws-token.js';
import { devServerAddressOf } from '../../helpers/ns-cli-plugins.js';
import { DEV_BOOT_RESOLVED } from '../../helpers/dev-boot-bundle.js';
import { startDevOutput, type DevOutputOptions } from './dev-output.js';
import { fileURLToPath } from 'node:url';

const runtimeFile = (relToHmrServer: string) => fileURLToPath(new URL(relToHmrServer, import.meta.url));

/** This package's directory (`@nativescript/vite`), as the running copy is installed. */
export const nsVitePackageDir = (): string => runtimeFile('../../');

/** The `@nativescript/core` entry file as the client environment resolves it. */
export async function resolveCoreEntryFile(server: Pick<ViteDevServer, 'config' | 'environments'>): Promise<string> {
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
	return [`${viteUrlForFile(corePackageDir(coreFile), root)}/`, `${viteUrlForFile(nsVitePackageDir(), root)}/`];
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

export { NS_DEV_SESSION_PATH };

const NS_DEV_CLIENT_ID = 'virtual:ns-dev-client';
const NS_DEV_CLIENT_RESOLVED = '\0' + NS_DEV_CLIENT_ID;
/** The root-relative URL the device requests the dev client bootstrap under. */
export const NS_DEV_CLIENT_DEVICE_PATH = deviceUrlForGraphUrl(NS_DEV_CLIENT_RESOLVED);

export function createNsDevSessionDescriptor(options: { projectRoot: string; origin: string; wsUrl: string; platform: NsDevPlatform; sessionId: string; mainEntryPathname?: string }): NsDevSessionDescriptor {
	const origin = options.origin.replace(/\/$/, '');
	const entryPathname = options.mainEntryPathname || resolveProjectMainEntryPath(options.projectRoot);

	return {
		sessionId: options.sessionId,
		origin,
		entryUrl: `${origin}${entryPathname}`,
		clientUrl: `${origin}${NS_DEV_CLIENT_DEVICE_PATH}`,
		wsUrl: options.wsUrl,
		wsProtocol: VITE_HMR_WS_PROTOCOL,
		platform: options.platform,
		runtimeConfigUrl: `${origin}${IMPORT_MAP_PATH}`,
		hostModules: [...NS_DEFAULT_HOST_MODULES],
		features: { ...NS_DEFAULT_DEV_FEATURE_FLAGS },
	};
}

/**
 * The dev client bootstrap, served through Vite's transform like any module
 * so import analysis writes the URL of everything it imports. The session
 * bootstrap imports it before the app entry; it starts the HMR client once
 * the app has launched.
 */
export function createNsDevClientModuleCode(start: NsHmrStartOptions): string {
	return `import { nsDev } from '@nativescript/vite/hmr/shared/runtime/dev-globals.js';

const startOptions = ${JSON.stringify(start)};

// The HMR socket opens only once the app has booted: socket traffic racing
// the boot-time module fetches has crashed the native runtime.
function startHmrClientAfterBoot() {
	if (!nsDev().bootComplete) {
		setTimeout(startHmrClientAfterBoot, 100);
		return;
	}
	import('@nativescript/vite/hmr/client/index.js')
		.then((mod) => mod.start(startOptions))
		.catch((error) => console.error('[ns-dev-client] failed to start the HMR client', error));
}
startHmrClientAfterBoot();
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

/**
 * Gives every config resolved in this process the first one's
 * `webSocketToken`, and `publish`es it for the HMR build, which bakes it into
 * `bundle.mjs` (when this server doesn't write `bundle.mjs` itself).
 */
export function pinWebSocketToken(config: { webSocketToken: string }, publish: (token: string) => void): void {
	processWebSocketToken ??= config.webSocketToken;
	config.webSocketToken = processWebSocketToken;
	publish(processWebSocketToken);
}

const THIN_VITE_CLIENT_FILE = runtimeFile('../client/thin-vite-client.js');
const THIN_VITE_CLIENT_SPECIFIER = '@nativescript/vite/hmr/client/thin-vite-client.js';

/**
 * Serves the device HMR client (`hmr/client/thin-vite-client.ts`) as Vite's
 * `/@vite/client`. Vite aliases that URL to `/@fs/<vite>/dist/client/client.mjs`
 * before any plugin resolves it; resolving that id to our file keeps the
 * device URL `/@vite/client` and resolves the client's relative imports from
 * this package.
 *
 * The file is resolved by bare specifier, as the dev boot and client bootstrap
 * import this package: a linked install is otherwise reached both through its
 * symlink and its real path, and the modules the client shares with them load
 * twice.
 */
export function nsViteClientPlugin(): Plugin {
	const clientIds = new Set<string>(['/@vite/client']);
	let root = process.cwd();
	return {
		name: 'nativescript-vite-client',
		apply: 'serve',
		enforce: 'pre',
		configResolved(config) {
			root = config.root;
			for (const alias of config.resolve.alias) {
				const matches = alias.find instanceof RegExp ? alias.find.test('/@vite/client') : alias.find === '/@vite/client';
				if (matches && typeof alias.replacement === 'string') clientIds.add(alias.replacement);
			}
		},
		async resolveId(id, _importer, options) {
			if (this.environment?.name !== 'client' || !clientIds.has(id)) return null;
			const resolved = await this.resolve(THIN_VITE_CLIENT_SPECIFIER, path.join(root, 'index.html'), { ...options, skipSelf: true });
			return resolved && !resolved.external ? resolved.id.split('?', 1)[0] : THIN_VITE_CLIENT_FILE;
		},
	};
}

const toPosix = (value: string) => value.replace(/\\/g, '/').replace(/\/+$/, '');

function realpathOrSelf(dir: string): string {
	try {
		return fs.realpathSync(dir);
	} catch {
		return dir;
	}
}

/**
 * Adds `dirs` to the resolved `server.fs.allow`, as given and as real paths:
 * the resolver yields symlinked ids under `--preserve-symlinks` and real paths
 * otherwise. Vite reads the list on every check, so entries added after
 * config resolution count. Files the device requests directly (import-map
 * targets, the core URLs of Android app components) are checked against it
 * before any import analysis marks them safe.
 */
export function allowServedDirs(config: { server: { fs: { allow: string[] } } }, dirs: Iterable<string>): void {
	const allow = config.server.fs.allow;
	for (const candidate of servedDirForms(dirs)) {
		if (!allow.includes(candidate)) allow.push(candidate);
	}
}

/** Each directory as given and as its real path, POSIX, without a trailing slash. */
export function servedDirForms(dirs: Iterable<string>): string[] {
	const out = new Set<string>();
	for (const dir of dirs) {
		out.add(toPosix(path.resolve(dir)));
		out.add(toPosix(realpathOrSelf(path.resolve(dir))));
	}
	return [...out];
}

/**
 * Device requests pass Vite's host check, which rejects a hostname it doesn't
 * know; `NS_HMR_HOST` may name one. IPs and `localhost` always pass.
 */
export function allowDeviceHost(config: { server: { allowedHosts: string[] | true } }, envHost: string | undefined = process.env.NS_HMR_HOST): void {
	const allowedHosts = config.server.allowedHosts;
	if (!envHost || allowedHosts === true) return;
	let hostname: string;
	try {
		hostname = new URL(`http://${envHost}`).hostname;
	} catch {
		return;
	}
	if (!hostname || hostname.startsWith('[') || net.isIP(hostname) || allowedHosts.includes(hostname)) return;
	allowedHosts.push(hostname);
}

export interface NsHmrClientPluginOptions {
	platform: NsDevPlatform;
	verbose?: boolean;
	/** Set when this server writes the dev output itself (`dev-output.ts`), with no HMR build next to it. */
	devOutput?: DevOutputOptions;
}

export function nsHmrClientVitePlugin(opts: NsHmrClientPluginOptions): Plugin {
	let config: ResolvedConfig | undefined;
	let devServer: ViteDevServer | undefined;
	const sessionId = new Date().toISOString();

	return {
		name: 'ns-hmr-client',
		resolveId(id) {
			if (this.environment?.name !== 'client') return null;
			return id === NS_DEV_CLIENT_ID || id === NS_DEV_CLIENT_RESOLVED ? NS_DEV_CLIENT_RESOLVED : null;
		},
		load(id) {
			if (id !== NS_DEV_CLIENT_RESOLVED || !devServer) return null;
			// Every value here is fixed for the process (origin, pinned token,
			// root), so Vite's cached transform of this module stays valid.
			const origin = getServerOrigin(devServer);
			const session = createNsDevSessionDescriptor({
				projectRoot: devServer.config.root,
				origin,
				wsUrl: resolveViteHmrWsUrl(origin, devServer.config),
				platform: opts.platform,
				sessionId,
			});
			return createNsDevClientModuleCode({
				wsUrl: session.wsUrl,
				wsProtocol: session.wsProtocol,
				entryUrl: session.entryUrl,
				origin: session.origin,
				root: devServer.config.root,
			});
		},
		configResolved(c) {
			config = c;
			if (c.command === 'serve') {
				// Vite checks upgrades against `config.webSocketToken` of the config
				// it hands to `configResolved`, so pinning it here is what it uses.
				pinWebSocketToken(c as { webSocketToken: string }, opts.devOutput ? () => {} : (token) => publishDevWsToken(devWsTokenFile(c.root, devServerAddressOf(c.server).port), token));
				allowServedDirs(c, [nsVitePackageDir()]);
				// Vite freezes a copy of `allowedHosts` when it creates the server.
				allowDeviceHost(c);
			}
		},
		configureServer(server) {
			devServer = server;
			// One origin for every URL handed to the device: the one bundle.mjs
			// was built with, never the request's Host header.
			const getOrigin = () => getServerOrigin(server);
			// The core directory comes from the client resolver, which may only
			// run once the server has started; the first device request waits for it.
			let coreAllowed: Promise<void> | undefined;
			const allowCore = () =>
				(coreAllowed ??= resolveCoreEntryFile(server)
					.then((file) => allowServedDirs(server.config, [corePackageDir(file)]))
					.catch((error) => server.config.logger.warn(`[ns-hmr] @nativescript/core is not in server.fs.allow: ${error?.message ?? error}`)));
			useFirst(server.middlewares, createDeviceRequestMiddleware(server, getOrigin, allowCore));
			server.middlewares.use(async (req, res, next) => {
				try {
					const url = new URL(req.url || '', 'http://localhost');
					if (url.pathname !== NS_DEV_SESSION_PATH) return next();
					if (sendCorsPreflight(req, res)) return;

					const origin = getOrigin();
					const descriptor = createNsDevSessionDescriptor({
						projectRoot: config?.root || process.cwd(),
						origin,
						wsUrl: resolveViteHmrWsUrl(origin, server.config),
						platform: opts.platform,
						sessionId,
					});

					// A module, so the device loads it through the module loader during boot.
					res.setHeader('Content-Type', 'application/javascript');
					res.end(`export default ${JSON.stringify(descriptor, null, 2)};\n`);
				} catch (error: any) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: error?.message || 'Failed to build NativeScript dev session descriptor' }));
				}
			});
			const bootRoutes = registerDevBootRoutes(server, {
				// Ids as Vite's transform middleware passes them on (`/@id/__x00__` unwrapped).
				bootGraphUrls: () => [DEV_BOOT_RESOLVED, NS_DEV_CLIENT_RESOLVED, resolveProjectMainEntryPath(server.config.root)],
			});
			if (opts.devOutput) startDevOutput(server, { ...opts.devOutput, verbose: opts.verbose }, bootRoutes.warmedUp);
			// After Vite's own middlewares, ahead of its error handler.
			return () => {
				server.middlewares.use(bootRoutes.errorHandler);
			};
		},
	};
}
