import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Application } from '../../application/application';
import { ActivityCallbacksImplementation } from './index.android';

vi.mock('./fragment.transitions', () => ({}));
vi.mock('./fragment', () => ({}));
vi.mock('../embedding', () => ({ isEmbedded: () => false }));

function createActivity() {
	return { getIntent: () => null, setContentView: () => {} };
}

function createRootView(context: object, isLoaded = true) {
	const order: string[] = [];
	const view = {
		_context: context,
		_domId: 1,
		isLoaded,
		nativeViewProtected: {},
		callUnloaded() {
			order.push('unloaded');
			view.isLoaded = false;
		},
		callLoaded() {
			order.push('loaded');
			view.isLoaded = true;
		},
		_setupAsRootView(activity: object) {
			order.push('setup');
			view._context = activity;
		},
		_tearDownUI: vi.fn(),
	};

	return { view, order };
}

function createCallbacks(rootView?: object) {
	const callbacks = new ActivityCallbacksImplementation();
	(callbacks as any)._rootView = rootView;

	return callbacks;
}

describe('activity callbacks with a root view shared between activities', () => {
	const superFunc = vi.fn();
	let previousAndroid: PropertyDescriptor | undefined;

	beforeEach(() => {
		previousAndroid = Object.getOwnPropertyDescriptor(Application, 'android');
		superFunc.mockClear();
		vi.stubGlobal('org', { nativescript: { widgets: { CommonLayoutParams: class {} } } });
		vi.spyOn(Application, 'createRootView').mockImplementation((view) => view);
		vi.spyOn(Application, 'initRootView').mockImplementation(() => {});
		Object.defineProperty(Application, 'android', {
			configurable: true,
			value: { _getWindowForActivity: () => undefined },
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		if (previousAndroid) {
			Object.defineProperty(Application, 'android', previousAndroid);
		} else {
			delete (Application as any).android;
		}
	});

	describe('an activity that no longer shows the root', () => {
		const stale = createActivity();
		const current = createActivity();

		it('keeps the root loaded when it stops', () => {
			const { view, order } = createRootView(current);

			createCallbacks(view).onStop(stale, superFunc);

			expect(order).toEqual([]);
			expect(superFunc).toHaveBeenCalledTimes(1);
		});

		it('keeps the root intact when it is destroyed', () => {
			const { view } = createRootView(current);

			createCallbacks(view).onDestroy(stale, superFunc);

			expect(view._tearDownUI).not.toHaveBeenCalled();
			expect(superFunc).toHaveBeenCalledTimes(1);
		});

		it('does not save the root id for a later restore', () => {
			const { view } = createRootView(current);
			const outState = { putInt: vi.fn() };

			createCallbacks(view).onSaveInstanceState(stale as any, outState as any, superFunc);

			expect(outState.putInt).not.toHaveBeenCalled();
			expect(superFunc).toHaveBeenCalledTimes(1);
		});

		it('takes the root back when it starts again', () => {
			const { view, order } = createRootView(current);

			createCallbacks(view).onStart(stale, superFunc);

			expect(order).toEqual(['unloaded', 'setup', 'loaded']);
			expect(view._context).toBe(stale);
		});
	});

	describe('the activity showing the root', () => {
		const showing = createActivity();

		it('unloads the root when it stops', () => {
			const { view, order } = createRootView(showing);

			createCallbacks(view).onStop(showing, superFunc);

			expect(order).toEqual(['unloaded']);
		});

		it('tears down the root when it is destroyed', () => {
			const { view } = createRootView(showing);

			createCallbacks(view).onDestroy(showing, superFunc);

			expect(view._tearDownUI).toHaveBeenCalledWith(true);
		});

		it('loads the root without setting it up again when it starts', () => {
			const { view, order } = createRootView(showing, false);

			createCallbacks(view).onStart(showing, superFunc);

			expect(order).toEqual(['loaded']);
		});
	});

	it('keeps the root in a new activity that adopts it before the old one stops and is destroyed', () => {
		const old = createActivity();
		const next = createActivity();
		const { view, order } = createRootView(old);

		createCallbacks().resetActivityContent(next as any, view as any);
		createCallbacks(view).onStop(old, superFunc);
		createCallbacks(view).onDestroy(old, superFunc);

		expect(order).toEqual(['unloaded', 'setup', 'loaded']);
		expect(view._tearDownUI).not.toHaveBeenCalled();
		expect(view._context).toBe(next);
	});
});
