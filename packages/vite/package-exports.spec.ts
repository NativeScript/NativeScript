import { describe, expect, it } from 'vitest';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
	exports?: Record<string, unknown>;
};

describe('@nativescript/vite package exports', () => {
	it('exports required HMR runtime helpers', () => {
		const exportsMap = packageJson.exports || {};

		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder.js');
		expect(exportsMap).toHaveProperty('./hmr/frameworks/core/client/reboot');
		expect(exportsMap).toHaveProperty('./hmr/frameworks/core/client/reboot.js');
	});

	it('exports every module the served dev boot and client bootstrap import by bare specifier', () => {
		const exportsMap = packageJson.exports || {};

		for (const subpath of ['./runtime/core-aliases-early.js', './hmr/shared/runtime/root-placeholder.js', './hmr/shared/runtime/session-bootstrap.js', './hmr/shared/runtime/launch-bridge.js', './hmr/shared/runtime/dev-globals.js', './hmr/client/index.js', './runtime/module-require.js', './runtime/strict-global-require.js']) {
			expect(exportsMap).toHaveProperty([subpath]);
		}
	});
});
