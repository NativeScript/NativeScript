import { afterEach, describe, expect, it, vi } from 'vitest';
import { inheritAppContext, installNavigatedPageHmrReload, installVueNavigateUsingApp } from './navigate-app';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * `__nsNavigateUsingApp` is the HMR navigation backend behind the `/ns/rt`
 * bridge's `$navigateTo`. It builds a fresh Vue app per navigation and mounts
 * the destination component. Vue's `createApp(rootComponent, rootProps?)`
 * accepts root props as its second argument — that's how stock
 * `nativescript-vue/$navigateTo` delivers `options.props` to the destination
 * (`createNativeView(target, options?.props, …)` →
 * `renderer.createApp(component, props)`).
 *
 * If the HMR navigator drops the props, the destination component renders with
 * `undefined` bindings and Vue logs
 *   [Vue warn]: Missing required prop: "<name>"
 *     at <DestinationComponent>
 * deep into a navigation flow — exactly the failure shape the user hit on
 * `$navigateTo(AlbumDetail, { props: { albumId, sourceTag } })`.
 *
 * Static-source assertion mirrors the pattern in `rt-ios-throttle.spec.ts`:
 * `__nsNavigateUsingApp` is a module-internal function (assigned onto
 * `globalThis` but not exported), so we lock the contract in by reading the
 * source rather than refactoring purely to surface a test seam.
 */
