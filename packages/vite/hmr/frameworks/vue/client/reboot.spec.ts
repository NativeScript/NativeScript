import { beforeEach, describe, expect, it, vi } from 'vitest';

const fakes = vi.hoisted(() => {
	const ELEMENT_REF = Symbol('elementRef');
	const state = { root: null as any, nextRoot: null as any, resetError: undefined as unknown };
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
	return { ELEMENT_REF, state, Application };
});

vi.mock('@nativescript/core', () => ({ Application: fakes.Application, Frame: { topmost: () => null } }));
vi.mock('nativescript-vue', () => ({ ELEMENT_REF: fakes.ELEMENT_REF }));

// A root view as nativescript-vue's `app.start()` leaves it: its element sits
// in an NSVRoot that Vue tagged with the app.
function createVueRoot() {
	const container: { __vue_app__?: unknown } = {};
	const app = {
		unmount: vi.fn(() => {
			delete container.__vue_app__;
		}),
	};
	container.__vue_app__ = app;
	const view = {
		isLoaded: true,
		_closeAllModalViewsInternal: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
		[fakes.ELEMENT_REF]: { parentNode: container },
	};
	return { app, view };
}

let reboot: typeof import('./reboot.js');
const application = fakes.Application;
let current: ReturnType<typeof createVueRoot>;
let next: ReturnType<typeof createVueRoot>;

beforeEach(async () => {
	vi.resetModules();
	reboot = await import('./reboot.js');
	delete application.run;
	application.resetRootView.mockClear();
	current = createVueRoot();
	next = createVueRoot();
	Object.assign(fakes.state, { root: current.view, nextRoot: next.view, resetError: undefined });
});

const start = () => application.run({ create: () => fakes.state.nextRoot });

describe('Vue soft reboot', () => {
	it('closes modals, redirects the next Application.run to resetRootView and unmounts the replaced app once the new root is up', async () => {
		reboot.prepareHmrReboot();
		expect(current.view._closeAllModalViewsInternal).toHaveBeenCalledTimes(1);
		start();
		expect(application.resetRootView).toHaveBeenCalledTimes(1);
		expect(current.app.unmount).not.toHaveBeenCalled();

		await expect(reboot.whenHmrRebootSettled()).resolves.toBeUndefined();
		expect(current.app.unmount).toHaveBeenCalledTimes(1);
		expect(next.app.unmount).not.toHaveBeenCalled();
	});

	it('keeps the old app mounted through a failed reboot and unmounts it once a retry replaces the root', async () => {
		const error = new Error('resetRootView failed');
		fakes.state.resetError = error;
		reboot.prepareHmrReboot();
		start();
		await expect(reboot.whenHmrRebootSettled()).resolves.toEqual({ error });
		expect(current.app.unmount).not.toHaveBeenCalled();

		fakes.state.resetError = undefined;
		reboot.prepareHmrReboot();
		start();
		await expect(reboot.whenHmrRebootSettled()).resolves.toBeUndefined();
		expect(current.app.unmount).toHaveBeenCalledTimes(1);
	});

	it('leaves the app mounted when the entry never starts a new one', async () => {
		reboot.prepareHmrReboot();
		await expect(reboot.whenHmrRebootSettled()).resolves.toBeUndefined();
		expect(current.app.unmount).not.toHaveBeenCalled();
		expect(Object.prototype.hasOwnProperty.call(application, 'run')).toBe(false);
	});

	it('resolves { error } when unmounting the replaced app throws', async () => {
		const error = new Error('onUnmounted threw');
		current.app.unmount.mockImplementation(() => {
			throw error;
		});
		reboot.prepareHmrReboot();
		start();
		await expect(reboot.whenHmrRebootSettled()).resolves.toEqual({ error });
	});

	it('replaces a root view that is not a Vue app without unmounting anything', async () => {
		fakes.state.root = { isLoaded: true, _closeAllModalViewsInternal: vi.fn(), on: vi.fn(), off: vi.fn() };
		reboot.prepareHmrReboot();
		start();
		await expect(reboot.whenHmrRebootSettled()).resolves.toBeUndefined();
		expect(next.app.unmount).not.toHaveBeenCalled();
	});
});
