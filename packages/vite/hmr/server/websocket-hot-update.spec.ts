import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runHotUpdatePrologue, type NsHotUpdateContext } from './websocket-hot-update.js';
import * as serverOriginModule from './server-origin.js';
import * as appCssStateModule from '../../helpers/app-css-state.js';

let originSpy: ReturnType<typeof vi.spyOn>;

type FakeClient = { readyState: number; send: ReturnType<typeof vi.fn> };

/**
 * Build a fully-mocked {@link NsHotUpdateContext}. Every injected dependency is
 * a no-op spy with a sensible default so a single test can override just the
 * field it cares about. The post-broadcast graph work is heavily guarded by
 * try/catch in the prologue, so these stubs are enough to drive the synchronous
 * "pending broadcast" path without throwing.
 */
function makeDeps(overrides: Partial<NsHotUpdateContext> = {}) {
	const moduleGraph = {
		version: 1,
		size: 0,
		normalizeGraphId: (id: string) => id,
		get: () => undefined,
		getModuleById: () => undefined,
		getModulesByFile: () => [],
		upsert: vi.fn(),
		update: vi.fn(),
		emitDelta: vi.fn(),
		emitFullGraph: vi.fn(),
		invalidateMany: vi.fn(),
		invalidateModule: vi.fn(),
	};
	const base: NsHotUpdateContext = {
		wss: { clients: new Set<FakeClient>() } as any,
		moduleGraph: moduleGraph as any,
		strategy: { flavor: 'typescript' } as any,
		verbose: false,
		sfcFileMap: new Map(),
		depFileMap: new Map(),
		sharedTransformRequest: vi.fn(async () => ({ code: '' })) as any,
		getHmrSourceRootsCached: () => ['/app/src'],
		getBootstrapEntryRelPath: () => '/app/src/main.ts',
		isSocketClientOpen: (client: any) => !!client && client.readyState === 1,
		getHmrSocketRole: () => 'device',
		shouldRemapImport: () => false,
		rememberAngularReloadSuppression: vi.fn(),
		getRootComponentIdentity: () => null,
		getGraphInitialPopulationPromise: vi.fn(() => null),
		appRootDir: 'app/src',
	};
	return { ...base, ...overrides };
}

function makeCtx(file: string, serverOverrides: Record<string, unknown> = {}) {
	return {
		file,
		server: {
			config: { root: '/proj', server: {} },
			transformRequest: vi.fn(async () => ({ code: '' })),
			...serverOverrides,
		},
		modules: [],
		read: async () => '',
		timestamp: Date.now(),
	} as any;
}

