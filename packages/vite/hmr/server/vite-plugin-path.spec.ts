import { describe, it, expect, vi } from 'vitest';
import { corePackageDir, createNsDevClientBootstrapCode, createNsDevSessionDescriptor, pinWebSocketToken, resolveViteHmrWsUrl, type NsDevBootstrapModuleUrls, type ViteHmrWsConfig } from './vite-plugin.js';
import { NS_DEV_EXPR } from '../shared/runtime/dev-globals.js';

function wsConfig(server: Partial<ViteHmrWsConfig['server']> & { ws?: unknown }, extra: Partial<Pick<ViteHmrWsConfig, 'base' | 'webSocketToken'>> = {}): ViteHmrWsConfig {
	return { base: '/', webSocketToken: 'tok-1', ...extra, server: { port: 5173, hmr: undefined, ...server } } as ViteHmrWsConfig;
}

describe('resolveViteHmrWsUrl', () => {
	it('joins base and the ws path on the server origin, with the token', () => {
		expect(resolveViteHmrWsUrl('http://192.168.1.5:5173', wsConfig({ ws: { path: '/vite-hmr' } }))).toBe('ws://192.168.1.5:5173/vite-hmr?token=tok-1');
		expect(resolveViteHmrWsUrl('http://192.168.1.5:5173', wsConfig({ ws: { path: 'vite-hmr' } }, { base: '/app/' }))).toBe('ws://192.168.1.5:5173/app/vite-hmr?token=tok-1');
	});

	it('reads server.hmr when server.ws is not an options object (Vite 8.0)', () => {
		expect(resolveViteHmrWsUrl('http://10.0.2.2:5173', wsConfig({ hmr: { path: '/vite-hmr' } }))).toBe('ws://10.0.2.2:5173/vite-hmr?token=tok-1');
	});

	it('uses wss for an https origin and the ws port when it differs from the server port', () => {
		expect(resolveViteHmrWsUrl('https://dev.example.com:8443', wsConfig({ port: 8443, ws: { path: '/vite-hmr', port: 24678 } }))).toBe('wss://dev.example.com:24678/vite-hmr?token=tok-1');
		expect(resolveViteHmrWsUrl('http://127.0.0.1:5173', wsConfig({ ws: { path: '/vite-hmr', port: 5173 } }))).toBe('ws://127.0.0.1:5173/vite-hmr?token=tok-1');
	});

	it('URL-encodes the token and falls back to the base path', () => {
		expect(resolveViteHmrWsUrl('http://127.0.0.1:5173', wsConfig({}, { webSocketToken: 'a+b/c=' }))).toBe('ws://127.0.0.1:5173/?token=a%2Bb%2Fc%3D');
	});
});

describe('pinWebSocketToken', () => {
	it('keeps the first resolved token for every later config of the process', () => {
		const first = { webSocketToken: 'first' };
		const restarted = { webSocketToken: 'minted-on-restart' };
		pinWebSocketToken(first);
		pinWebSocketToken(restarted);
		expect(restarted.webSocketToken).toBe('first');
	});
});

describe('createNsDevSessionDescriptor', () => {
	it('builds the descriptor from the given origin and Vite HMR socket', () => {
		const descriptor = createNsDevSessionDescriptor({
			projectRoot: '/Users/test/app',
			origin: 'http://192.168.1.5:5173/',
			wsUrl: 'ws://192.168.1.5:5173/vite-hmr?token=tok-1',
			platform: 'ios',
			sessionId: 'session-123',
			mainEntryPathname: '/src/main.ts',
		});

		expect(descriptor).toEqual({
			sessionId: 'session-123',
			origin: 'http://192.168.1.5:5173',
			entryUrl: 'http://192.168.1.5:5173/ns/v/src/main.ts',
			clientUrl: 'http://192.168.1.5:5173/__ns_dev__/client',
			wsUrl: 'ws://192.168.1.5:5173/vite-hmr?token=tok-1',
			wsProtocol: 'vite-hmr',
			platform: 'ios',
			runtimeConfigUrl: 'http://192.168.1.5:5173/ns/import-map.json',
			hostModules: ['ns-host://runtime', 'ns-host://style-adapter'],
			features: {
				fullReload: true,
				cssHmr: true,
			},
		});
	});
});

describe('corePackageDir', () => {
	it('cuts an installed core entry at the package directory', () => {
		expect(corePackageDir('/app/node_modules/@nativescript/core/index.js')).toBe('/app/node_modules/@nativescript/core');
	});

	it('uses the entry directory for a workspace core', () => {
		expect(corePackageDir('/repo/packages/core/index.ts')).toBe('/repo/packages/core');
	});
});

const ORIGIN = 'http://192.168.1.5:5173';
const MODULE_URLS: NsDevBootstrapModuleUrls = {
	vendorBootstrap: `${ORIGIN}/ns/v/@fs/pkg/vite/hmr/shared/runtime/vendor-bootstrap.js`,
	entryRuntime: `${ORIGIN}/ns/v/@fs/pkg/vite/hmr/entry-runtime.js`,
	launchBridge: `${ORIGIN}/ns/v/@fs/pkg/vite/hmr/shared/runtime/launch-bridge.js`,
	coreBridge: `${ORIGIN}/ns/v/node_modules/@nativescript/core/index.js`,
};
const START = {
	wsUrl: 'ws://192.168.1.5:5173/vite-hmr?token=tok-1',
	wsProtocol: 'vite-hmr',
	entryUrl: `${ORIGIN}/ns/v/src/main.ts`,
	origin: ORIGIN,
};

