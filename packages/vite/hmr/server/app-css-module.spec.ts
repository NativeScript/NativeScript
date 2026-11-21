import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { registerFrameworkFlavor } from '../framework-flavors.js';
import { NS_UPDATE_RERUN_EVENT } from '../shared/protocol.js';
import { nsAppCssModulePlugins } from './app-css-module.js';
import { nsEntryBoundaryPlugin } from './entry-boundary.js';
import { getModuleEdits, nsRerunPlugin } from './update-gate.js';

const ENTRY_SOURCE = "import { page } from './page.js';\nexport const app = [page];\n";

/** Stands in for Tailwind v3: reports its content files as a PostCSS `dir-dependency`. */
const contentDependencyPlugin = {
	postcssPlugin: 'content-dependency',
	Once(_root: unknown, { result }: { result: { messages: unknown[]; opts: { from?: string } } }) {
		result.messages.push({ type: 'dir-dependency', plugin: 'content-dependency', dir: path.join(path.dirname(result.opts.from!), 'content'), glob: '**/*.{xml,html}', parent: result.opts.from });
	},
};

/** Analog's `handleHotUpdate` for a non-component `.css` edit: the edited modules are swapped for their importers. */
const analogLikePlugin: Plugin = {
	name: 'analog-like',
	handleHotUpdate(ctx) {
		if (!ctx.file.endsWith('.css')) return;
		return ctx.modules.flatMap((mod) => [...mod.importers]);
	},
};

/** A framework hook that claims an `.html` edit as handled. */
const dropsHtmlPlugin: Plugin = {
	name: 'drops-html',
	handleHotUpdate(ctx) {
		if (ctx.file.endsWith('.html')) return [];
	},
};

