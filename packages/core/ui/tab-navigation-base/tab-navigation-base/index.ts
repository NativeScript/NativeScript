// Types
import { TabNavigationBase as TabNavigationBaseDefinition } from '.';
import { TabStripItem } from '../tab-strip-item';
import { View, AddArrayFromBuilder, AddChildFromBuilder } from '../../core/view';

// Requires
import { Color } from '../../../color';
import { ViewBase } from '../../core/view-base';
import { Property, CoercibleProperty } from '../../core/properties';
import { EventData } from '../../../data/observable';
import { TabContentItem } from '../tab-content-item';
import { TabStrip } from '../tab-strip';

// TODO: Impl trace
// export const traceCategory = "TabView";

/**
 * Defines the data for the tab navigation selectedIndexChanged event.
 */
export interface SelectedIndexChangedEventData extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

export class TabNavigationBase extends View implements TabNavigationBaseDefinition, AddChildFromBuilder, AddArrayFromBuilder {
	public static selectedIndexChangedEvent = 'selectedIndexChanged';

	public items: TabContentItem[];
	public tabStrip: TabStrip;
	public selectedIndex: number;

	public _addArrayFromBuilder(name: string, value: Array<any>) {
		if (name === 'items') {
			this.items = value;
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof TabContentItem) {
			if (!this.items) {
				this.items = new Array<TabContentItem>();
			}
			this.items.push(<TabContentItem>value);
			this._addView(value);
			// selectedIndexProperty.coerce(this);
		} else if (value instanceof TabStrip) {
			// Setting tabStrip will trigger onTabStripChanged
			this.tabStrip = value;
		}
	}

	get _selectedView(): View {
		const selectedIndex = this.selectedIndex;

		return selectedIndex > -1 ? this.items[selectedIndex].content : null;
	}

	get _childrenCount(): number {
		const items = this.items;

		return items ? items.length : 0;
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		const items = this.items;
		if (items) {
			items.forEach((item, i) => {
				callback(item);
			});
		}

		const tabStrip = this.tabStrip;
		if (tabStrip) {
			callback(tabStrip);
		}
	}

	public eachChildView(callback: (child: View) => boolean) {
		const items = this.items;
		if (items) {
			items.forEach((item, i) => {
				callback(item.content);
			});
		}
	}

	public onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void {
		if (oldItems) {
			oldItems.forEach((item) => this._removeView(item));
		}

		if (newItems) {
			newItems.forEach((item) => {
				if (!item.content) {
					throw new Error(`TabContentItem must have a content (view).`);
				}

				this._addView(item);
			});
		}
	}

	public onTabStripChanged(oldTabStrip: TabStrip, newTabStrip: TabStrip) {
		if (oldTabStrip && oldTabStrip.parent) {
			this._removeView(oldTabStrip);
		}

		if (newTabStrip) {
			this._addView(newTabStrip);
		}
	}

	public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
		// to be overridden in platform specific files
		this.notify(<SelectedIndexChangedEventData>{
			eventName: TabNavigationBase.selectedIndexChangedEvent,
			object: this,
			oldIndex,
			newIndex,
		});
	}

	public getTabBarBackgroundColor(): any {
		// overridden by inheritors
		return null;
	}

	public getTabBarBackgroundArgbColor(): any {
		// This method is implemented only for Android
		const colorDrawable = this.getTabBarBackgroundColor();

		return colorDrawable && colorDrawable.getColor && colorDrawable.getColor();
	}

	public setTabBarBackgroundColor(value: any): void {
		// overridden by inheritors
	}

	public getTabBarFontInternal(): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarFontInternal(value: any): void {
		// overridden by inheritors
	}

	public getTabBarTextTransform(): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarTextTransform(value: any): void {
		// overridden by inheritors
	}

	public getTabBarHighlightColor(): any {
		// overridden by inheritors
	}

	public setTabBarHighlightColor(value: any) {
		// overridden by inheritors
	}

	public getTabBarSelectedItemColor(): Color {
		// overridden by inheritors
		return null;
	}

	public setTabBarSelectedItemColor(value: Color) {
		// overridden by inheritors
	}

	public getTabBarUnSelectedItemColor(): Color {
		// overridden by inheritors
		return null;
	}

	public setTabBarUnSelectedItemColor(value: Color) {
		// overridden by inheritors
	}

	public getTabBarColor(): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarColor(value: any): void {
		// overridden by inheritors
	}

	public setTabBarItemTitle(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public getTabBarItemBackgroundColor(tabStripItem: TabStripItem): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public getTabBarItemColor(tabStripItem: TabStripItem): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarItemColor(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public setTabBarIconColor(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public setTabBarIconSource(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public getTabBarItemFontSize(tabStripItem: TabStripItem): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarItemFontSize(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public getTabBarItemFontInternal(tabStripItem: TabStripItem): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}

	public getTabBarItemTextTransform(tabStripItem: TabStripItem): any {
		// overridden by inheritors
		return null;
	}

	public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: any): void {
		// overridden by inheritors
	}
}

export interface TabNavigationBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

const MIN_ICON_SIZE = 24;
const MAX_ICON_WIDTH = 31;
const MAX_ICON_HEIGHT = 28;

export function getIconSpecSize(size: { width: number; height: number }): { width: number; height: number } {
	const inWidth = size.width;
	const inHeight = size.height;
	let outWidth = 0;
	let outHeight = 0;

	if (inWidth < inHeight) {
		outWidth = MIN_ICON_SIZE;
		outHeight = (inHeight * MIN_ICON_SIZE) / inWidth;
		if (outHeight > MAX_ICON_HEIGHT) {
			outHeight = MAX_ICON_HEIGHT;
			outWidth = (inWidth * MAX_ICON_HEIGHT) / inHeight;
		}
	} else {
		outHeight = MIN_ICON_SIZE;
		outWidth = (inWidth * MIN_ICON_SIZE) / inHeight;
		if (outWidth > MAX_ICON_WIDTH) {
			outWidth = MAX_ICON_WIDTH;
			outHeight = (inHeight * MAX_ICON_WIDTH) / inWidth;
		}
	}

	return { width: outWidth, height: outHeight };
}

export const selectedIndexProperty = new CoercibleProperty<TabNavigationBase, number>({
	name: 'selectedIndex',
	defaultValue: -1,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		target.onSelectedIndexChanged(oldValue, newValue);
	},
	coerceValue: (target, value) => {
		const items = target.items;
		if (items) {
			const max = items.length - 1;
			if (value < 0) {
				value = 0;
			}
			if (value > max) {
				value = max;
			}
		} else {
			value = -1;
		}

		return value;
	},
	valueConverter: (v) => parseInt(v),
});
selectedIndexProperty.register(TabNavigationBase);

export const _tabs = new Array<WeakRef<TabNavigationBase>>();

export const itemsProperty = new Property<TabNavigationBase, TabContentItem[]>({
	name: 'items',
	valueChanged: (target, oldValue, newValue) => {
		target.onItemsChanged(oldValue, newValue);
	},
});
itemsProperty.register(TabNavigationBase);

export const tabStripProperty = new Property<TabNavigationBase, TabStrip>({
	name: 'tabStrip',
	valueChanged: (target, oldValue, newValue) => {
		target.onTabStripChanged(oldValue, newValue);
	},
});
tabStripProperty.register(TabNavigationBase);
