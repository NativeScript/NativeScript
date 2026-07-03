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

	it('routes hoisted workspace node_modules through /ns/m/ when node_modules sits above the project root', () => {
		// Nx / pnpm / Yarn workspaces hoist node_modules to the workspace root. With the
		// previous logic, path.relative produced "../../node_modules/..." which the
		// device's URL constructor collapses to a raw "/node_modules/..." URL — bypassing
		// the AST normalizer that strips /@vite/client. This regression test guards the
		// monorepo path so the import always lands on /ns/m/node_modules/... .
		const projectRoot = '/Users/me/repo/apps/my-app';
		const clientFsPath = '/Users/me/repo/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImportSpecifier({ projectRoot, clientFsPath });

		expect(result).toBe('/ns/m/node_modules/@nativescript/vite/hmr/client/index.js');
	});

	it('routes pnpm-style nested node_modules through their last node_modules segment', () => {
		const projectRoot = '/Users/me/repo/apps/my-app';
		const clientFsPath = '/Users/me/repo/node_modules/.pnpm/@nativescript+vite@8.0.0/node_modules/@nativescript/vite/hmr/client/index.js';

		const result = computeClientImportSpecifier({ projectRoot, clientFsPath });

		// We use the LAST /node_modules/ segment so the resolved /ns/m/ route still
		// matches the actual file the dev server would serve under that virtual path.
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
			// Canonical (untagged) entry URL — module identity IS the URL.
			// The boot-progress snippet is injected self-gating by the /ns/m
			// module server, so no `__ns_boot__` decoration is needed.
			entryUrl: 'http://192.168.1.5:5173/ns/m/src/main.ts',
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
		expect(descriptor.entryUrl).toBe('https://dev.example.com:8443/ns/m/src/app.ts');
		expect(descriptor.clientUrl).toBe('https://dev.example.com:8443/__ns_dev__/client');
		expect(descriptor.wsUrl).toBe('wss://dev.example.com:8443/ns-hmr');
		expect(descriptor.runtimeConfigUrl).toBe('https://dev.example.com:8443/ns/import-map.json');
		expect(descriptor.platform).toBe('visionos');
	});

	it('preserves the boot-tag wrapper when the caller passes a fully-qualified /ns/m/ entry pathname', () => {
		// Some callers (e.g. legacy custom shims) construct the canonical
		// /ns/m/<rel> mirror themselves before handing it in. We still want
		// the boot tag applied so the cold-boot snippet propagates; the
		// `slice('/ns/m'.length)` math has to insert the tag in front of
		// the existing /ns/m segment without doubling it.
		const descriptor = createNsDevSessionDescriptor({
			projectRoot: '/Users/test/app',
			requestHost: 'localhost:5173',
			platform: 'ios',
			sessionId: 'session-789',
			mainEntryPathname: '/ns/m/src/entrypoints/main.ts',
		});

		expect(descriptor.entryUrl).toBe('http://localhost:5173/ns/m/src/entrypoints/main.ts');
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
		// CSS apply is pure JS now: prefer the HTTP core realm applier,
		// fall back to Application.addCss via the vendor realm.
		expect(code).toContain('globalThis.__NS_HMR_APPLY_CSS__');
		expect(code).toContain('Application.addCss');
		// Last-resort cold-boot CSS fallback for monorepo / per-module core
		// boots where the vendor bundle has no @nativescript/core: install the
		// entry-runtime's HTTP-core-realm applier against the canonical
		// (unversioned) /ns/core bridge URL.
		expect(code).toContain('import("http://192.168.1.5:5173/ns/m/node_modules/@nativescript/vite/hmr/entry-runtime.js")');
		expect(code).toContain('import("http://192.168.1.5:5173/ns/core")');
		expect(code).toContain('installHttpCoreCssSupport');
		expect(code).not.toContain('__nsApplyStyleUpdate');
		// The JS hot registry installs before the entry graph evaluates.
		expect(code).toContain('installNsHotRegistry');
		expect(code).toContain("console.info('[ns-entry] app.css applied in HTTP core realm');");
		expect(code).not.toContain('__nsBrowserRuntimeConfigureRuntime');
		expect(code).not.toContain('/ns/import-map.json');
		expect(code).not.toContain('configureRuntime({');
		expect(code).toContain('__nsBrowserRuntimeEnsureVendorBootstrap();');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BUNDLE_URL__');
		expect(code).not.toContain('__NS_BROWSER_RUNTIME_VENDOR_BOOTSTRAP_URL__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_VENDOR_HASH__');
		expect(code).not.toContain('__NS_HMR_BROWSER_RUNTIME_CLIENT_ERROR__');
		expect(code).toContain('__NS_HMR_BROWSER_RUNTIME_DELEGATED__');
		expect(code).toContain('__NS_HMR_BROWSER_RUNTIME_SOCKET_READY__');
		expect(code).toContain('__NS_HMR_BROWSER_RUNTIME_GRAPH_VERSION__');
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
});
