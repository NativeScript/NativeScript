import { describe, it, expect, beforeEach } from 'vitest';

import { View } from '../view';
import { Style } from '../../styling/style';
import { CssProperty, Property } from '../properties';
import { NativeUpdateBatch } from './batch';

const log: string[] = [];

class TestView extends View {
	public commits: NativeUpdateBatch[] = [];

	createNativeView(): Object {
		return {};
	}

	public _addViewToNativeVisualTree(): boolean {
		return true;
	}
}

/** Records the batch and applies it as the base class would. */
class OrderedView extends TestView {
	public commitNativeUpdates(batch: NativeUpdateBatch): void {
		this.commits.push(batch);
		log.push('commit');
		super.commitNativeUpdates(batch);
	}
}

function trackNative(property: { name: string; setNative: symbol }, target: typeof TestView): void {
	(target.prototype as any)[property.setNative] = function (value: unknown) {
		log.push(`${property.name}=${String(value)}`);
	};
}

const oneProperty = new Property<TestView, string>({ name: 'one', defaultValue: 'one-default' });
oneProperty.register(TestView);
trackNative(oneProperty, TestView);

const twoProperty = new Property<TestView, string>({ name: 'two', defaultValue: 'two-default' });
twoProperty.register(TestView);
trackNative(twoProperty, TestView);

const threeProperty = new CssProperty<Style, string>({ name: 'three', cssName: 'three', defaultValue: 'three-default' });
threeProperty.register(Style);
trackNative(threeProperty, TestView);

function loaded<T extends TestView>(view: T): T {
	(<any>view)._setupUI({});
	view.callLoaded();
	log.length = 0;

	return view;
}

beforeEach(() => {
	log.length = 0;
});

describe('commitNativeUpdates', () => {
	it('is not called per set on a class that does not override it', () => {
		const view: any = loaded(new TestView());

		view.one = 'a';

		expect(log).toEqual(['one=a']);
	});

	it('runs once per live set on a class that overrides it', () => {
		const view: any = loaded(new OrderedView());

		view.one = 'a';
		view.two = 'b';

		expect(log).toEqual(['commit', 'one=a', 'commit', 'two=b']);
	});

	it('receives the whole dirty set of a batched update, in first-dirtied order', () => {
		const view: any = loaded(new OrderedView());

		view._batchUpdate(() => {
			view.two = 'b';
			view.style.three = 'c';
			view.one = 'a';
		});

		expect(log).toEqual(['commit', 'two=b', 'three=c', 'one=a']);
	});

	it('lets an override apply a property before the rest', () => {
		class ReorderedView extends TestView {
			public commitNativeUpdates(batch: NativeUpdateBatch): void {
				batch.apply(oneProperty);
				super.commitNativeUpdates(batch);
			}
		}
		const view: any = loaded(new ReorderedView());

		view._batchUpdate(() => {
			view.two = 'b';
			view.one = 'a';
		});

		expect(log).toEqual(['one=a', 'two=b']);
	});

	it('applies a target at most once', () => {
		class TwiceView extends TestView {
			public commitNativeUpdates(batch: NativeUpdateBatch): void {
				batch.apply(oneProperty);
				batch.apply(oneProperty);
				super.commitNativeUpdates(batch);
			}
		}
		const view: any = loaded(new TwiceView());

		view.one = 'a';

		expect(log).toEqual(['one=a']);
	});

	it('drops a skipped target', () => {
		class SkippingView extends TestView {
			public commitNativeUpdates(batch: NativeUpdateBatch): void {
				batch.skip(twoProperty);
				super.commitNativeUpdates(batch);
			}
		}
		const view: any = loaded(new SkippingView());

		view._batchUpdate(() => {
			view.one = 'a';
			view.two = 'b';
		});

		expect(log).toEqual(['one=a']);
	});
});

describe('the batch', () => {
	function commitOf(view: TestView): NativeUpdateBatch {
		return view.commits[view.commits.length - 1];
	}

	it('reports what is pending and what was handled', () => {
		const view: any = loaded(new OrderedView());

		view.one = 'a';

		const batch = commitOf(view);
		expect(batch.node).toBe(view);
		expect(batch.has(oneProperty)).toBe(false);
		expect(batch.has(twoProperty)).toBe(false);
	});

	it('lists everything it applies, in commit order', () => {
		const view: any = loaded(new OrderedView());

		view._batchUpdate(() => {
			view.two = 'b';
			view.style.three = 'c';
			view.one = 'a';
		});

		expect(commitOf(view).entries).toEqual([twoProperty, threeProperty, oneProperty]);
	});

	it('is a mount batch on the first commit only', () => {
		const view: any = new OrderedView();
		view.one = 'a';
		view._setupUI({});
		view.callLoaded();

		expect(view.commits[0].isMount).toBe(true);

		view.two = 'b';

		expect(commitOf(view).isMount).toBe(false);
	});

	it('carries the value each property held at the last commit', () => {
		const view: any = loaded(new OrderedView());

		view.one = 'a';
		expect(commitOf(view).previous(oneProperty)).toBe('one-default');

		view.one = 'b';
		expect(commitOf(view).previous(oneProperty)).toBe('a');

		expect(commitOf(view).previous(twoProperty)).toBeUndefined();
	});

	it('records no previous values for a node whose class does not read them', () => {
		const view: any = loaded(new TestView());

		view._batchUpdate(() => {
			view.one = 'a';
			view.two = 'b';
		});

		expect(view._pendingPrevious).toBeUndefined();

		view.callUnloaded();
		view.one = 'c';
		expect(view._pendingPrevious).toBeUndefined();

		view.callLoaded();

		expect(log).toEqual(['one=a', 'two=b', 'one=c']);
		expect(view._pendingPrevious).toBeUndefined();
	});

	it('has no previous values on a mount', () => {
		const view: any = new OrderedView();
		view.one = 'a';
		view._setupUI({});
		view.callLoaded();

		expect(view.commits[0].previous(oneProperty)).toBeUndefined();
	});

	it('carries no child mutations in this phase', () => {
		const view: any = loaded(new OrderedView());
		view.one = 'a';

		const { children } = commitOf(view);
		expect(children).toEqual([]);
		expect(Object.isFrozen(children)).toBe(true);
	});
});
