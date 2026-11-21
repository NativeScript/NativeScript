import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NS_UPDATE_RERUN_EVENT } from '../hmr/shared/protocol.js';

const fixture = vi.hoisted(() => ({ root: '', flags: {} as Record<string, unknown> }));

vi.mock('./base.js', () => ({ baseConfig: vi.fn(() => ({})) }));
vi.mock('../helpers/typescript-check.js', () => ({ getTypeCheckPlugins: vi.fn(() => []) }));
vi.mock('../helpers/cli-flags.js', () => ({ getCliFlags: () => fixture.flags, resolvePlatform: () => 'ios' }));
vi.mock('../helpers/project.js', () => ({
	getPackageJson: () => JSON.parse(fs.readFileSync(path.join(fixture.root, 'package.json'), 'utf8')),
	getProjectFilePath: (rel: string) => path.join(fixture.root, rel),
	getProjectRootPath: () => fixture.root,
}));
vi.mock('../helpers/utils.js', () => ({
	getProjectAppPath: () => path.join(fixture.root, 'src'),
	resolveProjectGlobalCssPath: () => path.join(fixture.root, 'src', 'app.css'),
}));

import { javascriptConfig } from './javascript.js';
import { typescriptConfig } from './typescript.js';
import { createUiRegistrationCode, createUiRegistrationPlugin } from '../helpers/ui-registration.js';
import { nsAppCssModulePlugins } from '../hmr/server/app-css-module.js';
import { nsEntryBoundaryPlugin } from '../hmr/server/entry-boundary.js';
import { nsRerunPlugin } from '../hmr/server/update-gate.js';

const REBOOT_MODULE = fileURLToPath(new URL('../hmr/frameworks/core/client/reboot.ts', import.meta.url));

function writeFixture(files: Record<string, string>) {
	fixture.root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-served-context-')));
	for (const [name, content] of Object.entries(files)) {
		fs.mkdirSync(path.dirname(path.join(fixture.root, name)), { recursive: true });
		fs.writeFileSync(path.join(fixture.root, name), content);
	}
}

function pluginsOf(config: { plugins?: unknown[] }): Plugin[] {
	return (config.plugins as any[]).flat(Infinity).filter(Boolean);
}

function pluginNamed(config: { plugins?: unknown[] }, name: string): any {
	return pluginsOf(config).find((p) => p.name === name);
}

async function contextCode(config: { plugins?: unknown[] }, name: string, command?: 'serve' | 'build'): Promise<string> {
	const plugin = pluginNamed(config, name);
	if (command) plugin.configResolved({ command, root: fixture.root });
	return (await plugin.load('\0virtual:ns-bundler-context')).code;
}

/**
 * Faithful extraction of core's module registry (`packages/core/globals/index.ts`:
 * `registerModule`, `_unregisterModule`, `registerBundlerModules`,
 * `moduleExists`, `loadModule` without the CommonJS resolver fallback).
 */
function createCoreRegistry() {
	const modules = new Map<string, { moduleId: string; loader: (name: string) => any }>();
	const global: any = {};
	const defaultExtensionMap: Record<string, string> = { '.js': '.js', '.ts': '.js', '.kt': '.js', '.css': '.css', '.scss': '.css', '.less': '.css', '.sass': '.css', '.xml': '.xml' };
	global.registerModule = (name: string, loader: any) => modules.set(name, { loader, moduleId: name });
	global._unregisterModule = (name: string) => modules.delete(name);
	global.moduleExists = (name: string) => modules.has(name);
	global.loadModule = (name: string) => modules.get(name)?.loader(name) ?? null;
	global.registerBundlerModules = (context: any, extensionMap: Record<string, string> = {}) => {
		const registerWithName = (nickName: string, moduleId: string) => modules.set(nickName, { moduleId, loader: () => context(moduleId) });
		const registerModuleById = (moduleId: string) => {
			const extDotIndex = moduleId.lastIndexOf('.');
			const base = moduleId.substring(0, extDotIndex);
			const originalExt = moduleId.substring(extDotIndex);
			const registerExt = extensionMap[originalExt] || defaultExtensionMap[originalExt] || originalExt;
			const isSourceFile = originalExt !== registerExt;
			const registerName = base + registerExt;
			if (registerName.startsWith('./') && registerName.endsWith('.js')) {
				[registerName.substring(2, registerName.length - 3), registerName.substring(0, registerName.length - 3), registerName.substring(2)].forEach((nick) => {
					if (isSourceFile || !global.moduleExists(nick)) registerWithName(nick, moduleId);
				});
			} else if (registerName.startsWith('./')) {
				[registerName.substring(2)].forEach((nick) => {
					if (!global.moduleExists(nick)) registerWithName(nick, moduleId);
				});
			}
			if (isSourceFile || !global.moduleExists(registerName)) registerWithName(registerName, moduleId);
		};
		context.keys().forEach(registerModuleById);
	};
	return { global, modules };
}

