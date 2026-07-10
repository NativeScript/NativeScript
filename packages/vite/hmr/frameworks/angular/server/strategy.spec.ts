import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import * as path from 'path';

import { angularServerStrategy } from './strategy.js';
import { prepareAngularEntryForDevice } from '../../../server/rewrite-imports.js';
import type { FrameworkServedModuleContext } from '../../../server/framework-strategy.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import * as serverOriginModule from '../../../server/server-origin.js';

// angularServerStrategy.handleHotUpdate owns `prologue + the Angular tail`. Mock
// the shared prologue so the handler tests isolate the migrated Angular tail
// (broadcast + cache purge orchestration) without the full HMR pipeline; the
// prologue itself is covered by websocket-hot-update.spec.ts and the deep
// Angular helpers by their own websocket-angular-*.spec.ts suites.
vi.mock('../../../server/websocket-hot-update.js', () => ({
	runHotUpdatePrologue: vi.fn(),
}));

const APP_ENTRY = getProjectAppVirtualPath('main.ts');
const APP_ENTRY_WITH_QUERY = `${APP_ENTRY}?import`;

describe('angularServerStrategy', () => {
	it('matches app runtime modules and excludes Angular test files', () => {
		expect(angularServerStrategy.matchesFile(APP_ENTRY)).toBe(true);
		expect(angularServerStrategy.matchesFile(APP_ENTRY_WITH_QUERY)).toBe(true);
		expect(angularServerStrategy.matchesFile(getProjectAppVirtualPath('main.spec.ts'))).toBe(false);
		expect(angularServerStrategy.matchesFile(`${getProjectAppVirtualPath('main.test.ts')}?import`)).toBe(false);
		expect(angularServerStrategy.matchesFile(getProjectAppVirtualPath('__tests__/main.ts'))).toBe(false);
	});

	it('rewriteServedModule routes the /ns/m rewrite through the register-only Angular entry pass', () => {
		const ctx: FrameworkServedModuleContext = {
			moduleId: '/src/main.ts',
			sfcFileMap: new Map(),
			depFileMap: new Map(),
			projectRoot: '/proj',
			serverOrigin: 'http://localhost:5173',
			verbose: false,
		};
		// Representative Angular entry: bootstrapApplication + a relative import the
		// shared rewriteImports pass rewrites before the register-only transform runs.
		const code = ["import { AppComponent } from './app.component';", 'bootstrapApplication(AppComponent);'].join('\n');

		// The hook must be byte-identical to calling prepareAngularEntryForDevice
		// with httpOrigin = serverOrigin and resolveVendorAsHttp = true — the exact
		// arguments the inline `/ns/m` angular fork used.
		expect(angularServerStrategy.rewriteServedModule!(code, ctx)).toBe(prepareAngularEntryForDevice(code, ctx.moduleId, ctx.sfcFileMap, ctx.depFileMap, ctx.projectRoot, ctx.verbose, undefined, ctx.serverOrigin, true));
	});

	it('supplies no volatilePatterns and no import-map entries', () => {
		expect(angularServerStrategy.volatilePatterns).toBeUndefined();
		expect(angularServerStrategy.importMapEntries).toBeUndefined();
	});

	it('builds the Angular registry without priming or watching test files', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'angular-strategy-'));
		try {
			const srcDir = path.join(tmpRoot, 'src');
			const appDir = path.join(srcDir, 'app');
			const testDir = path.join(srcDir, '__tests__');
			mkdirSync(appDir, { recursive: true });
			mkdirSync(testDir, { recursive: true });

			writeFileSync(path.join(srcDir, 'main.ts'), 'bootstrapApplication(AppComponent);');
			writeFileSync(path.join(srcDir, 'main.spec.ts'), 'bootstrapApplication(TestComponent);');
			writeFileSync(path.join(testDir, 'harness.ts'), 'bootstrapApplication(TestHarness);');
			writeFileSync(path.join(appDir, 'home.component.ts'), "@Component({ templateUrl: './home.component.html', styleUrls: ['./home.component.css'] })\nexport class HomeComponent {}\n");
			writeFileSync(path.join(appDir, 'home.component.html'), '<StackLayout />');
			writeFileSync(path.join(appDir, 'home.component.css'), '.home {}');
			writeFileSync(path.join(appDir, 'home.component.spec.ts'), "@Component({ templateUrl: './home.component.spec.html', styleUrls: ['./home.component.spec.css'] })\nexport class HomeComponentSpec {}\n");
			writeFileSync(path.join(appDir, 'home.component.spec.html'), '<Label />');
			writeFileSync(path.join(appDir, 'home.component.spec.css'), '.spec {}');

			const watcher = {
				add: vi.fn(),
			};
			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => ({ code: `// transformed ${id}` })),
				watcher,
			} as any;

			await angularServerStrategy.buildRegistry({
				server,
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				wss: {} as any,
				verbose: false,
			});

			expect(server.transformRequest).toHaveBeenCalledWith('/src/main.ts');
			expect(server.transformRequest).not.toHaveBeenCalledWith('/src/main.spec.ts');
			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'home.component.html'));
			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'home.component.css'));
			expect(watcher.add).toHaveBeenCalledWith(appDir);
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'home.component.spec.html'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'home.component.spec.css'));
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	it('skips commented-out templateUrl / styleUrls when registering template watches', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'angular-strategy-commented-'));
		try {
			const srcDir = path.join(tmpRoot, 'src');
			const appDir = path.join(srcDir, 'app');
			mkdirSync(appDir, { recursive: true });

			writeFileSync(path.join(srcDir, 'main.ts'), 'bootstrapApplication(AppComponent);');
			writeFileSync(path.join(appDir, 'commented.component.ts'), ["import { Component } from '@angular/core';", '@Component({', "  selector: 'app-cmt',", "  templateUrl: './commented.component.html',", "  // styleUrls: ['./commented.component.scss'],", "  /* templateUrl: './phantom.component.html', */", '})', 'export class CommentedComponent {}'].join('\n'));
			writeFileSync(path.join(appDir, 'commented.component.html'), '<Label text="Hello" />');

			const watcher = { add: vi.fn() };
			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => ({ code: `// transformed ${id}` })),
				watcher,
			} as any;

			await angularServerStrategy.buildRegistry({
				server,
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				wss: {} as any,
				verbose: false,
			});

			expect(watcher.add).toHaveBeenCalledWith(path.join(appDir, 'commented.component.html'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'commented.component.scss'));
			expect(watcher.add).not.toHaveBeenCalledWith(path.join(appDir, 'phantom.component.html'));
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});
});

