import { beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = () => void;

function createView(loaded = false) {
	const listeners = new Map<string, Set<Listener>>();
	return {
		isLoaded: loaded,
		_closeAllModalViewsInternal: vi.fn(() => false),
		on: vi.fn((event: string, cb: Listener) => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)!.add(cb);
		}),
		off: vi.fn((event: string, cb: Listener) => listeners.get(event)?.delete(cb)),
		emit(event: string) {
			if (event === 'loaded') this.isLoaded = true;
			for (const cb of [...(listeners.get(event) ?? [])]) cb();
		},
		listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
	};
}
type FakeView = ReturnType<typeof createView>;

const core = vi.hoisted(() => {
	const state = {
		root: null as any,
		nextRoot: null as any,
		frame: null as any,
		resetError: undefined as unknown,
	};
	class FakeApplication {
		run(_entry?: unknown): void {
			throw new Error('Application is already started.');
		}
	}
	const Application: any = new FakeApplication();
	Application.getRootView = () => state.root;
	Application.resetRootView = vi.fn((_entry: unknown) => {
		if (state.resetError !== undefined) throw state.resetError;
		state.root = state.nextRoot;
	});
	return { state, Application, FakeApplication };
});

vi.mock('@nativescript/core', () => ({ Application: core.Application, Frame: { topmost: () => core.state.frame } }));

let reboot: typeof import('./reboot.js');
const app = core.Application;
const originalRun = core.FakeApplication.prototype.run;

beforeEach(async () => {
	vi.resetModules();
	reboot = await import('./reboot.js');
	delete app.run;
	app.resetRootView.mockClear();
	Object.assign(core.state, { root: createView(true), nextRoot: createView(), frame: null, resetError: undefined });
});

describe('prepareHmrReboot', () => {
	it('closes open modals and redirects the next Application.run to resetRootView', () => {
		const oldRoot: FakeView = core.state.root;
		reboot.prepareHmrReboot();
		expect(oldRoot._closeAllModalViewsInternal).toHaveBeenCalledTimes(1);
		expect(app.run).not.toBe(originalRun);

		const entry = { moduleName: 'app-root' };
		app.run(entry);
		expect(app.resetRootView).toHaveBeenCalledWith(entry);
		expect(core.state.root).toBe(core.state.nextRoot);
		// The redirect is one-shot and restores the inherited `run`.
		expect(Object.prototype.hasOwnProperty.call(app, 'run')).toBe(false);
		expect(app.run).toBe(originalRun);
	});

	it('restores an own `run` property as it was', () => {
		const ownRun = vi.fn();
		app.run = ownRun;
		reboot.prepareHmrReboot();
		app.run({ create: () => core.state.nextRoot });
		expect(app.run).toBe(ownRun);
		expect(ownRun).not.toHaveBeenCalled();
	});

	it('is idempotent: a second call keeps one redirect and restores the original run', () => {
		reboot.prepareHmrReboot();
		const redirect = app.run;
		reboot.prepareHmrReboot();
		expect(app.run).toBe(redirect);
		app.run({ moduleName: 'app-root' });
		expect(app.resetRootView).toHaveBeenCalledTimes(1);
		expect(app.run).toBe(originalRun);
	});

	it('tolerates an app without a root view', () => {
		core.state.root = null;
		expect(() => reboot.prepareHmrReboot()).not.toThrow();
	});

	it('throws when closing modals fails, which the client turns into an app restart', () => {
		core.state.root._closeAllModalViewsInternal.mockImplementation(() => {
			throw new Error('modal');
		});
		expect(() => reboot.prepareHmrReboot()).toThrow('modal');
	});
});

