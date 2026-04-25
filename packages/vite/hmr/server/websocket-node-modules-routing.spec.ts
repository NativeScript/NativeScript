import { describe, expect, it } from 'vitest';

import { __test_getBlockedDeviceNodeModulesReason as getBlockedDeviceNodeModulesReason, rewriteImports, rewriteNsMImportPathForHmr, stripDecoratedServePrefixes } from './websocket.js';

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
		expect(rewriteNsMImportPathForHmr('/ns/m/node_modules/css-tree/lib/tokenizer/index.js', 492, false)).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_hmr__/v491/node_modules/css-tree/lib/tokenizer/index.js', 492, false)).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_boot__/b1/__ns_hmr__/v491/node_modules/css-tree/lib/tokenizer/index.js', 492, true)).toBe('/ns/m/node_modules/css-tree/lib/tokenizer/index.js');
	});

	// Stable URL + Explicit Invalidation.
	//
	// Older versions of the rewriter stamped `__ns_hmr__/v<N>/` into
	// every app-module URL on every save. The version segment forced
	// V8 to re-fetch the entire dependency closure even when only one
	// file changed (the URL was the cache key). The current contract
	// emits stable URLs and uses an explicit `__nsInvalidateModules`
	// protocol for cache busting; the rewriter is now a canonicalizer
	// that strips legacy tags rather than adding them.
	it('emits stable canonical URLs for application module imports', () => {
		// Bare app module → stable.
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
		// Legacy tagged URL (an older client may still serve one) → tag stripped.
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_hmr__/v491/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_hmr__/live/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_hmr__/n5/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
		// `_ver` argument is ignored for app modules — stability is the rule now.
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/app.routes', 'live', false)).toBe('/ns/m/src/app/app.routes');
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/app.routes', 'v999', false)).toBe('/ns/m/src/app/app.routes');
	});

	it('preserves the boot prefix for boot-tagged app module requests', () => {
		// Bare app module + bootTagged → boot prefix added.
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/app.routes', 492, true)).toBe('/ns/m/__ns_boot__/b1/src/app/app.routes');
		// Legacy boot+hmr → tag stripped, boot prefix retained.
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_boot__/b1/__ns_hmr__/v491/src/app/app.routes', 492, true)).toBe('/ns/m/__ns_boot__/b1/src/app/app.routes');
		// Already-canonical boot URL → idempotent.
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_boot__/b1/src/app/app.routes', 492, true)).toBe('/ns/m/__ns_boot__/b1/src/app/app.routes');
		// Boot-tagged request whose source had only an hmr tag (no boot prefix)
		// → tag stripped, boot prefix added.
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_hmr__/v491/src/app/app.routes', 492, true)).toBe('/ns/m/__ns_boot__/b1/src/app/app.routes');
	});

	it('drops legacy tags from non-boot requests even when the input was boot-tagged', () => {
		// A path that was previously emitted under boot is collapsed when
		// requested under HMR (e.g. an importer whose tag changed contexts).
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_boot__/b1/__ns_hmr__/v491/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
		expect(rewriteNsMImportPathForHmr('/ns/m/__ns_boot__/b1/src/app/app.routes', 492, false)).toBe('/ns/m/src/app/app.routes');
	});
});

describe('stripDecoratedServePrefixes', () => {
	it('extracts a path-carried HMR version from __ns_hmr__ requests', () => {
		expect(stripDecoratedServePrefixes('/__ns_hmr__/v492/src/app/components/checkin/checkin.component')).toEqual({
			cleanedSpec: '/src/app/components/checkin/checkin.component',
			bootTaggedRequest: false,
			forcedVer: 'v492',
		});
	});

	it('extracts a path-carried HMR version from boot-tagged requests', () => {
		expect(stripDecoratedServePrefixes('/__ns_boot__/b1/__ns_hmr__/v492/src/app/components/checkin/checkin.component')).toEqual({
			cleanedSpec: '/src/app/components/checkin/checkin.component',
			bootTaggedRequest: true,
			forcedVer: 'v492',
		});
	});

	it('preserves nonce and live request tags', () => {
		expect(stripDecoratedServePrefixes('/__ns_hmr__/live/src/app/app.routes')).toEqual({
			cleanedSpec: '/src/app/app.routes',
			bootTaggedRequest: false,
			forcedVer: 'live',
		});
		expect(stripDecoratedServePrefixes('/__ns_hmr__/n1/src/app/components/signup/signup.component')).toEqual({
			cleanedSpec: '/src/app/components/signup/signup.component',
			bootTaggedRequest: false,
			forcedVer: 'n1',
		});
	});

	it('keeps app module rewrites stable regardless of the supplied tag', () => {
		// The `ver` argument is preserved on the function signature for
		// API compatibility, but it is now ignored for app modules.
		// Cache busting is driven by `__nsInvalidateModules`, not URL
		// versioning.
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/app.routes', 'live', false)).toBe('/ns/m/src/app/app.routes');
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/components/signup/signup.component', 'n1', false)).toBe('/ns/m/src/app/components/signup/signup.component');
		expect(rewriteNsMImportPathForHmr('/ns/m/src/app/components/signup/signup.component', 0, false)).toBe('/ns/m/src/app/components/signup/signup.component');
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