describe('angularServerStrategy.skipDefaultGraphUpdate', () => {
	it('opts HTML templates out of the prologue graph-delta upsert, but not .ts / .css', () => {
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.html')).toBe(true);
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.htm')).toBe(true);
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.ts')).toBe(false);
		expect(angularServerStrategy.skipDefaultGraphUpdate!('/src/app/home.component.css')).toBe(false);
	});
});

type FakeClient = { readyState: number; send: ReturnType<typeof vi.fn> };

describe('angularServerStrategy.handleHotUpdate', () => {
	beforeEach(() => {
		vi.mocked(runHotUpdatePrologue).mockReset();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function makeServer() {
		return {
			config: { root: '/proj', plugins: [] },
			moduleGraph: {
				getModuleById: vi.fn(() => undefined),
				getModulesByFile: vi.fn(() => undefined),
				invalidateModule: vi.fn(),
			},
		} as any;
	}

	function makeDeps(client?: FakeClient) {
		const clients = new Set<FakeClient>();
		if (client) clients.add(client);
		return {
			wss: { clients },
			moduleGraph: { version: 7 },
			strategy: { flavor: 'angular' },
			verbose: false,
			sharedTransformRequest: { invalidateMany: vi.fn() },
			getBootstrapEntryRelPath: () => '/src/main.ts',
			isSocketClientOpen: (c: any) => !!c && c.readyState === 1,
			getHmrSocketRole: () => 'device',
			rememberAngularReloadSuppression: vi.fn(),
			getRootComponentIdentity: () => null,
		} as any;
	}

	it('purges caches and broadcasts ns:angular-update for a changed .ts component (reboot path)', async () => {
		const emitSummary = vi.fn();
		const metrics = { invalidated: 0, recipients: 0, narrowed: undefined as boolean | undefined, tAfterFramework: 0 };
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({ root: '/proj', updateRel: '/src/app/home.component.ts', metrics, emitSummary } as any);
		vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');

		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const deps = makeDeps(openClient);
		const ctx = { file: '/proj/src/app/home.component.ts', server: makeServer(), modules: [], read: async () => 'export class HomeComponent {}' } as any;

		const result = await angularServerStrategy.handleHotUpdate!(ctx, deps);

		expect(runHotUpdatePrologue).toHaveBeenCalledWith(ctx, deps);
		expect(deps.rememberAngularReloadSuppression).toHaveBeenCalledTimes(1);
		expect(openClient.send).toHaveBeenCalledTimes(1);
		const payload = JSON.parse(String(openClient.send.mock.calls[0][0]));
		expect(payload).toMatchObject({ type: 'ns:angular-update', origin: 'http://test:5173', path: '/src/app/home.component.ts', version: 7, importerEntry: '/src/main.ts' });
		expect(Array.isArray(payload.evictPaths)).toBe(true);
		expect(emitSummary).toHaveBeenCalledTimes(1);
		// Angular suppresses Vite's default hot update for .ts/.html edits.
		expect(result).toEqual([]);
	});

	it('ignores non-template/non-script files (returns before broadcasting or emitting a summary)', async () => {
		const emitSummary = vi.fn();
		const metrics = { invalidated: 0, recipients: 0, narrowed: undefined as boolean | undefined, tAfterFramework: 0 };
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({ root: '/proj', updateRel: '/src/app/data.json', metrics, emitSummary } as any);

		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const deps = makeDeps(openClient);
		const ctx = { file: '/proj/src/app/data.json', server: makeServer(), modules: [], read: async () => '{}' } as any;

		const result = await angularServerStrategy.handleHotUpdate!(ctx, deps);

		expect(openClient.send).not.toHaveBeenCalled();
		expect(deps.rememberAngularReloadSuppression).not.toHaveBeenCalled();
		expect(emitSummary).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	});

	it('is a no-op when the prologue fully handled the change (null)', async () => {
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(null as any);
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const deps = makeDeps(openClient);
		const result = await angularServerStrategy.handleHotUpdate!({ file: '/proj/src/app/home.component.ts', server: makeServer(), modules: [], read: async () => '' } as any, deps);

		expect(openClient.send).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	});
});

describe('angularServerStrategy.handleClientCustomEvent (angular:invalidate recovery)', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Each test creates its OWN component file under a temp project root: the
	// handler resolves the invalidate id against the monorepo workspace root
	// first and the vite project root second, and dedupes reboots per resolved
	// file — unique paths keep tests independent of the module-level dedupe map.
	function makeProject(componentRel: string) {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'angular-invalidate-'));
		const abs = path.join(tmpRoot, componentRel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, 'export class HeaderComponent {}');
		return tmpRoot;
	}

	function makeInvalidateServer(root: string) {
		return {
			config: { root, plugins: [] },
			moduleGraph: {
				getModuleById: vi.fn(() => undefined),
				getModulesByFile: vi.fn(() => undefined),
				invalidateModule: vi.fn(),
			},
		} as any;
	}

	function makeInvalidateDeps(client: FakeClient) {
		return {
			wss: { clients: new Set<FakeClient>([client]) },
			moduleGraph: { version: 3 },
			strategy: { flavor: 'angular' },
			verbose: false,
			sharedTransformRequest: { invalidateMany: vi.fn() },
			getBootstrapEntryRelPath: () => '/src/main.ts',
			isSocketClientOpen: (c: any) => !!c && c.readyState === 1,
			getHmrSocketRole: () => 'device',
			rememberAngularReloadSuppression: vi.fn(),
			getRootComponentIdentity: () => null,
		} as any;
	}

	it('broadcasts the ns:angular-update reboot when the device reports a failed in-place apply', async () => {
		vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const componentRel = 'src/app/header-a.component.ts';
		const tmpRoot = makeProject(componentRel);
		try {
			const openClient: FakeClient = { readyState: 1, send: vi.fn() };
			const deps = makeInvalidateDeps(openClient);
			const server = makeInvalidateServer(tmpRoot);

			await angularServerStrategy.handleClientCustomEvent!(
				{
					event: 'angular:invalidate',
					// Angular sends the compiler-embedded id: encodeURIComponent('<rel>@<Class>').
					data: { id: encodeURIComponent(`${componentRel}@HeaderComponent`), message: 'ctx.showExtra is not a function', error: true },
					server,
				},
				deps,
			);

			expect(openClient.send).toHaveBeenCalledTimes(1);
			const payload = JSON.parse(String(openClient.send.mock.calls[0][0]));
			expect(payload).toMatchObject({ type: 'ns:angular-update', origin: 'http://test:5173', path: `/${componentRel}`, version: 3, importerEntry: '/src/main.ts' });
			expect(Array.isArray(payload.evictPaths)).toBe(true);
			expect(deps.rememberAngularReloadSuppression).toHaveBeenCalledTimes(1);
			// The failure surfaces always-on so the user sees why the app rebooted.
			expect(warnSpy.mock.calls.some((c) => String(c[0]).includes('failed to apply in-place component update'))).toBe(true);
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	it('dedupes repeated invalidates for the same component inside the reboot window', async () => {
		vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const componentRel = 'src/app/header-b.component.ts';
		const tmpRoot = makeProject(componentRel);
		try {
			const openClient: FakeClient = { readyState: 1, send: vi.fn() };
			const deps = makeInvalidateDeps(openClient);
			const server = makeInvalidateServer(tmpRoot);
			const ctx = { event: 'angular:invalidate', data: { id: encodeURIComponent(`${componentRel}@HeaderComponent`) }, server };

			await angularServerStrategy.handleClientCustomEvent!(ctx, deps);
			await angularServerStrategy.handleClientCustomEvent!(ctx, deps);

			// One failed apply fans out to several invalidate sends (one per
			// stale hot listener / LView walk) — only ONE reboot broadcast.
			expect(openClient.send).toHaveBeenCalledTimes(1);
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	it('ignores other custom events and unresolvable component ids', async () => {
		vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const deps = makeInvalidateDeps(openClient);
		const server = makeInvalidateServer('/nonexistent-project-root');

		await angularServerStrategy.handleClientCustomEvent!({ event: 'some:other-event', data: { id: 'src/app/x.ts@X' }, server }, deps);
		expect(openClient.send).not.toHaveBeenCalled();

		await angularServerStrategy.handleClientCustomEvent!({ event: 'angular:invalidate', data: { id: encodeURIComponent('does/not/exist.component.ts@Nope') }, server }, deps);
		expect(openClient.send).not.toHaveBeenCalled();
		expect(warnSpy.mock.calls.some((c) => String(c[0]).includes('unresolvable component id'))).toBe(true);
	});
});
