import { describe, it, expect, beforeEach } from 'vitest';

import { View } from '../view';
import { Style } from '../../styling/style';
import { CssProperty, Property } from '../properties';
import { NativeUpdateBatch } from './batch';
import { NativeUpdates } from './scheduler';
import { Invalidation, InvalidationPhase } from './invalidation';

/** `SuspendType.Loaded`; the enum is internal but the bit is part of the field's contract. */
const Loaded = 1 << 20;

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

const Content = new Invalidation('content', { phase: InvalidationPhase.Content });

/** Raises `Content` and has a `[setNative]` of its own. */
const fourProperty = new Property<TestView, string>({ name: 'four', defaultValue: 'four-default', invalidates: [Content] });
fourProperty.register(TestView);
trackNative(fourProperty, TestView);

/** Raises `Content` and nothing else: no `[setNative]` is installed for it. */
const fiveProperty = new Property<TestView, string>({ name: 'five', defaultValue: 'five-default', invalidates: [Content] });
fiveProperty.register(TestView);

/** Raises `Content` on a class that handles neither the property nor the invalidation. */
class BareView extends View {
	createNativeView(): Object {
		return {};
	}
}

const sixProperty = new Property<BareView, string>({ name: 'six', defaultValue: 'six-default', invalidates: [Content] });
sixProperty.register(BareView);

(TestView.prototype as any)[Content.apply] = function (batch: NativeUpdateBatch) {
	log.push(`content(${String(batch.node.constructor.name)})`);
};

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
		const seen: boolean[] = [];

		class ReportingView extends TestView {
			public commitNativeUpdates(batch: NativeUpdateBatch): void {
				this.commits.push(batch);
				seen.push(batch.has(oneProperty), batch.has(twoProperty));
				batch.apply(oneProperty);
				seen.push(batch.has(oneProperty));
				super.commitNativeUpdates(batch);
				seen.push(batch.has(oneProperty));
			}
		}

		const view: any = loaded(new ReportingView());
		seen.length = 0;
		view.one = 'a';

		expect(commitOf(view).node).toBe(view);
		expect(seen).toEqual([true, false, false, false]);
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

describe('the scheduler', () => {
	it('only implements the sync mode', () => {
		expect(NativeUpdates.mode).toBe('sync');

		NativeUpdates.mode = 'sync';
		expect(NativeUpdates.mode).toBe('sync');

		expect(() => {
			(<any>NativeUpdates).mode = 'microtask';
		}).toThrow(/'sync' is the only mode/);
	});

	it('coalesces the writes made to a node inside a batch', () => {
		const view: any = loaded(new TestView());

		NativeUpdates.batch(() => {
			view.two = 'b';
			view.one = 'a';
			view.two = 'b2';

			expect(log).toEqual([]);
			expect(view._pendingPrevious).toBeUndefined();
		});

		expect(log).toEqual(['two=b2', 'one=a']);
		expect(view._suspendNativeUpdatesCount).toBe(0);
	});

	it('commits touched nodes in the order they were first written to', () => {
		const first: any = loaded(new TestView());
		const second: any = loaded(new TestView());

		NativeUpdates.batch(() => {
			second.one = 'second';
			first.one = 'first';
			second.two = 'second-two';
		});

		expect(log).toEqual(['one=second', 'two=second-two', 'one=first']);
	});

	it('commits only when the outermost batch closes', () => {
		const view: any = loaded(new TestView());

		NativeUpdates.batch(() => {
			NativeUpdates.batch(() => {
				view.one = 'a';
			});

			expect(log).toEqual([]);
			expect(NativeUpdates._depth).toBe(1);
		});

		expect(log).toEqual(['one=a']);
		expect(NativeUpdates._depth).toBe(0);
	});

	it('closes the batch when the callback throws', () => {
		const view: any = loaded(new TestView());

		expect(() =>
			NativeUpdates.batch(() => {
				view.one = 'a';
				throw new Error('boom');
			}),
		).toThrow('boom');

		expect(log).toEqual(['one=a']);
		expect(NativeUpdates._depth).toBe(0);
	});

	it('rejects an unmatched end', () => {
		expect(() => NativeUpdates.end()).toThrow(/without a matching begin/);
	});
});

