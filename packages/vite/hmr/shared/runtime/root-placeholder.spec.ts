import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @nativescript/core can't evaluate in Node; the overlay reads its classes only when drawing.
vi.mock('@nativescript/core/application', () => ({}));
vi.mock('@nativescript/core/color', () => ({}));
vi.mock('@nativescript/core/ui', () => ({}));
import { getGlobalScope } from './global-scope.js';
import { NS_DEV_SYMBOL_KEY, nsDev } from './dev-globals.js';

let ensureHmrDevOverlayRuntimeInstalled: typeof import('./dev-overlay.js').ensureHmrDevOverlayRuntimeInstalled;
let installRootPlaceholder: typeof import('./root-placeholder.js').installRootPlaceholder;
let tryFinalizeBootPlaceholder: typeof import('./root-placeholder.js').tryFinalizeBootPlaceholder;

// Placeholder and overlay state is module state: each case gets fresh
// instances, all from the same module graph.
beforeEach(async () => {
	vi.resetModules();
	({ ensureHmrDevOverlayRuntimeInstalled } = await import('./dev-overlay.js'));
	({ installRootPlaceholder, tryFinalizeBootPlaceholder } = await import('./root-placeholder.js'));
});

describe('root placeholder finalization', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		delete getGlobalScope().Application;
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
		delete getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
		delete getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
	});

	it('marks boot complete only after a real root replaces the placeholder', () => {
		const placeholderRoot = { __ns_dev_placeholder: true };
		const listeners = new Map<string, Function>();
		const originalRun = vi.fn();
		let rootView: any = null;
		const application = {
			launchEvent: 'launch',
			on: vi.fn((eventName: string, handler: Function) => {
				listeners.set(eventName, handler);
			}),
			off: vi.fn(),
			run: originalRun as any,
			getRootView: vi.fn(() => rootView),
		};

		getGlobalScope().Application = application;
		installRootPlaceholder(false);
		const launchHandler = listeners.get('launch')!;
		launchHandler({});
		getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_VIEW__ = placeholderRoot;
		expect(application.run).not.toBe(originalRun);

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		rootView = { constructor: { name: 'Frame' }, currentPage: { constructor: { name: 'Page' } } };
		const finalized = tryFinalizeBootPlaceholder('spec', true);

		expect(finalized).toBe(true);
		expect(nsDev().bootComplete).toBe(true);
		expect(getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_VIEW__).toBeUndefined();
		expect(application.off).toHaveBeenCalledWith('launch', launchHandler);
		originalRun.mockClear();
		application.run({ create: vi.fn() });
		expect(originalRun).toHaveBeenCalledTimes(1);
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Real app root committed',
			progress: 100,
		});
	});

	it('does not finalize while the placeholder is still the active root', () => {
		const placeholderRoot = { __ns_dev_placeholder: true };
		const application = {
			getRootView: vi.fn(() => placeholderRoot),
		};

		getGlobalScope().Application = application;
		getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_VIEW__ = placeholderRoot;
		getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_EARLY__ = true;

		expect(tryFinalizeBootPlaceholder('spec')).toBe(false);
		expect(nsDev().bootComplete).not.toBe(true);
	});
});

/**
 * Patched-run microtask deferral contract.
 *
 * Why this is a separate `describe`: the bug it locks down is a *timing* bug,
 * not a functional one. The patched `Application.run` MUST yield back to the
 * synchronous caller before iOS view-lifecycle events fire, so any
 * post-`Application.run(...)` tail in user-space (notably nativescript-vue's
 * `setRootApp(app)` after `startApp(componentInstance)`) executes before the
 * new root view's `loaded`/`traitCollectionDidChange` handlers run. If a
 * future refactor inlines the reset synchronously again, this regression
 * surfaces device-side as
 *   TypeError: Cannot read properties of null (reading '_context')
 * inside `createNativeView` — a hard-to-diagnose crash deep in a UI event
 * handler. We trap it here instead.
 */