describe('nsAppCssModulePlugins', () => {
	let root: string;
	let server: ViteDevServer;
	let sent: any[];
	let httpServer: http.Server | undefined;

	async function start(options: { stylesheet?: boolean; entryBoundary?: boolean; plugins?: Plugin[]; postcssPlugins?: unknown[]; files?: Record<string, string> } = {}) {
		const files: Record<string, string> = {
			'package.json': JSON.stringify({ main: 'main.js' }),
			'fw.js': 'export function dispose() {}\nexport function settled() {}\n',
			'main.js': ENTRY_SOURCE,
			'page.js': "export const page = 'page';\n",
			'_partial.css': '.partial { color: green; }\n',
			'content/one.xml': '<Label class="one"/>\n',
			'content/one.html': '<Label class="one"></Label>\n',
			'other.html': '<Label class="other"></Label>\n',
			...options.files,
		};
		if (options.stylesheet !== false) files['app.css'] = "@import './_partial.css';\n.app { color: red; }\n";
		root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-app-css-module-')));
		for (const [name, content] of Object.entries(files)) {
			fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
			fs.writeFileSync(path.join(root, name), content);
		}
		registerFrameworkFlavor({ flavor: 'app-css-module-spec', server: { flavor: 'app-css-module-spec', entryBoundary: { module: './fw.js', dispose: 'dispose', settled: 'settled' } } });
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
		const stylesheet = path.join(root, 'app.css');
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			optimizeDeps: { noDiscovery: true, include: [] },
			css: { postcss: { plugins: (options.postcssPlugins ?? []) as any[] } },
			server: { middlewareMode: true, ws: false, watch: null },
			// The order getHMRPlugins registers them in.
			plugins: [capture, ...(options.plugins ?? []), ...nsAppCssModulePlugins({ resolveStylesheet: () => (fs.existsSync(stylesheet) ? stylesheet : null) }), nsRerunPlugin(), ...(options.entryBoundary ? [nsEntryBoundaryPlugin({ flavor: 'app-css-module-spec' })!] : [])],
		});
		await server.environments.client.transformRequest('/main.js');
		await server.environments.client.transformRequest('/page.js');
		if (options.stylesheet !== false) await server.environments.client.transformRequest('/app.css');
	}

	async function edit(name: string, content?: string) {
		const file = path.join(root, name);
		fs.writeFileSync(file, content ?? fs.readFileSync(file, 'utf8') + '/* edited */\n');
		server.watcher.emit('change', file);
		await expect.poll(() => sent.some((p) => p?.type === 'update' || p?.type === 'full-reload'), { timeout: 5000 }).toBe(true);
		return { meta: sent.find((p) => p?.event === NS_UPDATE_RERUN_EVENT)?.data, update: sent.find((p) => p?.type === 'update'), fullReload: sent.find((p) => p?.type === 'full-reload') };
	}

	afterEach(async () => {
		await new Promise((resolve) => (httpServer ? httpServer.close(resolve) : resolve(undefined)));
		httpServer = undefined;
		await server?.close();
		fs.rmSync(root, { recursive: true, force: true });
	});

	it('imports the stylesheet from the app entry, on its first line', async () => {
		await start();
		const result = await server.environments.client.transformRequest('/main.js');
		expect(result!.code.split('\n')[0]).toMatch(/^import "\/app\.css";import \{ page \} from "\/page\.js";$/);
		const entry = server.environments.client.moduleGraph.getModuleById(path.join(root, 'main.js'))!;
		expect([...entry.importedModules].map((mod) => mod.url)).toContain('/app.css');
	});

	it('leaves other modules and other environments alone', async () => {
		await start();
		expect((await server.environments.client.transformRequest('/page.js'))!.code).not.toContain('app.css');
		expect((await server.environments.ssr.transformRequest('/main.js'))!.code).not.toContain('app.css');
	});

	it('does nothing without a global stylesheet', async () => {
		await start({ stylesheet: false });
		expect((await server.environments.client.transformRequest('/main.js'))!.code).not.toContain('.css');
	});

	it('evaluates the stylesheet before the entry body when the entry is a soft-reboot boundary', async () => {
		await start({ entryBoundary: true });
		const code = (await server.environments.client.transformRequest('/main.js'))!.code;
		const cssAt = code.indexOf('import "/app.css";');
		expect(code.indexOf('import.meta.hot.accept()')).toBeGreaterThan(-1);
		expect(cssAt).toBeGreaterThan(-1);
		expect(cssAt).toBeLessThan(code.indexOf('import { page }'));
		expect(cssAt).toBeLessThan(code.indexOf('export const app'));
	});

	it('serves the device a self-accepting CSS-as-JS module with @imports inlined', async () => {
		await start();
		httpServer = http.createServer(server.middlewares);
		await new Promise<void>((resolve) => httpServer!.listen(0, '127.0.0.1', resolve));
		const { port } = httpServer.address() as { port: number };
		const response = await fetch(`http://127.0.0.1:${port}/app.css`, { headers: { accept: '*/*' } });
		expect(response.headers.get('content-type')).toMatch(/javascript/);
		const body = await response.text();
		expect(body).toContain('__vite__updateStyle(__vite__id, __vite__css)');
		expect(body).toContain('import.meta.hot.accept()');
		expect(body).toContain('.partial');
		expect(body).not.toContain('@import');
	});

	it('updates the stylesheet in place when it is edited', async () => {
		await start({ entryBoundary: true });
		const { meta, update } = await edit('app.css');
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
		expect(meta.rerun).toEqual(['/app.css']);
		expect(meta.changed).toEqual(['/app.css']);
	});

	it('keeps the stylesheet its own update when a framework hook swaps its modules for the entry', async () => {
		await start({ entryBoundary: true, plugins: [analogLikePlugin] });
		const { meta, update } = await edit('app.css');
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
		expect(meta.rerun).toEqual(['/app.css']);
		expect([...getModuleEdits(server).keys()]).toEqual(['/app.css']);
	});

	it('updates the stylesheet when an @imported partial is edited', async () => {
		await start({ entryBoundary: true });
		const { update } = await edit('_partial.css');
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
	});

	it('updates the stylesheet when a PostCSS content dependency is edited', async () => {
		await start({ entryBoundary: true, postcssPlugins: [contentDependencyPlugin] });
		const { update, fullReload } = await edit('content/one.xml', '<Label class="two"/>\n');
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
		expect(fullReload).toBeUndefined();
	});

	it('updates the stylesheet in place when an .html content dependency is edited', async () => {
		await start({ entryBoundary: true, postcssPlugins: [contentDependencyPlugin] });
		const { update, fullReload } = await edit('content/one.html', '<Label class="two"></Label>\n');
		expect(fullReload).toBeUndefined();
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
	});

	it('updates the stylesheet when a framework hook drops an .html content dependency', async () => {
		await start({ entryBoundary: true, postcssPlugins: [contentDependencyPlugin], plugins: [dropsHtmlPlugin] });
		const { update, fullReload } = await edit('content/one.html', '<Label class="two"></Label>\n');
		expect(fullReload).toBeUndefined();
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/app.css', acceptedPath: '/app.css' })]);
	});

	it('keeps the other modules of an .html content dependency', async () => {
		await start({ entryBoundary: true, postcssPlugins: [contentDependencyPlugin], files: { 'page.js': "import one from './content/one.html?raw';\nexport const page = one;\n" } });
		await server.environments.client.transformRequest('/content/one.html?raw');
		const { update, fullReload } = await edit('content/one.html', '<Label class="two"></Label>\n');
		expect(fullReload).toBeUndefined();
		expect(update.updates.map((u: any) => u.path).sort()).toEqual(['/app.css', '/main.js']);
	});

	it('leaves an .html that is not a stylesheet dependency alone', async () => {
		await start({ entryBoundary: true, postcssPlugins: [contentDependencyPlugin], files: { 'page.js': "import other from './other.html?raw';\nexport const page = other;\n" } });
		await server.environments.client.transformRequest('/other.html?raw');
		const { update, fullReload } = await edit('other.html', '<Label class="two"></Label>\n');
		expect(fullReload).toBeUndefined();
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/main.js', acceptedPath: '/main.js' })]);
	});
});
