import { describe, it, expect, vi } from 'vitest';
import { TabViewBase, TabViewItemBase } from './tab-view-common';
import { View } from '../core/view';

class TabViewItem extends TabViewItemBase {
	public _update() {
		// no native tab to refresh in the common layer
	}
}

function createItem(): TabViewItem {
	const item = new TabViewItem();
	item.view = new View();

	return item;
}

describe('TabViewBase.onItemsChanged', () => {
	it('keeps the items present in both arrays attached', () => {
		const tabView = new TabViewBase();
		const first = createItem();
		const second = createItem();
		tabView.items = [first, second];

		const removeView = vi.spyOn(tabView, '_removeView');
		const addView = vi.spyOn(tabView, '_addView');
		tabView.items = [first, second];

		expect(removeView).not.toHaveBeenCalled();
		expect(addView).not.toHaveBeenCalled();
		expect(first.parent).toBe(tabView);
		expect(second.parent).toBe(tabView);
	});

	it('detaches only the items missing from the new array and attaches only the new ones', () => {
		const tabView = new TabViewBase();
		const first = createItem();
		const second = createItem();
		const third = createItem();
		tabView.items = [first, second];

		const removeView = vi.spyOn(tabView, '_removeView');
		const addView = vi.spyOn(tabView, '_addView');
		tabView.items = [second, third];

		expect(removeView).toHaveBeenCalledTimes(1);
		expect(removeView).toHaveBeenCalledWith(first);
		expect(addView).toHaveBeenCalledTimes(1);
		expect(addView).toHaveBeenCalledWith(third);
		expect(first.parent).toBeUndefined();
		expect(second.parent).toBe(tabView);
		expect(third.parent).toBe(tabView);
	});

	it('moves an item over from another TabView', () => {
		const source = new TabViewBase();
		const target = new TabViewBase();
		const item = createItem();
		source.items = [item];

		target.items = [item];

		expect(item.parent).toBe(target);
	});

	it('rejects an item without a view', () => {
		const tabView = new TabViewBase();

		expect(() => (tabView.items = [new TabViewItem()])).toThrow('TabViewItem must have a view.');
	});
});

describe('TabViewBase._isChildPresented', () => {
	it('presents only the selected item', () => {
		const tabView = new TabViewBase();
		const first = createItem();
		const second = createItem();
		tabView.items = [first, second];
		tabView.selectedIndex = 1;

		expect(tabView._isChildPresented(first)).toBe(false);
		expect(tabView._isChildPresented(second)).toBe(true);
	});

	it('follows a selection change', () => {
		const tabView = new TabViewBase();
		const first = createItem();
		const second = createItem();
		tabView.items = [first, second];
		tabView.selectedIndex = 1;

		tabView.selectedIndex = 0;

		expect(tabView._isChildPresented(first)).toBe(true);
		expect(tabView._isChildPresented(second)).toBe(false);
	});
});
