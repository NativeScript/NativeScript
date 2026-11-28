import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { angularHmrPayloadRulesPlugins, findResourceOwners, installAngularHmrRules, StaleComponentClasses } from './hmr-payload-rules-plugin.js';
import { ComponentUpdateLedger, NG_COMPONENT_NO_UPDATE_MODULE } from './hmr-payload-rules.js';

const HOME_SOURCE = `import { Component, signal } from '@angular/core';

@Component({
	selector: 'ns-home',
	template: \`<Label text="a"></Label>\`,
})
export class HomeComponent {
	count = signal(0);
}
`;

function createChannel() {
	const listeners = new Map<string, ((...args: any[]) => void)[]>();
	const sent: unknown[][] = [];
	const channel = {
		send: (...args: any[]) => {
			sent.push(args);
		},
		on: (event: string, listener: (...args: any[]) => void) => {
			listeners.set(event, [...(listeners.get(event) ?? []), listener]);
		},
	};
	return { channel, sent, listeners };
}

describe('angularHmrPayloadRulesPlugins', () => {
	let workspace: string;
	let homeFile: string;
	let rootFile: string;
	let channel: ReturnType<typeof createChannel>;
	let plugins: any[];
	let middlewares: any[];

	// Runs the registered middleware the way connect does; `next` means "left to Analog".
	const requestMetadata = (url: string) => {
		const res = {
			statusCode: 0,
			headers: {} as Record<string, string>,
			body: undefined as string | undefined,
			setHeader(k: string, v: string) {
				this.headers[k] = v;
			},
			end(b: string) {
				this.body = b;
			},
		};
		let passed = false;
		middlewares[0]({ url }, res, () => (passed = true));
		return passed ? 'next' : res.body;
	};
	const homeMetadataUrl = (timestamp: number | string) => `/src/app/home/@ng/component?c=${homeId()}&t=${timestamp}`;

	const homeId = () => encodeURIComponent(`${path.relative(workspace, homeFile).split(path.sep).join('/')}@HomeComponent`);
	const rootId = () => encodeURIComponent(`${path.relative(workspace, rootFile).split(path.sep).join('/')}@AppComponent`);

	const saveContext = (file: string, source: string) => ({ type: 'update', file: file.split(path.sep).join('/'), read: async () => source, modules: [], timestamp: 1 });

	const runHook = async (ctx: object, environment = 'client') => {
		await plugins[0].hotUpdate.handler.call({ environment: { name: environment } }, ctx);
	};
	const runPostHook = (ctx: object) => plugins[1].hotUpdate.handler.call({ environment: { name: 'client' } }, ctx);
	const entryUpdate = (timestamp = 9) => channel.channel.send({ type: 'update', updates: [{ type: 'js-update', path: '/src/main.ts', acceptedPath: '/src/main.ts', timestamp }] });

	const sendHomeUpdate = (timestamp = 2) => channel.channel.send('angular:component-update', { id: homeId(), timestamp });

	// Analog buffers its update and flushes it after every hot-update hook has settled.
	const saveComponent = async (source: string) => {
		await runHook(saveContext(homeFile, source));
		sendHomeUpdate();
	};

	beforeEach(() => {
		workspace = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-angular-hmr-rules-')));
		homeFile = path.join(workspace, 'src/app/home/home.component.ts');
		rootFile = path.join(workspace, 'src/app/app.component.ts');
		fs.mkdirSync(path.dirname(homeFile), { recursive: true });
		fs.writeFileSync(homeFile, HOME_SOURCE);
		fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ main: 'src/main.ts' }));

		channel = createChannel();
		plugins = angularHmrPayloadRulesPlugins({
			workspaceRoot: workspace,
			projectRoot: workspace,
			resolveRoot: () => ({ file: rootFile.replace(/\.ts$/, '').split(path.sep).join('/'), className: 'AppComponent' }),
			loadTypeScript: () => ts,
			appDir: path.join(workspace, 'src'),
		});
		middlewares = [];
		plugins[0].configResolved({ root: workspace });
		plugins[0].configureServer({ ws: channel.channel, config: { logger: { warn: vi.fn() } }, middlewares: { use: (fn: any) => middlewares.push(fn) } });
		plugins[0].transform('compiled output', `${homeFile}?v=1`);
	});

	afterEach(() => {
		fs.rmSync(workspace, { recursive: true, force: true });
	});

	it('classifies a save before Analog sees it and undoes its marking after', () => {
		expect(plugins).toHaveLength(2);
		expect(plugins[0].hotUpdate.order).toBe('pre');
		expect(plugins[1].hotUpdate.order).toBe('post');
		expect(plugins.every((plugin) => plugin.apply === 'serve')).toBe(true);
	});

	it('passes a template-only .ts change through as a component update', async () => {
		await saveComponent(HOME_SOURCE.replace('text="a"', 'text="b"'));
		expect(channel.sent).toEqual([['angular:component-update', { id: homeId(), timestamp: 2 }]]);
	});

	it('drops the component update of a class body change', async () => {
		await saveComponent(HOME_SOURCE.replace('signal(0)', 'signal(10)'));
		expect(channel.sent).toEqual([]);
	});

	it("undoes Analog's self-accept marking for a class change, so Vite propagates to the entry", async () => {
		const node = { isSelfAccepting: false, importers: new Set() };
		const ctx = { ...saveContext(homeFile, HOME_SOURCE.replace('signal(0)', 'signal(10)')), modules: [node] };
		await runHook(ctx);
		node.isSelfAccepting = true;
		runPostHook(ctx);
		expect(node.isSelfAccepting).toBe(false);
	});

	it('keeps the marking of a template-only change', async () => {
		const node = { isSelfAccepting: false, importers: new Set() };
		const ctx = { ...saveContext(homeFile, HOME_SOURCE.replace('text="a"', 'text="b"')), modules: [node] };
		await runHook(ctx);
		node.isSelfAccepting = true;
		runPostHook(ctx);
		expect(node.isSelfAccepting).toBe(true);
	});

	it("undoes the marking of the root component's template", async () => {
		const rootTs = { file: rootFile.split(path.sep).join('/') };
		const template = { isSelfAccepting: undefined as boolean | undefined, importers: new Set([rootTs]) };
		const ctx = { ...saveContext(rootFile.replace(/\.ts$/, '.html'), '<GridLayout></GridLayout>'), modules: [template] };
		await runHook(ctx);
		template.isSelfAccepting = true;
		runPostHook(ctx);
		expect(template.isSelfAccepting).toBeUndefined();
	});

	it('treats adding or removing in-place metadata as an in-place change', async () => {
		await saveComponent(HOME_SOURCE.replace("selector: 'ns-home',", "selector: 'ns-home',\n\tstyles: [`Label { color: red; }`],"));
		await saveComponent(HOME_SOURCE.replace(/\ttemplate: .*\n/, ''));
		expect(channel.sent.map((args) => args[0])).toEqual(['angular:component-update', 'angular:component-update']);
	});

	it('compares against the last saved version once the entry reboot re-evaluated the class', async () => {
		const changed = HOME_SOURCE.replace('signal(0)', 'signal(10)');
		await saveComponent(changed);
		entryUpdate();
		await saveComponent(changed.replace('text="a"', 'text="b"'));
		expect(channel.sent.map((args) => (args[0] as { type?: string })?.type ?? args[0])).toEqual(['update', 'angular:component-update']);
	});

	it('keeps a class stale until an entry update or a page full reload goes out', async () => {
		const changed = HOME_SOURCE.replace('signal(0)', 'signal(10)');
		await runHook(saveContext(homeFile, changed));
		channel.channel.send({ type: 'full-reload', path: '/index.html' });
		sendHomeUpdate(3);
		expect(channel.sent.filter((args) => args[0] === 'angular:component-update')).toEqual([]);
		channel.channel.send({ type: 'full-reload', path: '*' });
		sendHomeUpdate(4);
		expect(channel.sent.at(-1)).toEqual(['angular:component-update', { id: homeId(), timestamp: 4 }]);
	});

	it('drops the update of a component whose previous source was never seen', async () => {
		const otherFile = path.join(workspace, 'src/app/other.component.ts');
		const otherId = encodeURIComponent('src/app/other.component.ts@OtherComponent');
		await runHook(saveContext(otherFile, HOME_SOURCE));
		channel.channel.send('angular:component-update', { id: otherId, timestamp: 2 });
		expect(channel.sent).toEqual([]);
	});

	it('passes a component update triggered by its .html or .css file', async () => {
		await runHook(saveContext(homeFile.replace(/\.ts$/, '.html'), '<Label></Label>'));
		sendHomeUpdate();
		expect(channel.sent).toEqual([['angular:component-update', { id: homeId(), timestamp: 2 }]]);
	});

	it('ignores hot updates from other environments', async () => {
		await runHook(saveContext(homeFile, HOME_SOURCE.replace('signal(0)', 'signal(10)')), 'ssr');
		sendHomeUpdate();
		expect(channel.sent[0][0]).toBe('angular:component-update');
	});

	it('drops a root component update', () => {
		channel.channel.send('angular:component-update', { id: rootId(), timestamp: 2 });
		expect(channel.sent).toEqual([]);
	});

	it('resolves ids built against the workspace root or the cwd', () => {
		const cwdRelative = encodeURIComponent(`${path.relative(process.cwd(), rootFile).split(path.sep).join('/')}@Root`);
		channel.channel.send('angular:component-update', { id: cwdRelative, timestamp: 2 });
		expect(channel.sent).toEqual([]);
	});

	it('leaves non-Angular payloads untouched', () => {
		const update = { type: 'update', updates: [{ type: 'js-update', path: '/src/app/home/home.component.ts' }] };
		channel.channel.send(update);
		channel.channel.send('vite:ws:connect', { webSocket: null });
		expect(channel.sent).toEqual([[update], ['vite:ws:connect', { webSocket: null }]]);
	});

	it('full-reloads on angular:invalidate', () => {
		channel.listeners.get('angular:invalidate')![0]({ id: homeId(), message: 'boom' });
		expect(channel.sent).toEqual([[{ type: 'full-reload', path: '*' }]]);
	});

	it('installs the send wrapper once per channel', () => {
		const wrappedSend = channel.channel.send;
		plugins[0].configureServer({ ws: channel.channel, config: { logger: { warn: vi.fn() } }, middlewares: { use: vi.fn() } });
		expect(installAngularHmrRules(channel.channel, { idBases: [], getRoot: () => null, stale: new StaleComponentClasses(), sentUpdates: new ComponentUpdateLedger() })).toBe(false);
		expect(channel.channel.send).toBe(wrappedSend);
		expect(channel.listeners.get('angular:invalidate')).toHaveLength(1);
	});

	describe('a template or stylesheet of a component Vite has not transformed', () => {
		const LAZY_SOURCE = `import { Component } from '@angular/core';\n\n@Component({ selector: 'ns-lazy', templateUrl: './lazy.component.html', styleUrls: ['./lazy.component.css'] })\nexport class LazyComponent {}\n`;
		let lazyFile: string;

		// Mirrors Vite's graph: a node created without `setIsSelfAccepting` stays unanalyzed.
		const createGraph = () => {
			const nodes = new Map<string, any>();
			const ensureEntryFromUrl = vi.fn(async (url: string, setIsSelfAccepting = true) => {
				let node = nodes.get(url);
				if (!node) {
					node = { url, importers: new Set(), importedModules: new Set(), isSelfAccepting: setIsSelfAccepting ? false : undefined };
					nodes.set(url, node);
				}
				return node;
			});
			return { nodes, ensureEntryFromUrl };
		};
		const runResourceHook = (graph: ReturnType<typeof createGraph>, file: string, modules: unknown[] = []) => plugins[0].hotUpdate.handler.call({ environment: { name: 'client', moduleGraph: graph, config: { root: workspace } } }, { ...saveContext(file, ''), modules });

		beforeEach(() => {
			lazyFile = path.join(workspace, 'src/app/lazy/lazy.component.ts');
			fs.mkdirSync(path.dirname(lazyFile), { recursive: true });
			fs.writeFileSync(lazyFile, LAZY_SOURCE);
		});

		it('links it to its component in the graph, so Analog recompiles that component', async () => {
			const graph = createGraph();
			const result = await runResourceHook(graph, lazyFile.replace(/\.ts$/, '.html'));
			const template = graph.nodes.get('/src/app/lazy/lazy.component.html');
			const component = graph.nodes.get('/src/app/lazy/lazy.component.ts');
			expect(result).toEqual([template]);
			expect([...template.importers]).toEqual([component]);
			expect([...component.importedModules]).toEqual([template]);
		});

		it('leaves the new nodes unanalyzed, so Vite never propagates past the component', async () => {
			const graph = createGraph();
			await runResourceHook(graph, lazyFile.replace(/\.ts$/, '.css'));
			expect(graph.ensureEntryFromUrl.mock.calls.every((call) => call[1] === false)).toBe(true);
			expect([...graph.nodes.values()].map((node) => node.isSelfAccepting)).toEqual([undefined, undefined]);
		});

		it('leaves a resource with graph modules to Analog', async () => {
			const graph = createGraph();
			const existing = { isSelfAccepting: undefined, importers: new Set([{ file: lazyFile }]) };
			expect(await runResourceHook(graph, lazyFile.replace(/\.ts$/, '.html'), [existing])).toBeUndefined();
			expect(graph.ensureEntryFromUrl).not.toHaveBeenCalled();
		});

		it('leaves a file no component names alone', async () => {
			const graph = createGraph();
			expect(await runResourceHook(graph, path.join(workspace, 'src/app/lazy/other.html'))).toBeUndefined();
			expect(graph.ensureEntryFromUrl).not.toHaveBeenCalled();
		});

		it('finds components outside the app directory beside the resource', () => {
			const libFile = path.join(workspace, 'libs/ui/card.component.ts');
			fs.mkdirSync(path.dirname(libFile), { recursive: true });
			fs.writeFileSync(libFile, LAZY_SOURCE.replace(/lazy\.component/g, 'card.component'));
			expect(findResourceOwners(ts, libFile.replace(/\.ts$/, '.html'), path.join(workspace, 'src'))).toEqual([libFile.split(path.sep).join('/')]);
		});
	});

	describe('/@ng/component boot gate', () => {
		it('answers a boot-time metadata fetch with a no-op module', () => {
			expect(requestMetadata(homeMetadataUrl(Date.now()))).toBe(NG_COMPONENT_NO_UPDATE_MODULE);
		});

		it("lets a fetch that echoes a sent update's id and timestamp through to Analog", () => {
			sendHomeUpdate(42);
			expect(requestMetadata(homeMetadataUrl(42))).toBe('next');
			expect(requestMetadata(`/src/app/home/@ng/component?c=${homeId()}&t=42`)).toBe('next');
		});

		it('only the latest sent timestamp of a component is live', () => {
			sendHomeUpdate(42);
			sendHomeUpdate(43);
			expect(requestMetadata(homeMetadataUrl(42))).toBe(NG_COMPONENT_NO_UPDATE_MODULE);
			expect(requestMetadata(homeMetadataUrl(43))).toBe('next');
		});

		it('never lets the root component through: its updates go out as full reloads', () => {
			channel.channel.send('angular:component-update', { id: rootId(), timestamp: 7 });
			expect(requestMetadata(`/src/app/@ng/component?c=${rootId()}&t=7`)).toBe(NG_COMPONENT_NO_UPDATE_MODULE);
		});

		it('leaves other requests alone', () => {
			expect(requestMetadata('/src/app/home/home.component.ts')).toBe('next');
		});
	});
});