describe('__nsNavigateUsingApp prop forwarding', () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const navigateSrc = readFileSync(path.join(__dirname, 'navigate-app.ts'), 'utf-8');

	it('forwards opts.props as Vue rootProps when building the destination app', () => {
		// The call has to be `AppFactory(component, props)` — passing only
		// `component` swallows props. We pin the exact shape so a future
		// refactor that introduces a wrapper around `AppFactory` still has
		// to touch this assertion (and the test name) to ship.
		//
		// Locate the AppFactory call and grab the trailing arg list. Using
		// non-greedy capture survives nested parens inside `normalizeComponent(...)`.
		const callMatch = navigateSrc.match(/const app = AppFactory\((.*?)\);/);
		expect(callMatch).toBeTruthy();
		const argList = callMatch![1];
		// Two top-level arguments: component, props
		expect(argList).toContain('normalizeComponent(target,');
		expect(argList).toMatch(/,\s*opts\s*&&\s*\(opts\s*as\s*any\)\.props\s*$/);
	});

	it('still calls normalizeComponent so non-defineComponent inputs resolve correctly', () => {
		// Regression guard: a prior refactor passed `comp` directly to AppFactory
		// which broke <script setup> destinations. The normalizeComponent wrap
		// must stay in place.
		expect(navigateSrc).toMatch(/AppFactory\(normalizeComponent\(target,/);
	});
});

describe('inheritAppContext', () => {
	it('fills in components, directives, mixins and globalProperties the page app lacks, never overriding its own', () => {
		const Widget = { name: 'Widget' };
		const Own = { name: 'Own' };
		const mixin = { created() {} };
		const focus = {};
		const base = { components: { Widget, Own: { name: 'RootOwn' } }, directives: { focus }, mixins: [mixin], config: { globalProperties: { $http: 'http', $navigateTo: 'root-nav' } } };
		const ctx: any = { components: { Own }, directives: {}, mixins: [mixin], config: { globalProperties: { $navigateTo: 'page-nav' } } };
		inheritAppContext(ctx, base);
		expect(ctx.components.Widget).toBe(Widget);
		expect(ctx.components.Own).toBe(Own);
		expect(ctx.directives.focus).toBe(focus);
		expect(ctx.mixins).toEqual([mixin]);
		expect(ctx.config.globalProperties).toEqual({ $navigateTo: 'page-nav', $http: 'http' });
	});

	it('tolerates a missing side', () => {
		expect(() => inheritAppContext(null, { components: {} })).not.toThrow();
		expect(() => inheritAppContext({}, null)).not.toThrow();
	});
});

/**
 * Drives the installed navigator with a Vue-shaped factory: like Vue's
 * createApp, it clones a non-function root component, and the mounted root
 * instance's `type` is that clone — the object Vue's HMR `reload` mutates.
 */
describe('__nsNavigateUsingApp page apps', () => {
	const g: any = globalThis;
	const apps: any[] = [];

	function installFakeVue() {
		apps.length = 0;
		g.NSVRoot = class NSVRoot {};
		g.createApp = vi.fn((rootComponent: any, rootProps?: any) => {
			const type = typeof rootComponent === 'function' ? rootComponent : { ...rootComponent };
			const _context: any = { app: null, config: { globalProperties: { $navigateTo: 'page-nav' } }, mixins: [], components: {}, directives: {}, provides: {} };
			const app: any = {
				_context,
				rootProps,
				mount: vi.fn(() => ({ $el: { nativeView: { constructor: { name: 'Page' } } }, $: { type } })),
				unmount: vi.fn(),
			};
			_context.app = app;
			apps.push(app);
			return app;
		});
	}

	function makeFrame() {
		const frame: any = {
			currentPage: null,
			replacePage: vi.fn(),
			once: vi.fn(),
			navigate: vi.fn((entry: any) => {
				const page = entry.create();
				page.frame = frame;
				frame.currentPage = page;
			}),
		};
		return frame;
	}

	afterEach(() => {
		delete g.createApp;
		delete g.NSVRoot;
		delete g.__NS_VUE_ROOT_APP__;
	});

	it('inherits the root app recorded by the bridge when no app has navigated yet', () => {
		installFakeVue();
		const Widget = { name: 'Widget' };
		g.__NS_VUE_ROOT_APP__ = { _context: { components: { Widget }, directives: {}, mixins: [], provides: {}, config: { globalProperties: { $http: 'http' } } } };
		installVueNavigateUsingApp();
		g.__nsNavigateUsingApp({ name: 'Home', render: () => 'v1' }, { frame: makeFrame() });
		expect(apps).toHaveLength(1);
		expect(apps[0]._context.components.Widget).toBe(Widget);
		expect(apps[0]._context.config.globalProperties.$http).toBe('http');
		expect(apps[0]._context.config.globalProperties.$navigateTo).toBe('page-nav');
	});

	it('rebuilds a hot-reloaded page from the mounted type Vue mutated, not from the original component', () => {
		installFakeVue();
		installVueNavigateUsingApp();
		const frame = makeFrame();
		const Home = { name: 'Home', render: () => 'v1' };
		g.__nsNavigateUsingApp(Home, { frame });
		const pageApp = apps[0];
		const mountedType = pageApp.mount.mock.results[0].value.$.type;
		expect(mountedType).not.toBe(Home);

		// Vue's HMR reload mutates instance.type in place; the original is untouched.
		mountedType.render = () => 'v2';
		pageApp._context.reload();

		expect(frame.replacePage).toHaveBeenCalledTimes(1);
		frame.replacePage.mock.calls[0][0].create();
		expect(apps).toHaveLength(2);
		const rebuiltFrom = g.createApp.mock.calls[1][0];
		expect(rebuiltFrom.render()).toBe('v2');
		expect(Home.render()).toBe('v1');
	});
});

describe('installNavigatedPageHmrReload', () => {
	function makeFrame(currentPage: any) {
		const onceHandlers: Record<string, Array<() => void>> = {};
		return {
			currentPage,
			replacePage: vi.fn(),
			once: vi.fn((event: string, cb: () => void) => {
				(onceHandlers[event] ||= []).push(cb);
			}),
			fire(event: string) {
				const list = onceHandlers[event] || [];
				onceHandlers[event] = [];
				list.forEach((cb) => cb());
			},
		};
	}

	function makePage(frame: any) {
		const onceHandlers: Array<() => void> = [];
		return {
			frame,
			once: vi.fn((_event: string, cb: () => void) => {
				onceHandlers.push(cb);
			}),
			fireNavigatedTo() {
				const list = onceHandlers.splice(0);
				list.forEach((cb) => cb());
			},
		};
	}

	it("overwrites the app context's reload (Vue's DEV default renders into the detached NSVRoot)", () => {
		const ctx: Record<string, any> = { reload: () => 'vue-default' };
		const app = { _context: ctx, unmount: vi.fn() };
		const page = makePage(makeFrame(null));
		expect(installNavigatedPageHmrReload({ app, page, rebuild: () => ({}) })).toBe(true);
		expect(typeof ctx.reload).toBe('function');
		expect(ctx.reload()).not.toBe('vue-default');
	});

	it('replaces the current entry with a rebuilt page and releases the old app after the swap', () => {
		const ctx: Record<string, any> = {};
		const app = { _context: ctx, unmount: vi.fn() };
		const frame = makeFrame(null);
		const page = makePage(frame);
		frame.currentPage = page;
		const freshPage = { fresh: true };
		installNavigatedPageHmrReload({ app, page, rebuild: () => freshPage });

		ctx.reload();

		expect(frame.replacePage).toHaveBeenCalledTimes(1);
		const entry = frame.replacePage.mock.calls[0][0];
		expect(entry.animated).toBe(false);
		expect(entry.create()).toBe(freshPage);
		// old app released only once the fresh page is actually in place
		expect(app.unmount).not.toHaveBeenCalled();
		frame.fire('navigatedTo');
		expect(app.unmount).toHaveBeenCalledTimes(1);
	});

	it('stands down for a page with no frame (already replaced or disposed)', () => {
		const ctx: Record<string, any> = {};
		const app = { _context: ctx, unmount: vi.fn() };
		const rebuild = vi.fn();
		const page = makePage(null);
		installNavigatedPageHmrReload({ app, page, rebuild });

		ctx.reload();

		expect(rebuild).not.toHaveBeenCalled();
		expect(page.once).not.toHaveBeenCalled();
	});

	it('defers a backstack page to its next navigatedTo, coalescing repeated reloads', () => {
		const ctx: Record<string, any> = {};
		const app = { _context: ctx, unmount: vi.fn() };
		const frame = makeFrame({ someOtherPage: true });
		const page = makePage(frame);
		const freshPage = { fresh: true };
		installNavigatedPageHmrReload({ app, page, rebuild: () => freshPage });

		ctx.reload();
		ctx.reload();
		ctx.reload();
		expect(page.once).toHaveBeenCalledTimes(1);
		expect(frame.replacePage).not.toHaveBeenCalled();

		// the user comes back to the page
		frame.currentPage = page;
		page.fireNavigatedTo();
		expect(frame.replacePage).toHaveBeenCalledTimes(1);
	});

	it('refuses an app with no context', () => {
		expect(installNavigatedPageHmrReload({ app: {} as any, page: {}, rebuild: () => ({}) })).toBe(false);
	});
});
