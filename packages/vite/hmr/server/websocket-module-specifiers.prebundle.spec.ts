import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearVendorManifest, registerVendorManifest } from '../shared/vendor/registry.js';
import { viteDepsPathToBareSpecifier } from './websocket-module-specifiers.js';

describe('viteDepsPathToBareSpecifier', () => {
	beforeEach(() => {
		registerVendorManifest({ hash: 'test', modules: { pkg: {}, '@scope/pkg': {} } } as any);
	});
	afterEach(() => clearVendorManifest());

	it('decodes the dots in a subpath under a vendored package', () => {
		// Vite's flattenId: '/' -> '_', '.' -> '__'.
		expect(viteDepsPathToBareSpecifier('pkg_addons_env_file__js.js')).toBe('pkg/addons/env/file.js');
	});

	it('decodes an extensionless subpath and a scoped package', () => {
		expect(viteDepsPathToBareSpecifier('pkg_examples_controls_orbit.js')).toBe('pkg/examples/controls/orbit');
		expect(viteDepsPathToBareSpecifier('@scope_pkg_lib_x__min.js')).toBe('@scope/pkg/lib/x.min');
	});

	it('returns the package itself for its own prebundle', () => {
		expect(viteDepsPathToBareSpecifier('pkg.js')).toBe('pkg');
	});
});
