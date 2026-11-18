import { describe, it, expect } from 'vitest';
import { createNsDevClientBootstrapCode, createNsDevSessionDescriptor, type NsDevBootstrapModuleUrls } from './vite-plugin.js';

describe('createNsDevSessionDescriptor', () => {
	it('builds a URL-native session descriptor from the request host', () => {
		const descriptor = createNsDevSessionDescriptor({
			projectRoot: '/Users/test/app',
			requestHost: '192.168.1.5:5173',
			platform: 'ios',
			sessionId: 'session-123',
			mainEntryPathname: '/src/main.ts',
		});

		expect(descriptor).toEqual({
			sessionId: 'session-123',
			origin: 'http://192.168.1.5:5173',
			entryUrl: 'http://192.168.1.5:5173/ns/v/src/main.ts',
			clientUrl: 'http://192.168.1.5:5173/__ns_dev__/client',
			wsUrl: 'ws://192.168.1.5:5173/ns-hmr',
			platform: 'ios',
			runtimeConfigUrl: 'http://192.168.1.5:5173/ns/import-map.json',
			hostModules: ['ns-host://runtime', 'ns-host://style-adapter'],
			features: {
				fullReload: true,
				cssHmr: true,
			},
		});
	});

	it('switches protocols when the dev server is secure', () => {
		const descriptor = createNsDevSessionDescriptor({
			projectRoot: '/Users/test/app',
			requestHost: 'dev.example.com:8443',
			platform: 'visionos',
			sessionId: 'session-456',
			secure: true,
			mainEntryPathname: '/src/app.ts',
		});

		expect(descriptor.origin).toBe('https://dev.example.com:8443');
		expect(descriptor.entryUrl).toBe('https://dev.example.com:8443/ns/v/src/app.ts');
		expect(descriptor.clientUrl).toBe('https://dev.example.com:8443/__ns_dev__/client');
		expect(descriptor.wsUrl).toBe('wss://dev.example.com:8443/ns-hmr');
		expect(descriptor.runtimeConfigUrl).toBe('https://dev.example.com:8443/ns/import-map.json');
		expect(descriptor.platform).toBe('visionos');
	});
});

function moduleUrlsFor(origin: string): NsDevBootstrapModuleUrls {
	const vite = `${origin}/ns/v/@fs/pkg/vite`;
	return {
		vendorBootstrap: `${vite}/hmr/shared/runtime/vendor-bootstrap.js`,
		hotContext: `${vite}/hmr/client/hot-context.js`,
		entryRuntime: `${vite}/hmr/entry-runtime.js`,
		cssHandler: `${vite}/hmr/client/css-handler.js`,
		launchBridge: `${vite}/hmr/shared/runtime/launch-bridge.js`,
		coreBridge: `${origin}/ns/v/node_modules/@nativescript/core/index.js`,
	};
}

