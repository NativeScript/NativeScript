import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => {
	(globalThis as any).androidx = { core: { graphics: {} } };
});

import { AndroidHelper } from './index.android';

/** Models android.view.ViewGroup, including its IndexOutOfBoundsException for out-of-range indexes. */
class FakeViewGroup {
	readonly children: string[] = [];

	getChildCount(): number {
		return this.children.length;
	}

	addView(view: string, index?: number): void {
		if (index === undefined || index === -1) {
			this.children.push(view);
			return;
		}
		if (index < 0 || index > this.children.length) {
			throw new Error(`IndexOutOfBoundsException: index=${index} count=${this.children.length}`);
		}
		this.children.splice(index, 0, view);
	}
}

function parentWith(...views: string[]): FakeViewGroup {
	const parent = new FakeViewGroup();
	parent.children.push(...views);
	return parent;
}

describe('AndroidHelper.insertNativeSubview', () => {
	it('inserts at the child index', () => {
		const parent = parentWith('a', 'b', 'c');
		AndroidHelper.insertNativeSubview(parent as any, 'x' as any, 1);
		expect(parent.children).toEqual(['a', 'x', 'b', 'c']);
	});

	it('appends when the index is absent, negative, or out of range', () => {
		const parent = parentWith('a', 'b');
		AndroidHelper.insertNativeSubview(parent as any, 'x' as any);
		AndroidHelper.insertNativeSubview(parent as any, 'y' as any, -1);
		AndroidHelper.insertNativeSubview(parent as any, 'z' as any, Number.MAX_SAFE_INTEGER);
		expect(parent.children).toEqual(['a', 'b', 'x', 'y', 'z']);
	});
});