/** Evaluates generated context code with its imports bound to `imports[specifier]`. */
function evaluateContext(code: string, global: any, imports: Record<string, unknown>) {
	const body = code.replace(/^import (?:\* as )?(\w+) from ("[^"]+");$/gm, (_m, local, spec) => `const ${local} = __imports[${spec}];`);
	expect(body).not.toMatch(/^import /m);
	new Function('global', 'globalThis', '__imports', body)(global, global, imports);
}

describe.each([
	['typescript', () => typescriptConfig({ mode: 'development' }), () => typescriptConfig({ mode: 'production' }), 'ns-bundler-context-ts', 'main-page.ts'],
	['javascript', () => javascriptConfig({ mode: 'development' }), () => javascriptConfig({ mode: 'production' }), 'ns-bundler-context-js', 'main-page.js'],
] as const)('%s bundler context', (flavor, dev, release, pluginName, codeBehind) => {
	beforeEach(() => {
		fixture.flags = { hmr: true };
		writeFixture({
			'package.json': JSON.stringify({ main: flavor === 'typescript' ? 'src/main.ts' : 'src/app.js' }),
			'src/main-page.xml': '<Page/>',
			'src/main-page.css': '.a {}',
			[`src/${codeBehind}`]: 'export const v = 1;',
			[flavor === 'typescript' ? 'src/main.ts' : 'src/app.js']: '',
		});
	});
	afterEach(() => {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	});

	it('re-registers only when served; the built context is unchanged', async () => {
		const unconfigured = await contextCode(release(), pluginName);
		const built = await contextCode(release(), pluginName, 'build');
		expect(built).toBe(unconfigured);
		expect(built).not.toContain('_unregisterModule');
		expect(await contextCode(dev(), pluginName, 'build')).not.toContain('_unregisterModule');
		expect(await contextCode(dev(), pluginName, 'serve')).toContain('_unregisterModule');
	});

	it('a re-evaluated served context replaces the XML, stylesheet and code-behind the registry serves', async () => {
		const code = await contextCode(dev(), pluginName, 'serve');
		const spec = (file: string) => `/${path.join(fixture.root, 'src', file).replace(/^\/+/, '')}`;
		const { global } = createCoreRegistry();
		const evaluate = (version: number) =>
			evaluateContext(code, global, {
				[`${spec('main-page.xml')}?raw`]: `<Page v="${version}"/>`,
				[`${spec('main-page.css')}?raw`]: `.a { order: ${version}; }`,
				[spec(codeBehind)]: { v: version },
			});

		evaluate(1);
		expect(global.loadModule('main-page.xml')).toBe('<Page v="1"/>');
		evaluate(2);
		for (const name of ['main-page.xml', './main-page.xml']) expect(global.loadModule(name)).toBe('<Page v="2"/>');
		for (const name of ['main-page.css', './main-page.css']) expect(global.loadModule(name)).toBe('.a { order: 2; }');
		for (const name of ['main-page', './main-page', 'main-page.js', './main-page.js']) expect(global.loadModule(name)).toEqual({ v: 2 });
	});

	it('keeps the core registry intact for names it does not own', async () => {
		const code = await contextCode(dev(), pluginName, 'serve');
		const { global } = createCoreRegistry();
		global.registerModule('Frame', () => 'frame');
		evaluateContext(code, global, {});
		evaluateContext(code, global, {});
		expect(global.loadModule('Frame')).toBe('frame');
	});

	it('the HMR boot bundle leaves the context to the served entry', () => {
		const withContext = createUiRegistrationCode(flavor);
		expect(withContext).toContain(`import 'virtual:ns-bundler-context';`);
		const hmr = createUiRegistrationCode(flavor, { hmrActive: true });
		expect(hmr).not.toContain('virtual:ns-bundler-context');
		expect(hmr).toBe(withContext.replace(`import 'virtual:ns-bundler-context';\n`, ''));

		const load = (mode: string) => {
			const plugin = createUiRegistrationPlugin(flavor);
			(plugin.configResolved as any)({ mode });
			return (plugin.load as any)('\0virtual:ns-ui-registration').code;
		};
		expect(load('development')).toBe(hmr);
		expect(load('production')).toBe(withContext);
		fixture.flags = {};
		expect(load('development')).toBe(withContext);
	});
});

describe('javascript bundler context', () => {
	afterEach(() => {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	});

	it('leaves the served entry out of the context it imports, and keeps it in the built one', async () => {
		fixture.flags = { hmr: true };
		writeFixture({ 'package.json': JSON.stringify({ main: 'src/app.js' }), 'src/app.js': '', 'src/util.js': '' });
		expect(await contextCode(javascriptConfig({ mode: 'development' }), 'ns-bundler-context-js', 'serve')).not.toContain('src/app.js');
		expect(await contextCode(javascriptConfig({ mode: 'production' }), 'ns-bundler-context-js', 'build')).toContain('src/app.js');
	});
});

// The toolbox's shape: main.ts → Application.run('app-root'); app-root.xml → main-page.
describe('served typescript app entry', () => {
	let server: ViteDevServer;
	let sent: any[];

	beforeEach(async () => {
		fixture.flags = { hmr: true };
		writeFixture({
			'package.json': JSON.stringify({ main: 'src/main.ts' }),
			'core.js': 'export const Application = {}; export const Frame = {};\n',
			'src/main.ts': "import { Application } from '@nativescript/core';\n\nApplication.run({ moduleName: 'app-root' });\n",
			'src/app.css': '.app {}\n',
			'src/app-root.xml': '<Frame defaultPage="main-page"></Frame>\n',
			'src/main-page.xml': '<Page loaded="onLoaded"/>\n',
			'src/main-page.ts': "import { label } from './util';\nexport function onLoaded() { return label; }\n",
			'src/util.ts': "export const label = 'a';\n",
		});
		sent = [];
		const capture: Plugin = {
			name: 'capture-sends',
			configureServer(s) {
				const original = s.ws.send.bind(s.ws) as (...args: any[]) => void;
				(s.ws as any).send = (...args: any[]) => {
					sent.push(typeof args[0] === 'string' ? { type: 'custom', event: args[0], data: args[1] } : args[0]);
					return original(...args);
				};
			},
		};
		const config = typescriptConfig({ mode: 'development' });
		server = await createServer({
			root: fixture.root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, ws: false, watch: null },
			resolve: {
				alias: [
					{ find: /^@nativescript\/core$/, replacement: path.join(fixture.root, 'core.js') },
					{ find: '@nativescript/vite/hmr/frameworks/core/client/reboot.js', replacement: REBOOT_MODULE },
				],
			},
			// Plugin order as in a real config: base's HMR plugins, then the flavor's.
			plugins: [capture, ...nsAppCssModulePlugins(), nsRerunPlugin({ flavor: 'typescript' }), nsEntryBoundaryPlugin({ flavor: 'typescript' })!, ...pluginsOf(config)],
		});
	});

	afterEach(async () => {
		await server?.close();
		fs.rmSync(fixture.root, { recursive: true, force: true });
	});

	async function transformGraph() {
		const seen = new Set<string>();
		const visit = async (url: string) => {
			if (seen.has(url)) return;
			seen.add(url);
			const result = await server.environments.client.transformRequest(url);
			const mod = await server.environments.client.moduleGraph.getModuleByUrl(url);
			for (const dep of mod?.importedModules ?? []) {
				if (dep.url !== '/@vite/client' && !dep.url.includes('core.js') && !dep.url.includes('reboot')) await visit(dep.url);
			}
			return result;
		};
		const entry = await visit('/src/main.ts');
		return { entry: entry!.code, seen };
	}

	it('imports the bundler context first, then the entry boundary and the global stylesheet', async () => {
		const { entry, seen } = await transformGraph();
		expect(entry.split('\n')[0]).toContain(`import "/@id/__x00__virtual:ns-bundler-context";import { registerEntryBoundary as __nsRegisterEntryBoundary } from '/@vite/client';`);
		expect(entry).toMatch(/import \* as __nsFramework from "[^"]*reboot\.ts";/);
		expect(entry).toContain('import.meta.hot.dispose(');
		expect(entry).toMatch(/import "\/src\/app\.css";import \{ Application \} from/);
		const context = await server.environments.client.moduleGraph.getModuleById('\0virtual:ns-bundler-context');
		expect([...context!.importedModules].map((m) => m.url).sort()).toEqual(['/src/app-root.xml?raw', '/src/main-page.ts', '/src/main-page.xml?raw']);
		expect(seen.has('/src/util.ts')).toBe(true);
	});

	it.each([
		['src/main-page.xml', '/src/main-page.xml?raw'],
		['src/main-page.ts', '/src/main-page.ts'],
		['src/util.ts', '/src/util.ts'],
	])('an edit of %s reboots through the entry', async (file, url) => {
		await transformGraph();
		const abs = path.join(fixture.root, file);
		fs.writeFileSync(abs, fs.readFileSync(abs, 'utf8') + '\n');
		server.watcher.emit('change', abs);
		await expect.poll(() => sent.some((p) => p?.type === 'update' || p?.type === 'full-reload'), { timeout: 5000 }).toBe(true);
		const update = sent.find((p) => p?.type === 'update');
		expect(update?.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/src/main.ts', acceptedPath: '/src/main.ts' })]);
		const rerun = sent.find((p) => p?.event === NS_UPDATE_RERUN_EVENT)!.data.rerun as string[];
		expect(rerun).toEqual(expect.arrayContaining([url, '/src/main.ts']));
		expect(rerun).toContain('/@id/__x00__virtual:ns-bundler-context');

		// The device's `import(entry?t=)` re-evaluates the context only if the entry stamps it.
		const entry = (await server.environments.client.transformRequest('/src/main.ts'))!.code;
		expect(entry).toMatch(/"\/@id\/__x00__virtual:ns-bundler-context\?t=\d+"/);
		const context = (await server.environments.client.transformRequest('\0virtual:ns-bundler-context'))!.code;
		const stamped = file.endsWith('.xml') ? /"\/src\/main-page\.xml\?[^"]*\bt=\d+[^"]*"/ : /"\/src\/main-page\.ts\?t=\d+"/;
		expect(context).toMatch(stamped);
	});

	it('registers an added page with the next edit that reboots; removing one restarts the app', async () => {
		await transformGraph();
		const second = path.join(fixture.root, 'src/second.xml');
		const importsOfContext = async () => {
			await server.environments.client.transformRequest('\0virtual:ns-bundler-context');
			const context = await server.environments.client.moduleGraph.getModuleById('\0virtual:ns-bundler-context');
			return [...context!.importedModules].map((m) => m.url);
		};
		const payloads = async (event: 'add' | 'unlink') => {
			sent.length = 0;
			const page = path.join(fixture.root, 'src/main-page.xml');
			fs.writeFileSync(page, fs.readFileSync(page, 'utf8') + '\n');
			server.watcher.emit(event, second);
			server.watcher.emit('change', page);
			await expect.poll(() => sent.some((p) => p?.type === 'update' || p?.type === 'full-reload'), { timeout: 5000 }).toBe(true);
			return sent.map((p) => (p.type === 'custom' ? p.event : p.type));
		};

		fs.writeFileSync(second, '<Page/>\n');
		expect(await payloads('add')).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		expect(await importsOfContext()).toContain('/src/second.xml?raw');

		fs.rmSync(second);
		expect(await payloads('unlink')).toContain('full-reload');
		expect(await importsOfContext()).not.toContain('/src/second.xml?raw');
	});
});
