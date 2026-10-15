import { StackLayout } from '../../layouts/stack-layout';
import { GestureTypes } from '../../gestures';

function nextTurn() {
	return new Promise((resolve) => setTimeout(resolve));
}

class FakeRecognizer {
	delegate: any;
	target: any;
	initWithTargetAction(target: any) {
		this.target = target;
		return this;
	}
}

// A loaded view whose native view records the recognizers core adds and removes.
function loadedView() {
	const view = new StackLayout();
	const added: FakeRecognizer[] = [];
	const removed: FakeRecognizer[] = [];
	(view as any).nativeViewProtected = {
		addGestureRecognizer: (recognizer: FakeRecognizer) => added.push(recognizer),
		removeGestureRecognizer: (recognizer: FakeRecognizer) => removed.push(recognizer),
	};
	(view as any)._isLoaded = true;
	return { view, added, removed };
}

describe('gesture listeners', () => {
	const NSObject = (global as any).NSObject;
	const originalNew = NSObject.new;

	beforeAll(() => {
		(global as any).UITapGestureRecognizer = { alloc: () => new FakeRecognizer() };
		// Let recognizer targets (NSObject subclasses) be created as themselves.
		NSObject.new = function () {
			return new this();
		};
	});

	afterAll(() => {
		delete (global as any).UITapGestureRecognizer;
		NSObject.new = originalNew;
	});

	it('keeps the recognizer when a listener is swapped in the same turn', async () => {
		const { view, added, removed } = loadedView();
		const first = vi.fn();
		const second = vi.fn();

		view.on('tap', first);
		const observer = view.getGestureObservers(GestureTypes.tap)[0];
		view.off('tap', first);
		view.on('tap', second);
		await nextTurn();

		expect(added).toHaveLength(1);
		expect(removed).toHaveLength(0);
		expect(view.getGestureObservers(GestureTypes.tap)).toEqual([observer]);
		expect(observer.callback).toBe(second);
	});

	it('calls only the new listener for the gesture in progress', () => {
		const { view, added } = loadedView();
		const first = vi.fn();
		const second = vi.fn();
		const context = {};

		view.on('tap', first);
		view.off('tap', first);
		view.on('tap', second, context);

		added[0].target.recognize({ locationInView: () => ({ x: 1, y: 2 }), numberOfTouches: 1 });

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
		expect(second.mock.contexts[0]).toBe(context);
		expect(second.mock.calls[0][0].getX()).toBe(1);
	});

	it('stops calling a removed listener right away', () => {
		const { view, added } = loadedView();
		const listener = vi.fn();

		view.on('tap', listener);
		view.off('tap', listener);
		added[0].target.recognize({ locationInView: () => ({ x: 0, y: 0 }), numberOfTouches: 1 });

		expect(listener).not.toHaveBeenCalled();
		expect(view.getGestureObservers(GestureTypes.tap)).toBeUndefined();
	});

	it('removes the recognizer in the next turn when no listener takes it over', async () => {
		const { view, added, removed } = loadedView();
		const listener = vi.fn();

		view.on('tap', listener);
		const observer = view.getGestureObservers(GestureTypes.tap)[0];
		const disconnect = vi.spyOn(observer, 'disconnect');
		view.off('tap', listener);

		expect(removed).toHaveLength(0);
		await nextTurn();

		expect(disconnect).toHaveBeenCalledTimes(1);
		expect(removed).toEqual(added);

		// A later listener gets a fresh recognizer.
		view.on('tap', listener);
		expect(added).toHaveLength(2);
	});

	it('does not hand a released recognizer to another gesture type', async () => {
		const { view } = loadedView();
		const tap = vi.fn();
		const doubleTap = vi.fn();

		view.on('tap', tap);
		const tapObserver = view.getGestureObservers(GestureTypes.tap)[0];
		view.off('tap', tap);
		view.on('doubleTap', doubleTap);

		expect(view.getGestureObservers(GestureTypes.doubleTap)[0]).not.toBe(tapObserver);
	});

	it('still ignores a listener that is already added', () => {
		const { view, added } = loadedView();
		const listener = vi.fn();

		view.on('tap', listener);
		view.on('tap', listener);

		expect(view.getGestureObservers(GestureTypes.tap)).toHaveLength(1);
		expect(added).toHaveLength(1);
	});
});
