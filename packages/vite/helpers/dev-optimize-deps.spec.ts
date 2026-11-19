import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { getPlatformMainPackageNames, hasJavaScriptEntry, packageNameOf, resolveFileWithExtensions, resolvePackageEntryFile, staticImportSpecifiers, toEntryPattern } from './dev-optimize-deps.js';

let tmp: string | undefined;
let server: ViteDevServer | undefined;
const cwd = process.cwd();
afterEach(async () => {
	await server?.close();
	server = undefined;
	process.chdir(cwd);
	if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
	tmp = undefined;
});
const EXTENSIONS = ['.ios.ts', '.ts', '.ios.js', '.js'];

const makeRoot = () => (tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-dev-optimize-deps-'))));
const write = (file: string, content = '') => {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
};
const pkg = (dir: string, json: Record<string, unknown>) => write(path.join(dir, 'package.json'), JSON.stringify(json));

describe('specifier helpers', () => {
	it('packageNameOf strips subpaths, scoped or not', () => {
		expect(packageNameOf('@scope/pkg/sub/file.js')).toBe('@scope/pkg');
		expect(packageNameOf('@scope/pkg')).toBe('@scope/pkg');
		expect(packageNameOf('pkg/sub')).toBe('pkg');
	});

	it('staticImportSpecifiers reads top-level import statements only', () => {
		const code = ["import 'a';", "import { b } from 'b/sub';", 'import * as c from "c";', "console.info('import d from x');", "  import('dynamic');", "import { e as f } from '/src/e.ts';"].join('\n');
		expect(staticImportSpecifiers(code)).toEqual(['a', 'b/sub', 'c', '/src/e.ts']);
	});

	it('toEntryPattern makes a root-relative pattern matching only that file', () => {
		expect(toEntryPattern('/app/src/pages/[id].ts', '/app')).toBe('src/pages/\\[id\\].ts');
		expect(toEntryPattern('/repo/packages/core/index.ts', '/repo/apps/app')).toBe('../../packages/core/index.ts');
	});
});

describe('package helpers', () => {
	it('resolveFileWithExtensions tries the path, then each extension, then index with each extension', () => {
		const root = makeRoot();
		write(path.join(root, 'a.ios.ts'));
		write(path.join(root, 'a.ts'));
		write(path.join(root, 'dir/index.ios.js'));
		write(path.join(root, 'exact.js'));
		const exts = ['.ios.ts', '.ts', '.ios.js', '.js'];
		expect(resolveFileWithExtensions(path.join(root, 'a'), exts)).toBe(path.join(root, 'a.ios.ts'));
		expect(resolveFileWithExtensions(path.join(root, 'dir'), exts)).toBe(path.join(root, 'dir/index.ios.js'));
		expect(resolveFileWithExtensions(path.join(root, 'exact.js'), exts)).toBe(path.join(root, 'exact.js'));
		expect(resolveFileWithExtensions(path.join(root, 'missing'), exts)).toBeUndefined();
	});

	it('finds the platform-main packages and the packages with a JavaScript entry', () => {
		const root = makeRoot();
		const nm = path.join(root, 'node_modules');
		pkg(path.join(nm, 'ns-plugin'), { name: 'ns-plugin', main: 'index' });
		write(path.join(nm, 'ns-plugin/index.ios.js'));
		pkg(path.join(nm, 'esm-lib'), { name: 'esm-lib', module: 'index.mjs' });
		pkg(path.join(nm, 'css-only'), { name: 'css-only' });
		write(path.join(nm, 'css-only/theme.css'));
		pkg(path.join(nm, 'index-only'), { name: 'index-only' });
		write(path.join(nm, 'index-only/index.js'));
		expect(getPlatformMainPackageNames(['ns-plugin', 'esm-lib', 'css-only', 'missing'], root, 'ios')).toEqual(['ns-plugin']);
		expect(['ns-plugin', 'esm-lib', 'css-only', 'index-only', 'missing'].filter((name) => hasJavaScriptEntry(name, root))).toEqual(['ns-plugin', 'esm-lib', 'index-only']);
	});

	it('resolvePackageEntryFile prefers the platform main, then the root export, module, main and index', () => {
		const root = makeRoot();
		const entry = (name: string, json: Record<string, unknown>, files: string[]) => {
			const dir = path.join(root, name);
			pkg(dir, { name, ...json });
			for (const file of files) write(path.join(dir, file));
			return resolvePackageEntryFile(dir, 'ios', EXTENSIONS) && path.relative(dir, resolvePackageEntryFile(dir, 'ios', EXTENSIONS)!);
		};
		expect(entry('platform-main', { main: 'index', module: 'esm.js' }, ['index.ios.js', 'index.js', 'esm.js'])).toBe('index.ios.js');
		expect(entry('exports-string', { exports: './dist/esm.js', main: 'cjs.js' }, ['dist/esm.js', 'cjs.js'])).toBe('dist/esm.js');
		expect(entry('exports-conditions', { exports: { '.': { require: './cjs.js', import: './esm.mjs' }, './package.json': './package.json' } }, ['cjs.js', 'esm.mjs'])).toBe('esm.mjs');
		expect(entry('module-field', { module: 'm.js', main: 'c.js' }, ['m.js', 'c.js'])).toBe('m.js');
		expect(entry('index-only', {}, ['index.ts'])).toBe('index.ts');
		expect(entry('none', { main: 'missing.js' }, [])).toBeUndefined();
	});
});

describe('getDevOptimizeDeps', () => {
	it('derives entries, include and exclude from the app, the dev boot module and the dev client', async () => {
		const root = makeRoot();
		const nm = path.join(root, 'node_modules');
		pkg(root, { name: 'app', main: 'src/main.ts', dependencies: { '@nativescript/core': '*', 'cjs-lib': '*', 'css-only': '*', 'ns-plugin': '*', 'linked-lib': '*', '@valor/nativescript-websockets': '*' }, devDependencies: { 'linked-tool': '*' } });
		write(path.join(root, 'src/main.ts'));
		write(path.join(root, 'src/polyfills.ts'));
		write(path.join(root, 'src/pages/home.xml'));
		write(path.join(root, 'src/pages/home.ts'));
		write(path.join(root, 'src/pages/home.android.xml'));
		write(path.join(root, 'src/pages/home.android.ts'));
		write(path.join(root, 'src/util.ts'));
		pkg(path.join(nm, 'cjs-lib'), { name: 'cjs-lib', main: 'index.js' });
		pkg(path.join(nm, 'css-only'), { name: 'css-only' });
		pkg(path.join(nm, 'ns-plugin'), { name: 'ns-plugin', main: 'index' });
		write(path.join(nm, 'ns-plugin/index.ios.js'));
		pkg(path.join(nm, '@valor/nativescript-websockets'), { name: '@valor/nativescript-websockets', main: 'index' });
		write(path.join(nm, '@valor/nativescript-websockets/index.js'));
		for (const name of ['linked-lib', 'linked-tool']) {
			pkg(path.join(root, 'libs', name), { name, main: 'index.js' });
			write(path.join(root, 'libs', name, 'index.js'));
			fs.symlinkSync(path.join(root, 'libs', name), path.join(nm, name));
		}
		const core = path.join(root, 'core-src');
		for (const file of ['index.ts', 'globals/index.ts', 'application/index.ios.ts', 'application/index.android.ts', 'bundle-entry-points.ts', 'inspector_modules.ts']) write(path.join(core, file));
		const nsVite = path.join(nm, '@nativescript/vite');
		for (const file of ['runtime/core-aliases-early.js', 'hmr/shared/runtime/session-bootstrap.js', 'hmr/shared/runtime/dev-globals.js']) write(path.join(nsVite, file));

		process.chdir(root);
		vi.resetModules();
		const { getDevOptimizeDeps } = await import('./dev-optimize-deps.js');
		const deps = getDevOptimizeDeps({ projectRoot: root, flavor: 'typescript', platform: 'ios', extensions: EXTENSIONS, packageDirs: { '@nativescript/core': core } });

		expect(deps.exclude).toEqual(['@nativescript/core', '@nativescript/vite', 'set-value', 'module', 'node:module', 'linked-lib', 'linked-tool', 'ns-plugin', '@valor/nativescript-websockets']);
		expect(deps.include).toEqual(['cjs-lib']);
		expect(deps.entries).toEqual(['src/main.ts', 'src/polyfills.ts', 'src/pages/home.ts', 'core-src/globals/index.ts', 'core-src/application/index.ios.ts', 'node_modules/@nativescript/vite/runtime/core-aliases-early.js', 'core-src/bundle-entry-points.ts', 'node_modules/@valor/nativescript-websockets/index.js', 'node_modules/@nativescript/vite/hmr/shared/runtime/session-bootstrap.js', 'core-src/inspector_modules.ts', 'node_modules/@nativescript/vite/hmr/shared/runtime/dev-globals.js', 'core-src/index.ts', 'node_modules/linked-lib/index.js', 'node_modules/ns-plugin/index.ios.js']);
	});

	it('pre-bundles the third-party imports of served linked and platform-main packages at scan time', async () => {
		const root = makeRoot();
		const nm = path.join(root, 'node_modules');
		pkg(root, { name: 'app', main: 'src/main.ts', dependencies: { 'linked-plugin': '*', 'platform-plugin': '*' } });
		write(path.join(root, 'src/main.ts'), "import { a } from 'linked-plugin';\nimport { b } from 'platform-plugin';\nconsole.log(a, b);\n");
		pkg(path.join(root, 'libs/linked-plugin'), { name: 'linked-plugin', main: 'index.js', type: 'module' });
		write(path.join(root, 'libs/linked-plugin/index.js'), "import dep from 'cjs-a';\nexport const a = dep.value;\n");
		pkg(path.join(nm, 'platform-plugin'), { name: 'platform-plugin', main: 'index' });
		write(path.join(nm, 'platform-plugin/index.ios.js'), "import dep from 'cjs-b';\nexport const b = dep.value;\n");
		fs.symlinkSync(path.join(root, 'libs/linked-plugin'), path.join(nm, 'linked-plugin'));
		for (const name of ['cjs-a', 'cjs-b']) {
			pkg(path.join(nm, name), { name, version: '1.0.0', main: 'index.js' });
			write(path.join(nm, name, 'index.js'), `module.exports = { value: '${name}' };\n`);
		}

		process.chdir(root);
		vi.resetModules();
		const { getDevOptimizeDeps } = await import('./dev-optimize-deps.js');
		const deps = getDevOptimizeDeps({ projectRoot: root, flavor: 'typescript', platform: 'ios', extensions: EXTENSIONS });
		expect(deps.exclude).toEqual(expect.arrayContaining(['linked-plugin', 'platform-plugin']));
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			resolve: { preserveSymlinks: true, extensions: EXTENSIONS },
			server: { middlewareMode: true, ws: false, watch: null },
			// Without a crawl, the default hold would keep the optimizer (and `server.close()`) waiting for one.
			optimizeDeps: { ...deps, holdUntilCrawlEnd: false },
		});
		const env = server.environments.client;
		await env.depsOptimizer!.init();
		await env.depsOptimizer!.scanProcessing;
		expect(Object.keys(env.depsOptimizer!.metadata.discovered)).toEqual(expect.arrayContaining(['cjs-a', 'cjs-b']));

		for (const [url, dep] of [
			['/node_modules/linked-plugin/index.js', 'cjs-a'],
			['/node_modules/platform-plugin/index.ios.js', 'cjs-b'],
		]) {
			const served = await env.transformRequest(url);
			expect(served!.code).toMatch(new RegExp(`from "/node_modules/\\.vite/deps/${dep}\\.js\\?v=`));
		}
	});
});