describe('flushNativeUpdates', () => {
	it('pushes what a batch is holding and leaves the batch open', () => {
		const view: any = loaded(new TestView());

		NativeUpdates.batch(() => {
			view.one = 'a';
			expect(view.flushNativeUpdates()).toBe(true);
			expect(log).toEqual(['one=a']);
			expect(view._suspendNativeUpdatesCount).toBe(1);

			view.two = 'b';
		});

		expect(log).toEqual(['one=a', 'two=b']);
	});

	it('reports nothing to push to when the node has no native view', () => {
		const view: any = new TestView();
		view.one = 'a';

		expect(view.flushNativeUpdates()).toBe(false);
		expect(view.flushNativeUpdates({ force: true })).toBe(false);
		expect(log).toEqual([]);
	});

	it('leaves an unloaded node alone without force', () => {
		const view: any = new TestView();
		view.one = 'a';
		view._setupUI({});

		expect(view.flushNativeUpdates()).toBe(false);
		expect(log).toEqual([]);
	});

	it('pushes to an unloaded node with force, keeping the holds', () => {
		const view: any = new TestView();
		view.one = 'a';
		view._setupUI({});

		expect(view.flushNativeUpdates({ force: true })).toBe(true);
		expect(log).toEqual(['one=a']);
		expect(view._suspendNativeUpdatesCount).toBe(Loaded);

		log.length = 0;
		view.two = 'b';
		view.callLoaded();

		expect(log).toEqual(['two=b']);
	});

	it('flushes a subtree after each node', () => {
		const parent: any = loaded(new TestView());
		const child: any = loaded(new TestView());
		parent.eachChildView = (callback: any) => callback(child);

		NativeUpdates.batch(() => {
			child.one = 'child';
			parent.one = 'parent';

			expect(NativeUpdates.flush(parent)).toBe(true);
		});

		expect(log).toEqual(['one=parent', 'one=child']);
	});
});

describe('invalidates', () => {
	it('runs the aggregate handler after the property write', () => {
		const view: any = loaded(new TestView());

		view.four = 'a';

		expect(log).toEqual(['four=a', 'content(TestView)']);
	});

	it('runs the aggregate handler for a property with no native setter of its own', () => {
		const view: any = loaded(new TestView());

		view.five = 'a';

		expect(log).toEqual(['content(TestView)']);
	});

	it('runs the aggregate handler once however many properties raised it', () => {
		const view: any = loaded(new TestView());

		NativeUpdates.batch(() => {
			view.four = 'a';
			view.five = 'b';
			view.one = 'c';
		});

		expect(log).toEqual(['four=a', 'one=c', 'content(TestView)']);
	});

	it('is a batch target an override can pre-empt or drop', () => {
		const pending: boolean[] = [];

		class ContentFirstView extends TestView {
			public commitNativeUpdates(batch: NativeUpdateBatch): void {
				pending.push(batch.has(Content));
				batch.apply(Content);
				batch.skip(fourProperty);
				super.commitNativeUpdates(batch);
			}
		}
		const view: any = loaded(new ContentFirstView());
		pending.length = 0;

		view.four = 'a';

		expect(pending).toEqual([true]);
		expect(log).toEqual(['content(ContentFirstView)']);
	});

	it('gives the aggregate handler the value the property held at the last commit', () => {
		const seen: unknown[] = [];

		class ContentReadingView extends TestView {}
		(ContentReadingView.prototype as any)[Content.apply] = function (batch: NativeUpdateBatch) {
			seen.push(batch.previous(fourProperty));
		};

		const view: any = loaded(new ContentReadingView());
		seen.length = 0;

		view.four = 'a';
		view.four = 'b';

		expect(seen).toEqual(['four-default', 'a']);
	});

	it('does nothing on a node with no handler for the invalidation', () => {
		const view: any = new BareView();
		view._setupUI({});
		view.callLoaded();
		log.length = 0;

		view.six = 'a';

		expect(log).toEqual([]);
	});
});
