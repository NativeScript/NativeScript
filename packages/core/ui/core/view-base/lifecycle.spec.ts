import { describe, it, expect, beforeEach } from 'vitest';

import { View } from '../view';
import { Style } from '../../styling/style';
import { CssProperty, Property, applyAllNativeSetters, applyPendingNativeSetters, initNativeView } from '../properties';

/** `SuspendType` is module-private; the bits are part of the public field's contract. */
const Loaded = 1 << 20;
const NativeView = 1 << 21;
const UISetup = 1 << 22;

const log: string[] = [];

class TestView extends View {
	public testChildren: TestView[] = [];
	public resumeCount = 0;

	createNativeView(): Object {
		return {};
	}

	public eachChildView(callback: (child: any) => boolean): void {
		for (const child of this.testChildren) {
			if (!callback(child)) {
				return;
			}
		}
	}

	public _addViewToNativeVisualTree(): boolean {
		return true;
	}

	public _removeViewFromNativeVisualTree(view: any): void {
		view._isAddedToNativeVisualTree = false;
	}

	public addTestChild(child: TestView): void {
		this.testChildren.push(child);
		this._addView(child);
	}

	public onResumeNativeUpdates(): void {
		this.resumeCount++;
		super.onResumeNativeUpdates();
	}
}

function trackNative(property: { name: string; setNative: symbol }): void {
	(TestView.prototype as any)[property.setNative] = function (value: unknown) {
		log.push(`${property.name}=${String(value)}`);
	};
}

const oneProperty = new Property<TestView, string>({ name: 'one', defaultValue: 'one-default' });
oneProperty.register(TestView);
trackNative(oneProperty);

const twoProperty = new Property<TestView, string>({ name: 'two', defaultValue: 'two-default' });
twoProperty.register(TestView);
trackNative(twoProperty);

const threeProperty = new CssProperty<Style, string>({ name: 'three', cssName: 'three', defaultValue: 'three-default' });
threeProperty.register(Style);
trackNative(threeProperty);

beforeEach(() => {
	log.length = 0;
});

describe('suspend state through the view lifecycle', () => {
	it('starts held by Loaded, NativeView and UISetup', () => {
		const view: any = new TestView();

		expect(view._suspendNativeUpdatesCount).toBe(Loaded | NativeView | UISetup);
		expect(view._suspendedUpdates).toBeUndefined();
	});

	it('releases NativeView and UISetup on _setupUI, and Loaded on load', () => {
		const view: any = new TestView();

		view._setupUI({});
		expect(view._suspendNativeUpdatesCount).toBe(Loaded);
		expect(view.resumeCount).toBe(0);

		view.callLoaded();
		expect(view._suspendNativeUpdatesCount).toBe(0);
		expect(view.resumeCount).toBe(1);
	});

	it('takes the Loaded hold back on unload', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();

		view.callUnloaded();
		expect(view._suspendNativeUpdatesCount).toBe(Loaded);

		view.callLoaded();
		expect(view._suspendNativeUpdatesCount).toBe(0);
		expect(view.resumeCount).toBe(2);
	});

	it('counts nested _batchUpdate holds', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();

		view._batchUpdate(() => {
			expect(view._suspendNativeUpdatesCount).toBe(1);
			view._batchUpdate(() => {
				expect(view._suspendNativeUpdatesCount).toBe(2);
			});
			expect(view._suspendNativeUpdatesCount).toBe(1);
		});

		expect(view._suspendNativeUpdatesCount).toBe(0);
		expect(view.resumeCount).toBe(2);
	});

	it('rejects an unbalanced resume', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();

		expect(() => view._resumeNativeUpdates(0)).toThrow();
	});
});

describe('the dirty set', () => {
	it('is undefined until the first commit, then an empty bag', () => {
		const view: any = new TestView();
		view.one = 'a';

		expect(view._suspendedUpdates).toBeUndefined();

		view._setupUI({});
		expect(view._suspendedUpdates).toBeUndefined();

		view.callLoaded();
		expect(view._suspendedUpdates).toEqual({});
	});

	it('records first-dirtied order while suspended and is emptied by the commit', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();
		log.length = 0;

		view.callUnloaded();
		view.two = 'b';
		view.style.three = 'c';
		view.one = 'a';
		view.two = 'b2';

		expect(Object.keys(view._suspendedUpdates)).toEqual(['two', 'three', 'one']);

		view.callLoaded();

		expect(log).toEqual(['two=b2', 'three=c', 'one=a']);
		expect(view._suspendedUpdates).toEqual({});
	});

	it('goes back to a full sweep when a new native view is set', () => {
		const view: any = new TestView();
		view.one = 'a';
		view.style.three = 'c';
		view._setupUI({});
		view.callLoaded();
		log.length = 0;

		view.setNativeView({});

		expect(log).toEqual(['one=a', 'three=c']);
		expect(view._suspendNativeUpdatesCount).toBe(0);
	});
});

describe('setup order in a subtree', () => {
	it('sets up and loads children after their parent', () => {
		const parent: any = new TestView();
		const child: any = new TestView();
		parent.one = 'p';
		child.one = 'c';
		parent.addTestChild(child);

		parent._setupUI({});
		expect(log).toEqual([]);

		parent.callLoaded();

		expect(log).toEqual(['one=p', 'one=c']);
		expect(child._suspendNativeUpdatesCount).toBe(0);
	});
});

describe('the property application entry points', () => {
	it('applyAllNativeSetters walks view symbols before style symbols', () => {
		const view: any = new TestView();
		view.style.three = 'c';
		view.one = 'a';
		view._setupUI({});
		view.callLoaded();
		log.length = 0;

		applyAllNativeSetters(view);

		expect(log).toEqual(['one=a', 'three=c']);
	});

	it('applyPendingNativeSetters walks the dirty set in first-dirtied order', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();
		view.callUnloaded();
		view.two = 'b';
		view.one = 'a';
		log.length = 0;

		applyPendingNativeSetters(view);

		expect(log).toEqual(['two=b', 'one=a']);
	});

	it('initNativeView commits and clears the dirty set', () => {
		const view: any = new TestView();
		view._setupUI({});
		view.callLoaded();
		view.callUnloaded();
		view.one = 'a';
		log.length = 0;

		initNativeView(view);

		expect(log).toEqual(['one=a']);
		expect(view._suspendedUpdates).toEqual({});
	});
});
