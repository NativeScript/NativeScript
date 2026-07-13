import { describe, expect, it } from 'vitest';

import { getBlockedDeviceNodeModulesReason } from './websocket-module-specifiers.js';
import { rewriteImports } from './websocket-device-transform.js';
import { canonicalizeNsMImportPath, collapseLegacyNsMTags } from './websocket-ns-m-paths.js';

describe('node_modules HTTP import canonicalization', () => {
	it('preserves resolved dependency filenames for relative node_modules imports', () => {
		const input = `import { tokenize } from "../tokenizer/index.js";\n`;
		const out = rewriteImports(input, '/node_modules/css-tree/lib/parser/sequence.js', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "/ns/m/node_modules/css-tree/lib/tokenizer/index.js"');
		expect(out).not.toContain('from "/ns/m/node_modules/css-tree/lib/tokenizer/index"');
	});

	it('preserves resolved dependency filenames for absolute dynamic node_modules imports', () => {
		const input = `const loadTokenizer = () => import("/node_modules/css-tree/lib/tokenizer/index.js");\n`;
		const out = rewriteImports(input, '/src/app/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('import("http://localhost:5173/ns/m/node_modules/css-tree/lib/tokenizer/index.js")');
		expect(out).not.toContain('/ns/m/node_modules/css-tree/lib/tokenizer/index"');
	});

	it('keeps node_modules imports on one canonical path during HMR path rewriting', () => {
		expect(canonicalizeNsMImportPath('/ns/m/node_modules/css-tree/lib/tokenizer/index.js')).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
		expect(canonicalizeNsMImportPath('/ns/m/__ns_hmr__/v491/node_modules/css-tree/lib/tokenizer/index.js')).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
		expect(canonicalizeNsMImportPath('/ns/m/__ns_boot__/b1/__ns_hmr__/v491/node_modules/css-tree/lib/tokenizer/index.js')).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
	});

	// Stable URL + Explicit Invalidation.
	//
	// The contract emits ONE canonical URL per module and uses the explicit
	// `__NS_DEV__.invalidateModules` protocol for cache busting; the rewriter is a
	// pure canonicalizer that strips tagged inbound shapes (stale cached
	// device code) without ever adding any.
	it('emits stable canonical URLs for application module imports', () => {
		// Bare app module → stable / idempotent.
		expect(canonicalizeNsMImportPath('/ns/m/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
		// Tagged URLs (stale cached device code may still request one) → tag stripped.
		expect(canonicalizeNsMImportPath('/ns/m/__ns_hmr__/v491/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
		expect(canonicalizeNsMImportPath('/ns/m/__ns_hmr__/live/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
		expect(canonicalizeNsMImportPath('/ns/m/__ns_hmr__/n5/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
	});

	it('strips boot prefixes (there is no boot tagging; the boot snippet self-gates)', () => {
		expect(canonicalizeNsMImportPath('/ns/m/__ns_boot__/b1/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
		expect(canonicalizeNsMImportPath('/ns/m/__ns_boot__/b1/__ns_hmr__/v491/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
	});
});

describe('collapseLegacyNsMTags (inbound request specs)', () => {
	it('extracts a path-carried HMR version from __ns_hmr__ requests', () => {
		expect(collapseLegacyNsMTags('/__ns_hmr__/v492/src/app/components/checkin/checkin.component', 'inbound-request-spec')).toEqual({
			cleanedSpec: '/src/app/components/checkin/checkin.component',
			bootTaggedRequest: false,
			forcedVer: 'v492',
		});
	});

	it('extracts a path-carried HMR version from boot-tagged requests', () => {
		expect(collapseLegacyNsMTags('/__ns_boot__/b1/__ns_hmr__/v492/src/app/components/checkin/checkin.component', 'inbound-request-spec')).toEqual({
			cleanedSpec: '/src/app/components/checkin/checkin.component',
			bootTaggedRequest: true,
			forcedVer: 'v492',
		});
	});

	it('preserves nonce and live request tags', () => {
		expect(collapseLegacyNsMTags('/__ns_hmr__/live/src/app/app.routes', 'inbound-request-spec')).toEqual({
			cleanedSpec: '/src/app/app.routes',
			bootTaggedRequest: false,
			forcedVer: 'live',
		});
		expect(collapseLegacyNsMTags('/__ns_hmr__/n1/src/app/components/signup/signup.component', 'inbound-request-spec')).toEqual({
			cleanedSpec: '/src/app/components/signup/signup.component',
			bootTaggedRequest: false,
			forcedVer: 'n1',
		});
	});

	it('keeps canonical app module paths stable (idempotent)', () => {
		// Cache busting is driven by `__NS_DEV__.invalidateModules`, not URL
		// versioning — canonical inputs pass through untouched.
		expect(canonicalizeNsMImportPath('/ns/m/src/app/app.routes')).toBe('/ns/m/src/app/app.routes');
		expect(canonicalizeNsMImportPath('/ns/m/src/app/components/signup/signup.component')).toBe('/ns/m/src/app/components/signup/signup.component');
	});
});

describe('device build-time package guards', () => {
	it('blocks NativeScript Vite build-time roots and configuration modules', () => {
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite')).toBe('build-time NativeScript Vite package root is not device-loadable');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/configuration/base.js')).toBe('build-time NativeScript Vite module is not device-loadable: @nativescript/vite/configuration/base.js');
	});

	it('allows NativeScript Vite runtime subpaths that are served over HTTP', () => {
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/angular/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/vue/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite/runtime/core-aliases-early.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/shims/angular-animations-stub.js')).toBeNull();
	});

	it('blocks other known build-time packages from device loading', () => {
		expect(getBlockedDeviceNodeModulesReason('vite')).toBe('build-time package is not device-loadable: vite');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@vitejs/plugin-vue/dist/index.js')).toBe('build-time package is not device-loadable: @vitejs/plugin-vue');
	});
});