describe('whenHmrRebootSettled', () => {
	it('resolves once the new root view is loaded', async () => {
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		const newRoot: FakeView = core.state.nextRoot;
		let settled = false;
		const result = reboot.whenHmrRebootSettled().then((value) => {
			settled = true;
			return value;
		});
		await Promise.resolve();
		expect(settled).toBe(false);
		newRoot.emit('loaded');
		expect(await result).toBeUndefined();
		expect(newRoot.listenerCount('loaded')).toBe(0);
	});

	it('resolves right away when the new root view is already loaded', async () => {
		core.state.nextRoot = createView(true);
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		expect(await reboot.whenHmrRebootSettled()).toBeUndefined();
	});

	it('resolves { error } when resetRootView throws, and a retry reboots', async () => {
		const failure = new Error('Parsing XML at 3:1');
		core.state.resetError = failure;
		reboot.prepareHmrReboot();
		expect(() => app.run({ moduleName: 'app-root' })).not.toThrow();
		expect(app.run).toBe(originalRun);
		expect(await reboot.whenHmrRebootSettled()).toEqual({ error: failure });

		core.state.resetError = undefined;
		core.state.nextRoot = createView(true);
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		expect(await reboot.whenHmrRebootSettled()).toBeUndefined();
	});

	it('resolves { error } when the root view did not change', async () => {
		core.state.nextRoot = core.state.root;
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		expect(await reboot.whenHmrRebootSettled()).toEqual({ error: expect.any(Error) });
	});

	it('resolves { error } for Application.run() without an entry, leaving the root alone', async () => {
		reboot.prepareHmrReboot();
		app.run();
		expect(app.resetRootView).not.toHaveBeenCalled();
		expect(app.run).toBe(originalRun);
		expect(await reboot.whenHmrRebootSettled()).toEqual({ error: expect.any(Error) });
	});

	it('resolves right away and disarms the redirect when the entry never called Application.run', async () => {
		reboot.prepareHmrReboot();
		expect(await reboot.whenHmrRebootSettled()).toBeUndefined();
		expect(app.run).toBe(originalRun);
		expect(app.resetRootView).not.toHaveBeenCalled();
	});

	it('keeps the redirect armed across a failed entry import, which never settles', async () => {
		reboot.prepareHmrReboot();
		// The import failed: no settle. The retry disposes again.
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		expect(app.resetRootView).toHaveBeenCalledTimes(1);
		expect(app.run).toBe(originalRun);
		core.state.nextRoot.emit('loaded');
		expect(await reboot.whenHmrRebootSettled()).toBeUndefined();
	});
});

describe('restorePageAfterHmrReboot', () => {
	function frameOn(moduleName: string | undefined) {
		return { currentEntry: moduleName ? { moduleName } : { create: () => null }, navigate: vi.fn() };
	}

	it('navigates the new topmost frame to the page that was current, without back stack', () => {
		core.state.frame = frameOn('pages/details');
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		const fresh = frameOn('main-page');
		core.state.frame = fresh;
		expect(reboot.restorePageAfterHmrReboot()).toBe(true);
		expect(fresh.navigate).toHaveBeenCalledWith({ moduleName: 'pages/details', clearHistory: true, animated: false });
		// One-shot.
		expect(reboot.restorePageAfterHmrReboot()).toBe(false);
	});

	it('does nothing when the frame is already there or the page was not navigated to by module name', () => {
		core.state.frame = frameOn('main-page');
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		expect(reboot.restorePageAfterHmrReboot()).toBe(false);
		expect(core.state.frame.navigate).not.toHaveBeenCalled();

		core.state.frame = frameOn(undefined);
		reboot.prepareHmrReboot();
		expect(reboot.restorePageAfterHmrReboot()).toBe(false);
	});

	it('keeps the last good page across a retry on an app without a frame', async () => {
		core.state.frame = frameOn('pages/details');
		core.state.resetError = new Error('broken');
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		await reboot.whenHmrRebootSettled();
		core.state.frame = null;
		core.state.resetError = undefined;
		reboot.prepareHmrReboot();
		app.run({ moduleName: 'app-root' });
		const fresh = frameOn('main-page');
		core.state.frame = fresh;
		expect(reboot.restorePageAfterHmrReboot()).toBe(true);
		expect(fresh.navigate).toHaveBeenCalledWith(expect.objectContaining({ moduleName: 'pages/details' }));
	});
});