function bootstrapCode(verbose = false) {
	return createNsDevClientBootstrapCode({
		origin: ORIGIN,
		clientImport: `${ORIGIN}/ns/v/@fs/pkg/vite/hmr/client/index.js`,
		verbose,
		moduleUrls: MODULE_URLS,
		start: START,
	});
}

describe('createNsDevClientBootstrapCode', () => {
	it('starts the HMR client with the server-baked options once boot completes', () => {
		const code = bootstrapCode();
		expect(code).toContain(`const __nsHmrClientUrl = "${ORIGIN}/ns/v/@fs/pkg/vite/hmr/client/index.js";`);
		expect(code).toContain(`const __nsHmrStartOptions = ${JSON.stringify(START)};`);
		expect(code).toContain('.then((mod) => mod.start(__nsHmrStartOptions))');
		expect(code).toContain(`const __nsDev = ${NS_DEV_EXPR};`);
		expect(code).toContain('if (!__nsDev.bootComplete) {');
		expect(code).not.toContain('WebSocket');
		expect(code).not.toContain('ns_hmr_role');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME');
		expect(code).not.toContain('__NS_CLIENT_STRATEGY');
		expect(code).not.toContain('__NS_HOT_REGISTRY__');
		expect(code).not.toContain('ns:angular-update');
	});

	it('installs app.css, the launch bridge and the vendor registry before the HMR client', () => {
		const code = bootstrapCode();
		expect(code).toContain(`import * as __nsCoreBridge from "${MODULE_URLS.coreBridge}";`);
		expect(code).toContain(`import { vendorManifest as __nsVendorManifest, __nsVendorModuleMap } from "${ORIGIN}/@nativescript/vendor.mjs";`);
		const cssAt = code.indexOf('__nsInstallHttpCoreCssSupport(__nsCoreBridge, false);');
		const bridgeAt = code.indexOf('__nsInstallLaunchBridge(__nsCoreNs && __nsCoreNs.Application);');
		const vendorAt = code.indexOf('__nsInstallVendorBootstrap(__nsVendorManifest, __nsVendorModuleMap, false);');
		const clientAt = code.indexOf('__nsStartHmrClientAfterBoot();\n');
		expect(cssAt).toBeGreaterThan(-1);
		expect(cssAt).toBeLessThan(bridgeAt);
		expect(bridgeAt).toBeLessThan(vendorAt);
		expect(vendorAt).toBeLessThan(clientAt);
	});

	it('passes the verbose flag to the boot helpers', () => {
		const code = bootstrapCode(true);
		expect(code).toContain('__nsInstallHttpCoreCssSupport(__nsCoreBridge, true);');
		expect(code).toContain('__nsInstallVendorBootstrap(__nsVendorManifest, __nsVendorModuleMap, true);');
	});
});

describe('nsHmrClientVitePlugin middleware', () => {
	const SERVER_ORIGIN = 'http://192.168.1.5:5173';

	async function serve(pathname: string) {
		vi.resetModules();
		vi.doMock('./server-origin.js', () => ({ getServerOrigin: () => SERVER_ORIGIN }));
		try {
			const { nsHmrClientVitePlugin } = await import('./vite-plugin.js');
			const middlewares: Array<(req: any, res: any, next: () => void) => unknown> = [];
			const server: any = {
				config: { root: '/app', base: '/', webSocketToken: 'tok-1', define: {}, server: { port: 5173, hmr: { path: '/vite-hmr' } } },
				middlewares: { use: (fn: any) => middlewares.push(fn) },
				environments: { client: { pluginContainer: { resolveId: async () => ({ id: '/app/node_modules/@nativescript/core/index.js' }) } } },
			};
			const plugin = nsHmrClientVitePlugin({ platform: 'android' });
			(plugin.configResolved as any)(server.config);
			(plugin.configureServer as any)(server);
			let body = '';
			const res: any = { setHeader: () => {}, end: (chunk: string) => (body = chunk) };
			const req = { url: pathname, method: 'GET', headers: { host: 'evil.example:9999' } };
			for (const middleware of middlewares) {
				let calledNext = false;
				await middleware(req, res, () => (calledNext = true));
				if (!calledNext) break;
			}
			return body;
		} finally {
			vi.doUnmock('./server-origin.js');
		}
	}

	it('builds the session from the server origin, not the Host header', async () => {
		const session = JSON.parse(await serve('/__ns_dev__/session'));
		expect(session.origin).toBe(SERVER_ORIGIN);
		expect(session.entryUrl).toBe(`${SERVER_ORIGIN}/ns/v/src/app.ts`);
		expect(session.wsUrl).toBe('ws://192.168.1.5:5173/vite-hmr?token=tok-1');
		expect(session.wsProtocol).toBe('vite-hmr');
	});

	it('bakes the server origin into the client bootstrap start options', async () => {
		const code = await serve('/__ns_dev__/client');
		expect(code).not.toContain('evil.example');
		const start = JSON.parse(code.match(/const __nsHmrStartOptions = (.*);/)![1]);
		expect(start).toEqual({
			wsUrl: 'ws://192.168.1.5:5173/vite-hmr?token=tok-1',
			wsProtocol: 'vite-hmr',
			entryUrl: `${SERVER_ORIGIN}/ns/v/src/app.ts`,
			origin: SERVER_ORIGIN,
			root: '/app',
		});
	});
});