describe('createNsDevClientBootstrapCode', () => {
	it('generates a single-url websocket client for deterministic runtime sessions', () => {
		const code = createNsDevClientBootstrapCode({
			origin: 'http://192.168.1.5:5173',
			wsUrl: 'ws://192.168.1.5:5173/ns-hmr',
			clientImport: 'http://192.168.1.5:5173/ns/v/@fs/pkg/vite/hmr/client/index.js',
			verbose: true,
			moduleUrls: moduleUrlsFor('http://192.168.1.5:5173'),
		});

		expect(code).toContain('const __NS_BROWSER_RUNTIME_WS_URL__ = "ws://192.168.1.5:5173/ns-hmr";');
		expect(code).toContain('const __NS_BROWSER_RUNTIME_ORIGIN__ = "http://192.168.1.5:5173";');
		expect(code).toContain('const __NS_BROWSER_RUNTIME_CLIENT_IMPORT__ = "http://192.168.1.5:5173/ns/v/@fs/pkg/vite/hmr/client/index.js";');
		expect(code).toContain('import { installVendorBootstrap as __nsBrowserRuntimeInstallVendorBootstrap } from "http://192.168.1.5:5173/ns/v/@fs/pkg/vite/hmr/shared/runtime/vendor-bootstrap.js";');
		expect(code).toContain('import { vendorManifest as __nsBrowserRuntimeVendorManifest, __nsVendorModuleMap as __nsBrowserRuntimeVendorModuleMap } from "http://192.168.1.5:5173/@nativescript/vendor.mjs";');
		expect(code).toContain('globalThis.__NS_HMR_APP_CSS__');
		// CSS apply is pure JS now: prefer the HTTP core realm applier,
		// fall back to Application.addCss via the vendor realm.
		expect(code).toContain('globalThis.__NS_HMR_APPLY_CSS__');
		expect(code).toContain('Application.addCss');
		// Last-resort cold-boot CSS fallback for boots where the vendor bundle
		// has no @nativescript/core: install the entry-runtime's core-realm
		// applier against the app graph's core entry URL.
		expect(code).toContain('import("http://192.168.1.5:5173/ns/v/@fs/pkg/vite/hmr/entry-runtime.js")');
		expect(code).toContain('import("http://192.168.1.5:5173/ns/v/node_modules/@nativescript/core/index.js")');
		expect(code).toContain('installHttpCoreCssSupport');
		// CSS updates delegate to the shared client css-handler (single
		// fetch+apply pipeline, honors per-update tags); the inline path is
		// only a global-updates fallback when that import fails.
		expect(code).toContain('import("http://192.168.1.5:5173/ns/v/@fs/pkg/vite/hmr/client/css-handler.js")');
		expect(code).toContain('skipped component CSS update');
		expect(code).not.toContain('__nsApplyStyleUpdate');
		// The JS hot registry installs before the entry graph evaluates.
		expect(code).toContain('installNsHotRegistry');
		expect(code).toContain("console.info('[ns-entry] app.css applied in HTTP core realm');");
		expect(code).not.toContain('__nsBrowserRuntimeConfigureRuntime');
		expect(code).not.toContain('/ns/import-map.json');
		expect(code).not.toContain('configureLoader({');
		expect(code).toContain('__nsBrowserRuntimeEnsureVendorBootstrap();');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BUNDLE_URL__');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BOOTSTRAP_URL__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_VENDOR_HASH__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_CLIENT_ERROR__');
		expect(code).toContain('__NS_HMR_BROWSER_RUNTIME_DELEGATED__');
		expect(code).toContain('__NS_HMR_BROWSER_RUNTIME_SOCKET_READY__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_GRAPH_VERSION__');
		expect(code).toContain('__NS_HMR_CLIENT_SOCKET_READY__');
		expect(code).toContain("resolved.searchParams.set('ns_hmr_role', role);");
		expect(code).toContain("const __NS_BROWSER_RUNTIME_FALLBACK_WS_URL__ = __nsBrowserRuntimeWithSocketRole(__NS_BROWSER_RUNTIME_WS_URL__, 'bootstrap');");
		expect(code).toContain("const __NS_BROWSER_RUNTIME_FULL_CLIENT_WS_URL__ = __nsBrowserRuntimeWithSocketRole(__NS_BROWSER_RUNTIME_WS_URL__, 'full');");
		expect(code).toContain('import(__NS_BROWSER_RUNTIME_CLIENT_IMPORT__)');
		expect(code).toContain('start({ wsUrl: __NS_BROWSER_RUNTIME_FULL_CLIENT_WS_URL__ });');
		expect(code.indexOf('__nsBrowserRuntimeEnsureVendorBootstrap();')).toBeLessThan(code.indexOf('if (!globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__)'));
		expect(code).toContain('const ws = new WebSocketCtor(__NS_BROWSER_RUNTIME_FALLBACK_WS_URL__);');
		expect(code).toContain("console.info('[ns-browser-runtime-client] connected', __NS_BROWSER_RUNTIME_FALLBACK_WS_URL__);");
		expect(code).toContain("if (msg.type === 'ns:angular-update') {");
		expect(code).toContain("console.info('[ns-browser-runtime-client] boot complete observed; starting full HMR client');");
		expect(code).toContain("console.warn('[ns-browser-runtime-client] boot completion was not observed; full HMR client start is still pending');");
		expect(code).toContain("console.info('[ns-browser-runtime-client] delegated to full HMR client; closing bootstrap fallback socket'");
		expect(code).toContain("console.warn('[ns-browser-runtime-client] full HMR client did not confirm websocket readiness; keeping bootstrap fallback active');");
		expect(code).toContain('__nsBrowserRuntimeTrackDelegation();');
		expect(code).not.toContain('__nsBrowserRuntimeReload(');
		expect(code).toContain('__nsBrowserRuntimeHandleSocketMessage');
		expect(code).not.toContain('10.0.2.2');
		expect(code).not.toContain('orderedHosts');
	});

	it('publishes a deferred client-strategy readiness promise before the app entry can navigate', () => {
		// The full client (and its strategy) loads only after boot-complete,
		// which flips after the app entry evaluates. The wrapper evaluates
		// before the entry, so it owns the readiness promise.
		const code = createNsDevClientBootstrapCode({
			wsUrl: 'ws://127.0.0.1:5173/__ns_dev__/ws',
			origin: 'http://127.0.0.1:5173',
			clientImport: 'http://127.0.0.1:5173/ns/v/@fs/pkg/vite/hmr/client/index.js',
			moduleUrls: moduleUrlsFor('http://127.0.0.1:5173'),
		});
		const deferredAt = code.indexOf('globalThis.__NS_CLIENT_STRATEGY_READY__ = new Promise');
		// The first `__nsBrowserRuntimeConnectSocket();` in the emitted code sits
		// inside the reconnect timer's function body, not the boot call site —
		// take the last occurrence, which is the top-level boot call.
		const socketAt = code.lastIndexOf('__nsBrowserRuntimeConnectSocket();');
		expect(deferredAt).toBeGreaterThan(-1);
		expect(deferredAt).toBeLessThan(socketAt);
		expect(code).toContain('globalThis.__NS_CLIENT_STRATEGY_RESOLVE__ = resolve');
		// A failed full-client start must settle it, never leave callers hanging.
		expect(code).toContain('globalThis.__NS_CLIENT_STRATEGY_RESOLVE__?.()');
		// So must an entry import failure observed by the boot poller.
		expect(code).toContain('else if (globalThis.__NS_ENTRY_ERROR__)');
	});

	it('installs seeded app.css in the core realm before the app entry evaluates', () => {
		const code = createNsDevClientBootstrapCode({
			wsUrl: 'ws://127.0.0.1:5173/__ns_dev__/ws',
			origin: 'http://127.0.0.1:5173',
			clientImport: 'http://127.0.0.1:5173/ns/v/@fs/pkg/vite/hmr/client/index.js',
			moduleUrls: moduleUrlsFor('http://127.0.0.1:5173'),
		});
		expect(code).toContain('import { installHttpCoreCssSupport as __nsBrowserRuntimeInstallHttpCoreCssSupport } from "http://127.0.0.1:5173/ns/v/@fs/pkg/vite/hmr/entry-runtime.js";');
		const installAt = code.indexOf('__nsBrowserRuntimeInstallHttpCoreCssSupport(__nsBrowserRuntimeCoreBridge, false);');
		expect(installAt).toBeGreaterThan(-1);
		// Top-level, ahead of the boot-complete poller that replays it lazily.
		expect(installAt).toBeLessThan(code.indexOf('if (!globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__)'));
	});
});
