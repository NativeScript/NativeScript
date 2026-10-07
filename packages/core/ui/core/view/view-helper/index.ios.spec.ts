import { describe, it, expect } from 'vitest';
import { IOSHelper } from './index.ios';

/** Models UIView's subview ordering; `insertSubviewAtIndex` is absent so any use of it throws. */
class FakeUIView {
	readonly children: FakeUIView[] = [];

	constructor(readonly tag: string) {}

	get subviews() {
		const children = this.children;
		return {
			count: children.length,
			objectAtIndex: (index: number) => children[index],
		};
	}

	addSubview(view: FakeUIView): void {
		this.children.push(view);
	}

	insertSubviewBelowSubview(view: FakeUIView, sibling: FakeUIView): void {
		this.children.splice(this.children.indexOf(sibling), 0, view);
	}
}

function parentWith(...tags: string[]): FakeUIView {
	const parent = new FakeUIView('parent');
	for (const tag of tags) {
		parent.addSubview(new FakeUIView(tag));
	}
	return parent;
}

function order(parent: FakeUIView): string[] {
	return parent.children.map((child) => child.tag);
}

describe('IOSHelper.insertNativeSubview', () => {
	it('inserts below the subview currently at the index', () => {
		const parent = parentWith('a', 'b', 'c');
		IOSHelper.insertNativeSubview(parent as any, new FakeUIView('x') as any, 1);
		expect(order(parent)).toEqual(['a', 'x', 'b', 'c']);
	});

	it('inserts at the front for index 0', () => {
		const parent = parentWith('a', 'b');
		IOSHelper.insertNativeSubview(parent as any, new FakeUIView('x') as any, 0);
		expect(order(parent)).toEqual(['x', 'a', 'b']);
	});

	it('appends when the index is absent or out of range', () => {
		const parent = parentWith('a', 'b');
		IOSHelper.insertNativeSubview(parent as any, new FakeUIView('x') as any);
		IOSHelper.insertNativeSubview(parent as any, new FakeUIView('y') as any, 3);
		IOSHelper.insertNativeSubview(parent as any, new FakeUIView('z') as any, Number.MAX_SAFE_INTEGER);
		expect(order(parent)).toEqual(['a', 'b', 'x', 'y', 'z']);
	});
});