describe('installRootPlaceholder — patched Application.run timing', () => {
	afterEach(() => {
		// Same teardown as the suite above — leftover globals would poison the next case.
		delete getGlobalScope().Application;
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
		delete getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
		delete getGlobalScope().__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
	});

	/**
	 * Build a minimal Application mock that lets `installRootPlaceholder` complete
	 * its launch handler and produce the patched `Application.run`. We return both
	 * the (post-patch) mock and the *original* `resetRootView` spy because
	 * `installRootPlaceholder` wraps `resetRootView` in `__ns_dev_patched_reset_root_view`
	 * to ferry boot-complete restoration through the placeholder runtime — the
	 * wrapper calls our spy under the hood, so we assert against `resetSpy`
	 * directly rather than against `application.resetRootView` (which has been
	 * replaced by the wrapper).
	 */
	function setupPlaceholderApplication() {
		const listeners = new Map<string, Function>();
		const resetSpy = vi.fn();
		const application = {
			launchEvent: 'launch',
			on: vi.fn((eventName: string, handler: Function) => {
				listeners.set(eventName, handler);
			}),
			off: vi.fn((eventName: string, handler: Function) => {
				if (listeners.get(eventName) === handler) listeners.delete(eventName);
			}),
			run: vi.fn(),
			// `installRootPlaceholder` will replace this property with a wrapper.
			// `resetSpy` stays the canonical observation point — the wrapper
			// invokes the bound original (which is `resetSpy`).
			resetRootView: ((...args: any[]) => resetSpy(...args)) as any,
		};
		getGlobalScope().Application = application;
		installRootPlaceholder(false);
		// Trigger the launchEvent handler `installRootPlaceholder` registered.
		// Pass `args = {}` so the handler's `args.root = frame` assignment is
		// safe; we don't care about the placeholder visuals here.
		const launchHandler = listeners.get('launch');
		if (typeof launchHandler === 'function') launchHandler({});
		return { application, resetSpy };
	}

	it('returns from Application.run synchronously without calling resetRootView', () => {
		const { application, resetSpy } = setupPlaceholderApplication();
		const entry = { create: vi.fn(() => ({ tag: 'fake-native-view' })) };

		(application as any).run(entry);

		// Critical: the patched run must NOT have invoked resetRootView yet.
		// If a future refactor inlines the reset synchronously, this assertion
		// fails and the test name points the next reader at the root cause.
		expect(resetSpy).not.toHaveBeenCalled();
	});

	it('invokes resetRootView with the original entry on the next microtask', async () => {
		const { application, resetSpy } = setupPlaceholderApplication();
		const entry = { create: vi.fn(() => ({ tag: 'fake-native-view' })) };

		(application as any).run(entry);
		// Two awaits: the deferred reset uses `Promise.resolve().then(__ns_deferred_reset)`,
		// and the `__ns_dev_patched_reset_root_view` wrapper inside the placeholder
		// runtime then calls our `resetSpy` synchronously inside that microtask.
		// One `await Promise.resolve()` is enough in theory, but two is robust
		// against incidental microtask chains elsewhere in the install path.
		await Promise.resolve();
		await Promise.resolve();

		expect(resetSpy).toHaveBeenCalledTimes(1);
		expect(resetSpy).toHaveBeenCalledWith(entry);
	});

	it('lets synchronous post-Application.run code (the setRootApp tail) execute before resetRootView fires', async () => {
		const { application, resetSpy } = setupPlaceholderApplication();
		const callOrder: string[] = [];
		resetSpy.mockImplementation(() => {
			callOrder.push('resetRootView');
		});

		// Simulate nativescript-vue's `app.start`: synchronous body that calls
		// `Application.run(...)` then immediately runs its tail
		// (`setRootApp(app);`). The tail MUST observe `setRootApp` before
		// `resetRootView` fires, otherwise iOS lifecycle events on the new
		// root see `rootApp === null` and `createNativeView` crashes with
		// "Cannot read properties of null (reading '_context')".
		const simulatedAppStart = () => {
			(application as any).run({ create: () => ({ tag: 'vue-root' }) });
			callOrder.push('setRootApp'); // the post-Application.run tail
		};

		simulatedAppStart();
		// At this point only `setRootApp` should have run.
		expect(callOrder).toEqual(['setRootApp']);

		await Promise.resolve();
		await Promise.resolve();
		expect(callOrder).toEqual(['setRootApp', 'resetRootView']);
	});

	it('bails synchronously without deferring when entry is undefined (Angular path)', async () => {
		const { application, resetSpy } = setupPlaceholderApplication();
		(application as any).run(undefined);

		// Even after microtasks drain, no reset should occur — `Application.run()`
		// with no entry is the Angular path where the framework manages root
		// views via launch events itself.
		await Promise.resolve();
		await Promise.resolve();
		expect(resetSpy).not.toHaveBeenCalled();
	});
});