describe('runHotUpdatePrologue', () => {
	// runHotUpdatePrologue imports getServerOrigin directly; spy via the module
	// (the proven ESM seam — see server-origin-platform.spec.ts) to assert the
	// origin-baking path runs (or is skipped) and to bake a deterministic origin.
	beforeEach(() => {
		originSpy = vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
	});
	afterEach(() => {
		originSpy.mockRestore();
	});

	it('is an async function', () => {
		expect(typeof runHotUpdatePrologue).toBe('function');
		const deps = makeDeps();
		const result = runHotUpdatePrologue(makeCtx('/app/src/foo.spec.ts'), deps);
		expect(typeof (result as Promise<unknown>).then).toBe('function');
	});

	it('returns null without broadcasting when wss is null', async () => {
		const deps = makeDeps({ wss: null });
		expect(await runHotUpdatePrologue(makeCtx('/app/src/foo.ts'), deps)).toBeNull();
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('ignores runtime-graph-excluded paths (e.g. *.spec.*) before any broadcast', async () => {
		const deps = makeDeps();
		expect(await runHotUpdatePrologue(makeCtx('/app/src/foo.spec.ts'), deps)).toBeNull();
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('ignores changes outside the HMR source scope', async () => {
		const deps = makeDeps({ getHmrSourceRootsCached: () => ['/app/src'] });
		expect(await runHotUpdatePrologue(makeCtx('/somewhere/else/foo.ts'), deps)).toBeNull();
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('logs the ignored-change reason when verbose and out of scope', async () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		try {
			const deps = makeDeps({ verbose: true, getHmrSourceRootsCached: () => ['/app/src'] });
			await runHotUpdatePrologue(makeCtx('/somewhere/else/foo.ts'), deps);
			expect(spy.mock.calls.some((c) => String(c[0]).includes('outside HMR source scope'))).toBe(true);
		} finally {
			spy.mockRestore();
		}
	});

	it('broadcasts a component styleUrls edit under a per-file tag (its own path), not app.css', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		// No app-css state registered → the edited css is treated as a component style.
		const deps = makeDeps({ wss, getHmrSourceRootsCached: () => ['/proj/src'] });
		const result = await runHotUpdatePrologue(makeCtx('/proj/src/app/header/header.component.css'), deps);
		expect(result).toBeNull();
		const cssMsg = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0]))).find((m) => m.type === 'ns:css-updates');
		expect(cssMsg).toBeTruthy();
		const update = cssMsg.updates[0];
		// Broadcasts the component css's OWN path (relative to root) — NOT app.css —
		// tagged by that path so it replaces independently of the global stylesheet.
		expect(update.path).toBe('/src/app/header/header.component.css');
		expect(update.tag).toBe('/src/app/header/header.component.css');
	});

	it('suppresses the component-style broadcast when the framework owns component-style HMR (Angular liveReload)', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		const ownsComponentStyleHmr = vi.fn(() => true);
		const strategy = { flavor: 'angular', ownsComponentStyleHmr } as any;
		const deps = makeDeps({ wss, strategy, getHmrSourceRootsCached: () => ['/proj/src'] });

		const result = await runHotUpdatePrologue(makeCtx('/proj/src/app/header/header.component.css'), deps);

		expect(result).toBeNull();
		expect(ownsComponentStyleHmr).toHaveBeenCalledTimes(1);
		// No ns:css-updates broadcast — the framework's own component-update owns it.
		const sentTypes = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0])).type);
		expect(sentTypes).not.toContain('ns:css-updates');
	});

	it('still broadcasts the GLOBAL app entry CSS even when the framework owns component-style HMR', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		const ownsComponentStyleHmr = vi.fn(() => true);
		const strategy = { flavor: 'angular', ownsComponentStyleHmr } as any;
		const deps = makeDeps({ wss, strategy, getHmrSourceRootsCached: () => ['/proj/src'] });
		const ctx = makeCtx('/proj/src/app.css');
		appCssStateModule.setAppCssState(ctx.server as any, { path: '/proj/src/app.css', deps: new Set<string>() });

		const result = await runHotUpdatePrologue(ctx, deps);

		expect(result).toBeNull();
		// Global stylesheet still broadcasts (it isn't component-scoped).
		const cssMsg = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0]))).find((m) => m.type === 'ns:css-updates');
		expect(cssMsg).toBeTruthy();
		expect(cssMsg.updates[0].path).toBe('/src/app.css');
	});

	it('broadcasts the app entry CSS under the default (app.css) tag for a global stylesheet edit', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		const deps = makeDeps({ wss, getHmrSourceRootsCached: () => ['/proj/src'] });
		// Register app.css state so the edited file is recognized as the global entry.
		const ctx = makeCtx('/proj/src/app.css');
		appCssStateModule.setAppCssState(ctx.server as any, { path: '/proj/src/app.css', deps: new Set<string>() });
		const result = await runHotUpdatePrologue(ctx, deps);
		expect(result).toBeNull();
		const cssMsg = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0]))).find((m) => m.type === 'ns:css-updates');
		expect(cssMsg).toBeTruthy();
		const update = cssMsg.updates[0];
		expect(update.path).toBe('/src/app.css');
		// No tag → client uses the default 'app.css' tag.
		expect(update.tag).toBeUndefined();
	});

	it('broadcasts the app entry CSS (not the partial) when an @import dep is edited', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		const deps = makeDeps({ wss, getHmrSourceRootsCached: () => ['/proj/src', '/libs'] });
		const ctx = makeCtx('/libs/theme/_buttons.css');
		// The edited partial is an @import dep of app.css → refetch app.css.
		appCssStateModule.setAppCssState(ctx.server as any, { path: '/proj/src/app.css', deps: new Set<string>(['/libs/theme/_buttons.css']) });
		const result = await runHotUpdatePrologue(ctx, deps);
		expect(result).toBeNull();
		const cssMsg = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0]))).find((m) => m.type === 'ns:css-updates');
		expect(cssMsg).toBeTruthy();
		const update = cssMsg.updates[0];
		expect(update.path).toBe('/src/app.css');
		expect(update.tag).toBeUndefined();
	});

	it('broadcasts an app.css refresh when a workspace-lib Tailwind content file (.html) changes', async () => {
		// A brand-new utility class (e.g. `text-green-500`) added to a
		// workspace-lib template only renders if the device re-fetches
		// `app.css` so Tailwind's content scan regenerates. The lib template
		// IS in the preprocessCSS dep set (Vite expands Tailwind's
		// dir-dependency globs), but the old project-scope re-filter returned
		// early for files outside `<root>/src|core|app` — so the content-file
		// broadcast below it never fired for lib edits and the new class
		// silently never applied. This pins the post-fix behavior.
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient]) } as any;
		const libHtml = '/repo/libs/xplat/nativescript/features/src/lib/ui/components/header/header.component.html';
		const deps = makeDeps({ wss, getHmrSourceRootsCached: () => ['/proj/src', '/repo/libs'] });
		const ctx = makeCtx(libHtml);
		appCssStateModule.setAppCssState(ctx.server as any, { path: '/proj/src/app.css', deps: new Set<string>([libHtml]) });

		const result = await runHotUpdatePrologue(ctx, deps);

		// The prologue must NOT swallow the lib edit — the framework tail
		// (template swap / reboot routing) still needs to run after it.
		expect(result).not.toBeNull();
		const cssMsg = openClient.send.mock.calls.map((c) => JSON.parse(String(c[0]))).find((m) => m.type === 'ns:css-updates');
		expect(cssMsg).toBeTruthy();
		expect(cssMsg.updates[0].path).toBe('/src/app.css');
		// No tag → the client replaces the boot-time app.css selectors.
		expect(cssMsg.updates[0].tag).toBeUndefined();
	});

	it('broadcasts an ns:hmr-pending message to open clients for in-scope changes', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const closedClient: FakeClient = { readyState: 3, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient, closedClient]) } as any;
		const populationPromise = vi.fn(() => null);
		const deps = makeDeps({ wss, getGraphInitialPopulationPromise: populationPromise });

		// The pending broadcast runs synchronously before the first `await`, so
		// the spies are populated immediately; we still settle the promise (the
		// deep graph work is guarded and irrelevant to this contract).
		const pending = runHotUpdatePrologue(makeCtx('/app/src/foo.ts'), deps);

		expect(populationPromise).toHaveBeenCalled();
		expect(originSpy).toHaveBeenCalledTimes(1);
		expect(openClient.send).toHaveBeenCalledTimes(1);
		expect(closedClient.send).not.toHaveBeenCalled();
		const payload = String(openClient.send.mock.calls[0][0]);
		expect(JSON.parse(payload)).toMatchObject({ type: 'ns:hmr-pending', origin: 'http://test:5173' });

		await pending.catch(() => {});
	});
});
