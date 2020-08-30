import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import { Label } from '@nativescript/core/ui/label';
import { Observable } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';
import { TabStripItem } from '@nativescript/core/ui/tab-navigation-base/tab-strip-item';
import { TabContentItem } from '@nativescript/core/ui/tab-navigation-base/tab-content-item';

export class TabsBindingNavigationViewModel extends Observable {
	private itemsCount: number = 1;
	public tabStripItems = new Array<TabStripItem>();
	public tabContentItems = new Array<TabContentItem>();

	constructor() {
		super();
		this.createItems();
		this.createItems();
	}

	createItems() {
		console.log('Create item');

		const _tabStripItems = new Array<TabStripItem>();
		const _tabContentItems = new Array<TabContentItem>();

		for (let index = 0; index < this.itemsCount; index++) {
			_tabStripItems.push(this.createTabStripItem(index));
			_tabContentItems.push(this.createContentStripItem(index));
		}

		this.tabStripItems = _tabStripItems;
		this.tabContentItems = _tabContentItems;
		this.itemsCount++;
	}

	public removeLastItem() {
		console.log('Remove item');
		this.tabStripItems.pop();
		this.tabContentItems.pop();
	}

	private createTabStripItem(index: number): TabStripItem {
		const item = new TabStripItem();
		item.title = 'Item ' + index;
		item.iconSource = 'res://icon';

		return item;
	}

	private createContentStripItem(index: number): TabContentItem {
		const contentItem = new TabContentItem();
		const label = new Label();
		const gridlayout = new GridLayout();
		label.text = 'Content Item ' + index;
		gridlayout.addChild(label);
		contentItem.content = gridlayout;

		return contentItem;
	}
}
