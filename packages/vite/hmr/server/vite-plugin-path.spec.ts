import { describe, it, expect } from 'vitest';
import path from 'path';
import { computeClientImportSpecifier, createNsDevClientBootstrapCode, createNsDevSessionDescriptor } from './vite-plugin.js';

describe('ns-hmr-client vite plugin path handling', () => {
	it('keeps a clean project-relative POSIX path on POSIX-like roots', () => {
		const projectRoot = '/Users/test/app';
		const clientFsPath = '/Users/test/app/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImportSpecifier({ projectRoot, clientFsPath });

		expect(result).toBe('/ns/m/node_modules/@nativescript/vite/hmr/client/index.js');
	});

	it('falls back to file URL when relative becomes absolute (Windows-like different drive)', () => {
		// Simulate a scenario where projectRoot and clientFsPath are on different drives.
		// On real Windows, path.relative('C:/proj', 'D:/lib/file.js') is an absolute path
		// starting with the target drive (e.g. 'D:/lib/file.js').
		const projectRoot = 'C:/project/root';
		const clientFsPath = 'D:/ns-vite-demo/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImportSpecifier({ projectRoot, clientFsPath });

		// On non-Windows hosts, Node's path.relative may not simulate the
		// cross-drive behavior. The important contract is: when the computed
		// relative path is absolute, we do NOT generate an import like '/D:/...'
		// that would later resolve to 'D:\\D:\\...'. In that case we use a
		// file URL; otherwise we leave the relative specifier alone.
		if (path.sep === '\\') {
			// Windows: expect file URL behavior
			expect(result.startsWith('file://')).toBe(true);
		}
		expect(result.includes('nativescript/vite/hmr/client/index.js')).toBe(true);
	});

	it('handles Windows-style same-drive paths as project-relative POSIX', () => {
		const projectRoot = 'D:/ns-vite-demo';
		const clientFsPath = 'D:/ns-vite-demo/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImportSpecifier({ projectRoot, clientFsPath });

		// When on the same drive, relative path should be node_modules/... and we normalize to POSIX.
		expect(result).toBe('/ns/m/node_modules/@nativescript/vite/hmr/client/index.js');
	});
});

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
			entryUrl: 'http://192.168.1.5:5173/ns/m/src/main.ts',
			clientUrl: 'http://192.168.1.5:5173/__ns_dev__/client',
			wsUrl: 'ws://192.168.1.5:5173/ns-hmr',
			platform: 'ios',
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
		expect(descriptor.entryUrl).toBe('https://dev.example.com:8443/ns/m/src/app.ts');
		expect(descriptor.clientUrl).toBe('https://dev.example.com:8443/__ns_dev__/client');
		expect(descriptor.wsUrl).toBe('wss://dev.example.com:8443/ns-hmr');
		expect(descriptor.platform).toBe('visionos');
	});
});

describe('createNsDevClientBootstrapCode', () => {
	it('generates a single-url websocket client for deterministic runtime sessions', () => {
		const code = createNsDevClientBootstrapCode({
			origin: 'http://192.168.1.5:5173',
			wsUrl: 'ws://192.168.1.5:5173/ns-hmr',
			clientImport: '/ns/m/node_modules/@nativescript/vite/hmr/client/index.js',
			verbose: true,
		});

		expect(code).toContain('const __NS_BROWSER_RUNTIME_WS_URL__ = "ws://192.168.1.5:5173/ns-hmr";');
		expect(code).toContain('const __NS_BROWSER_RUNTIME_ORIGIN__ = "http://192.168.1.5:5173";');
		expect(code).toContain('const __NS_BROWSER_RUNTIME_CLIENT_IMPORT__ = "http://192.168.1.5:5173/ns/m/node_modules/@nativescript/vite/hmr/client/index.js";');
		expect(code).toContain('import { installVendorBootstrap as __nsBrowserRuntimeInstallVendorBootstrap } from "http://192.168.1.5:5173/ns/m/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js";');
		expect(code).toContain('import { vendorManifest as __nsBrowserRuntimeVendorManifest, __nsVendorModuleMap as __nsBrowserRuntimeVendorModuleMap } from "http://192.168.1.5:5173/@nativescript/vendor.mjs";');
		expect(code).toContain('globalThis.__NS_HMR_APP_CSS__');
		expect(code).toContain('globalThis.__nsApplyStyleUpdate');
		expect(code).toContain("console.info('[ns-entry] app.css applied in HTTP core realm');");
		expect(code).not.toContain('__nsBrowserRuntimeConfigureRuntime');
		expect(code).not.toContain('/ns/import-map.json');
		expect(code).not.toContain('configureRuntime({');
		expect(code).toContain('__nsBrowserRuntimeEnsureVendorBootstrap();');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BUNDLE_URL__');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BOOTSTRAP_URL__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_VENDOR_HASH__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_CLIENT_ERROR__');
		expect(code).toContain('import(__NS_BROWSER_RUNTIME_CLIENT_IMPORT__)');
		expect(code).toContain('start({ wsUrl: __NS_BROWSER_RUNTIME_WS_URL__ });');
		expect(code.indexOf('__nsBrowserRuntimeEnsureVendorBootstrap();')).toBeLessThan(code.indexOf('if (!globalThis.__NS_HMR_BROWSER_RUNTIME_CLIENT_ACTIVE__)'));
		expect(code).toContain('const ws = new WebSocketCtor(__NS_BROWSER_RUNTIME_WS_URL__);');
		expect(code).toContain("console.info('[ns-browser-runtime-client] connected', __NS_BROWSER_RUNTIME_WS_URL__);");
		expect(code).not.toContain('__nsBrowserRuntimeReload(');
		expect(code).toContain("if (msg.type === 'ns:angular-update') {");
		expect(code).not.toContain('10.0.2.2');
		expect(code).not.toContain('orderedHosts');
	});
});
