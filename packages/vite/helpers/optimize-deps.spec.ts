import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { excludedSpecifierPattern, getOptimizeDepsDefine, isExcludedSpecifier, NS_OPTIMIZE_DEPS_EXCLUDE, optimizeDepsEsmRequirePlugin } from './optimize-deps.js';

describe('isExcludedSpecifier / excludedSpecifierPattern', () => {
	const names = ['@nativescript/core', 'node:module', 'set-value'];

	it('match a listed package and its subpaths, never a package sharing a prefix', () => {
		for (const spec of ['@nativescript/core', '@nativescript/core/ui/core/view', 'node:module', 'set-value']) {
			expect(isExcludedSpecifier(spec, names)).toBe(true);
			expect(excludedSpecifierPattern(names).test(spec)).toBe(true);
		}
		for (const spec of ['@nativescript/core-extra', '@nativescript/coreui', 'set-value-x', 'module']) {
			expect(isExcludedSpecifier(spec, names)).toBe(false);
			expect(excludedSpecifierPattern(names).test(spec)).toBe(false);
		}
	});
});

describe('NS_OPTIMIZE_DEPS_EXCLUDE', () => {
	it('keeps the single-instance packages and the aliased shims external to pre-bundles', () => {
		expect([...NS_OPTIMIZE_DEPS_EXCLUDE].sort()).toEqual(['@nativescript/core', '@nativescript/vite', 'module', 'node:module', 'set-value']);
	});
});

describe('optimizeDepsEsmRequirePlugin', () => {
	let tmp: string | undefined;
	let server: ViteDevServer | undefined;
	afterEach(async () => {
		await server?.close();
		server = undefined;
		if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
		tmp = undefined;
	});

	const write = (file: string, content: string) => {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, content);
	};

	it('pre-bundles a require() of an excluded package or subpath as an ESM import of the served module', async () => {
		tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-optimize-deps-require-')));
		const root = tmp;
		write(path.join(root, 'package.json'), '{"name":"app","private":true}');
		write(path.join(root, 'node_modules/cjs-dep/package.json'), '{"name":"cjs-dep","version":"1.0.0","main":"index.js"}');
		write(path.join(root, 'node_modules/cjs-dep/index.js'), "exports.app = require('excluded-pkg').app;\nexports.View = require('excluded-pkg/ui/view').View;\n");
		write(path.join(root, 'node_modules/excluded-pkg/package.json'), '{"name":"excluded-pkg","version":"1.0.0","main":"index.js","type":"module"}');
		write(path.join(root, 'node_modules/excluded-pkg/index.js'), "export const app = 'app';\n");
		write(path.join(root, 'node_modules/excluded-pkg/ui/view.js'), 'export class View {}\n');
		const exclude = ['excluded-pkg'];
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			server: { middlewareMode: true, ws: false, watch: null },
			optimizeDeps: { noDiscovery: true, include: ['cjs-dep'], exclude, rolldownOptions: { plugins: [optimizeDepsEsmRequirePlugin(exclude)] } },
		});
		const env = server.environments.client;
		await env.depsOptimizer!.init();
		const info = env.depsOptimizer!.metadata.optimized['cjs-dep'];
		const prebundle = fs.readFileSync(info.file, 'utf8');
		expect(prebundle).not.toMatch(/__require\(|(?<![\w$.])require\(/);
		expect(prebundle).toMatch(/^import \* as \S+ from "excluded-pkg";$/m);
		expect(prebundle).toMatch(/^import \* as \S+ from "excluded-pkg\/ui\/view";$/m);

		const served = await env.transformRequest(`/node_modules/.vite/deps/cjs-dep.js?v=${info.browserHash}`);
		const importer = path.join(root, 'index.html');
		for (const spec of ['excluded-pkg', 'excluded-pkg/ui/view']) {
			const appId = (await env.pluginContainer.resolveId(spec, importer))!.id;
			expect(served!.code).toContain(`from "${appId.slice(root.length)}"`);
		}
	});

	it('pre-bundles __non_webpack_require__ like require(): literal calls bundled or imported, non-literal ones through __require', async () => {
		tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-optimize-deps-nwr-')));
		const root = tmp;
		write(path.join(root, 'package.json'), '{"name":"app","private":true}');
		write(path.join(root, 'node_modules/cjs-dep/package.json'), '{"name":"cjs-dep","version":"1.0.0","main":"index.js"}');
		write(path.join(root, 'node_modules/cjs-dep/index.js'), "exports.app = __non_webpack_require__('excluded-pkg').app;\nexports.local = __non_webpack_require__('./local.js').local;\nexports.load = (name) => __non_webpack_require__(name);\n");
		write(path.join(root, 'node_modules/cjs-dep/local.js'), "exports.local = 'local-value';\n");
		write(path.join(root, 'node_modules/excluded-pkg/package.json'), '{"name":"excluded-pkg","version":"1.0.0","main":"index.js","type":"module"}');
		write(path.join(root, 'node_modules/excluded-pkg/index.js'), "export const app = 'app';\n");
		const exclude = ['excluded-pkg'];
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			server: { middlewareMode: true, ws: false, watch: null },
			optimizeDeps: { noDiscovery: true, include: ['cjs-dep'], exclude, rolldownOptions: { plugins: [optimizeDepsEsmRequirePlugin(exclude)], transform: { define: getOptimizeDepsDefine('development') } } },
		});
		const env = server.environments.client;
		await env.depsOptimizer!.init();
		const prebundle = fs.readFileSync(env.depsOptimizer!.metadata.optimized['cjs-dep'].file, 'utf8');
		expect(prebundle).not.toContain('__non_webpack_require__');
		expect(prebundle).toMatch(/^import \* as \S+ from "excluded-pkg";$/m);
		expect(prebundle).toContain('local-value');
		expect(prebundle).not.toMatch(/__require\(\s*["'`]/);
		expect(prebundle).toMatch(/__require\(name\)/);
	});
});
