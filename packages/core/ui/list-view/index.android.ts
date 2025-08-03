import { ItemEventData, ItemsSource } from '.';
import { ListViewBase, separatorColorProperty, itemTemplatesProperty, stickyHeaderProperty, stickyHeaderTemplateProperty, stickyHeaderHeightProperty, sectionedProperty } from './list-view-common';
import { View, KeyedTemplate } from '../core/view';
import { unsetValue } from '../core/properties/property-shared';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { Observable } from '../../data/observable';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { LayoutBase } from '../layouts/layout-base';
import { profile } from '../../profiling';
import { Builder } from '../builder';
import { Template } from '../core/view';
import { Label } from '../label';

export * from './list-view-common';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;

// View type constants for sectioned lists
const ITEM_VIEW_TYPE = 0;
// HEADER_VIEW_TYPE will be dynamically calculated as the last index

interface ItemClickListener {
	new (owner: ListView): android.widget.AdapterView.OnItemClickListener;
}

let ItemClickListener: ItemClickListener;

function initializeItemClickListener(): void {
	if (ItemClickListener) {
		return;
	}

	@NativeClass
	@Interfaces([android.widget.AdapterView.OnItemClickListener])
	class ItemClickListenerImpl extends java.lang.Object implements android.widget.AdapterView.OnItemClickListener {
		constructor(public owner: ListView) {
			super();

			return global.__native(this);
		}

		onItemClick<T extends android.widget.Adapter>(parent: android.widget.AdapterView<T>, convertView: android.view.View, index: number, id: number) {
			const owner = this.owner;
			const view = owner._realizedItems.get(convertView).view;
			owner.notify({
				eventName: ITEMTAP,
				object: owner,
				index: index,
				view: view,
			});
		}
	}

	ItemClickListener = ItemClickListenerImpl;
}

export class ListView extends ListViewBase {
	nativeViewProtected: android.widget.ListView;
	private _androidViewId = -1;

	public _realizedItems = new Map<
		android.view.View,
		{
			view: View;
			templateKey: string;
		}
	>();
	public _availableViews = new Map<string, Set<android.view.View>>();
	public _realizedTemplates = new Map<string, Map<android.view.View, View>>();

	private _ensureAvailableViews(templateKey: string) {
		if (!this._availableViews.has(templateKey)) {
			this._availableViews.set(templateKey, new Set());
		}
	}

	public _registerViewToTemplate(templateKey: string, nativeView: android.view.View, view: View) {
		this._realizedItems.set(nativeView, {
			view,
			templateKey,
		});
		if (!this._realizedTemplates.has(templateKey)) {
			this._realizedTemplates.set(templateKey, new Map());
		}
		this._realizedTemplates.get(templateKey).set(nativeView, view);
		this._ensureAvailableViews(templateKey);
		const availableViews = this._availableViews.get(templateKey);
		availableViews.add(nativeView);
	}

	public _markViewUsed(nativeView: android.view.View) {
		const viewData = this._realizedItems.get(nativeView);
		if (!viewData) {
			throw new Error('View not registered');
		}
		this._ensureAvailableViews(viewData.templateKey);
		this._availableViews.get(viewData.templateKey).delete(nativeView);
	}
	public _markViewUnused(nativeView: android.view.View) {
		const viewData = this._realizedItems.get(nativeView);
		if (!viewData) {
			throw new Error('View not registered');
		}
		this._ensureAvailableViews(viewData.templateKey);
		this._availableViews.get(viewData.templateKey).add(nativeView);
	}
	public _getKeyFromView(nativeView: android.view.View) {
		return this._realizedItems.get(nativeView).templateKey;
	}
	public _hasAvailableView(templateKey: string) {
		this._ensureAvailableViews(templateKey);
		return this._availableViews.get(templateKey).size > 0;
	}
	public _getAvailableView(templateKey: string) {
		this._ensureAvailableViews(templateKey);
		if (!this._hasAvailableView(templateKey)) {
			return null;
		}
		const view: android.view.View = this._availableViews.get(templateKey).values().next().value;
		this._markViewUsed(view);
		return view;
	}

	@profile
	public createNativeView() {
		const listView = new android.widget.ListView(this._context);
		listView.setDescendantFocusability(android.view.ViewGroup.FOCUS_AFTER_DESCENDANTS);

		// Fixes issue with black random black items when scrolling
		listView.setCacheColorHint(android.graphics.Color.TRANSPARENT);

		return listView;
	}

	public initNativeView(): void {
		super.initNativeView();
		this.updateEffectiveRowHeight();

		const nativeView = this.nativeViewProtected;
		initializeItemClickListener();
		ensureListViewAdapterClass();
		const adapter = new ListViewAdapterClass(this);
		nativeView.setAdapter(adapter);
		(<any>nativeView).adapter = adapter;

		const itemClickListener = new ItemClickListener(this);
		nativeView.setOnItemClickListener(itemClickListener);
		(<any>nativeView).itemClickListener = itemClickListener;

		if (this._androidViewId < 0) {
			this._androidViewId = android.view.View.generateViewId();
		}
		nativeView.setId(this._androidViewId);
	}

	public disposeNativeView() {
		const nativeView = this.nativeViewProtected;
		nativeView.setAdapter(null);
		if ((<any>nativeView).itemClickListener) {
			(<any>nativeView).itemClickListener.owner = null;
		}
		if ((<any>nativeView).adapter) {
			(<any>nativeView).adapter.owner = null;
		}
		this.clearRealizedCells();
		super.disposeNativeView();
	}

	public onLoaded() {
		super.onLoaded();
		// Without this call itemClick won't be fired... :(
		this.requestLayout();
	}

	public refresh() {
		const nativeView = this.nativeViewProtected;
		if (!nativeView || !nativeView.getAdapter()) {
			return;
		}

		// clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
		this._realizedItems.forEach(({ view }, nativeView) => {
			if (!(view.bindingContext instanceof Observable)) {
				view.bindingContext = null;
			}
		});

		(<android.widget.BaseAdapter>nativeView.getAdapter()).notifyDataSetChanged();
	}

	public scrollToIndex(index: number) {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			nativeView.setSelection(index);
		}
	}

	public scrollToIndexAnimated(index: number) {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			nativeView.smoothScrollToPosition(index);
		}
	}

	get _childrenCount(): number {
		return this._realizedItems.size;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		this._realizedItems.forEach(({ view }, nativeView) => {
			if (view.parent instanceof ListView) {
				callback(view);
			} else {
				// in some cases (like item is unloaded from another place (like angular) view.parent becomes undefined)
				if (view.parent) {
					callback(<View>view.parent);
				}
			}
		});
	}

	public _dumpRealizedTemplates() {
		console.log(`Realized Templates:`);
		this._realizedTemplates.forEach((value, index) => {
			console.log(`\t${index}:`);
			value.forEach((value, index) => {
				console.log(`\t\t${index.hashCode()}: ${value}`);
			});
		});
		console.log(`Realized Items Size: ${this._realizedItems.size}`);
	}

	private clearRealizedCells(): void {
		// clear the cache
		this._realizedItems.forEach(({ view }, nativeView) => {
			if (view.parent) {
				// This is to clear the StackLayout that is used to wrap non LayoutBase & ProxyViewContainer instances.
				if (!(view.parent instanceof ListView)) {
					this._removeView(view.parent);
				}
				view.parent._removeView(view);
			}
		});

		this._realizedItems.clear();
		this._availableViews.clear();
		this._realizedTemplates.clear();
	}

	public isItemAtIndexVisible(index: number): boolean {
		const nativeView = this.nativeViewProtected;
		const start = nativeView.getFirstVisiblePosition();
		const end = nativeView.getLastVisiblePosition();

		return index >= start && index <= end;
	}

	[separatorColorProperty.getDefault](): {
		dividerHeight: number;
		divider: android.graphics.drawable.Drawable;
	} {
		const nativeView = this.nativeViewProtected;

		return {
			dividerHeight: nativeView.getDividerHeight(),
			divider: nativeView.getDivider(),
		};
	}
	[separatorColorProperty.setNative](
		value:
			| Color
			| {
					dividerHeight: number;
					divider: android.graphics.drawable.Drawable;
			  },
	) {
		const nativeView = this.nativeViewProtected;
		if (value instanceof Color) {
			nativeView.setDivider(new android.graphics.drawable.ColorDrawable(value.android));
			nativeView.setDividerHeight(1);
		} else {
			nativeView.setDivider(value.divider);
			nativeView.setDividerHeight(value.dividerHeight);
		}
	}

	[itemTemplatesProperty.getDefault](): KeyedTemplate[] {
		return null;
	}
	[itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
		this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
		if (value) {
			this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
		}

		this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		this.refresh();
	}

	// Sticky header property handlers (for now just trigger refresh)
	[stickyHeaderProperty.setNative](value: boolean) {
		// Refresh adapter to handle sectioned vs non-sectioned display
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}
	}

	[stickyHeaderTemplateProperty.setNative](value: string) {
		// Refresh adapter when template changes
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}
	}

	[sectionedProperty.setNative](value: boolean) {
		// Refresh adapter to handle sectioned vs non-sectioned data
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}
	}
}

let ListViewAdapterClass;
function ensureListViewAdapterClass() {
	if (ListViewAdapterClass) {
		return;
	}

	@NativeClass
	class ListViewAdapter extends android.widget.BaseAdapter {
		constructor(public owner: ListView) {
			super();

			return global.__native(this);
		}

		public getCount() {
			if (!this.owner || !this.owner.items) {
				return 0;
			}

			if (this.owner.sectioned) {
				// Count items + section headers
				let totalCount = 0;
				const sectionCount = this.owner._getSectionCount();
				for (let i = 0; i < sectionCount; i++) {
					totalCount += 1; // Section header
					totalCount += this.owner._getItemsInSection(i).length; // Items in section
				}
				return totalCount;
			} else {
				return this.owner.items.length;
			}
		}

		public getItem(i: number) {
			if (!this.owner || !this.owner.items) {
				return null;
			}

			if (this.owner.sectioned) {
				const positionInfo = this._getPositionInfo(i);
				if (positionInfo.isHeader) {
					return this.owner._getSectionData(positionInfo.section);
				} else {
					return this.owner._getDataItemInSection(positionInfo.section, positionInfo.itemIndex);
				}
			} else {
				if (i < this.owner.items.length) {
					const getItem = (<ItemsSource>this.owner.items).getItem;
					return getItem ? getItem.call(this.owner.items, i) : this.owner.items[i];
				}
			}

			return null;
		}

		// Helper method to determine if position is header and get section/item info
		private _getPositionInfo(position: number): { isHeader: boolean; section: number; itemIndex: number } {
			if (!this.owner.sectioned) {
				return { isHeader: false, section: 0, itemIndex: position };
			}

			let currentPosition = 0;
			const sectionCount = this.owner._getSectionCount();

			for (let section = 0; section < sectionCount; section++) {
				// Check if this position is the section header
				if (currentPosition === position) {
					return { isHeader: true, section: section, itemIndex: -1 };
				}
				currentPosition++; // Move past header

				// Check if position is within this section's items
				const itemsInSection = this.owner._getItemsInSection(section).length;
				if (position < currentPosition + itemsInSection) {
					const itemIndex = position - currentPosition;
					return { isHeader: false, section: section, itemIndex: itemIndex };
				}
				currentPosition += itemsInSection; // Move past items
			}

			// Fallback
			return { isHeader: false, section: 0, itemIndex: 0 };
		}

		public getItemId(i: number) {
			const item = this.getItem(i);
			let id = i;
			if (this.owner && item && this.owner.items) {
				id = this.owner.itemIdGenerator(item, i, this.owner.items);
			}

			return long(id);
		}

		public hasStableIds(): boolean {
			return true;
		}

		public getViewTypeCount() {
			let count = this.owner._itemTemplatesInternal.length;

			// Add 1 for header view type when sectioned
			if (this.owner.sectioned && this.owner.stickyHeaderTemplate) {
				count += 1;
			}

			return count;
		}

		public getItemViewType(index: number) {
			if (this.owner.sectioned) {
				const positionInfo = this._getPositionInfo(index);
				if (positionInfo.isHeader) {
					// Header view type is the last index (after all item template types)
					return this.owner._itemTemplatesInternal.length;
				} else {
					// Get template for the actual item
					const template = this.owner._getItemTemplate(positionInfo.itemIndex);
					return this.owner._itemTemplatesInternal.indexOf(template);
				}
			} else {
				const template = this.owner._getItemTemplate(index);
				return this.owner._itemTemplatesInternal.indexOf(template);
			}
		}

		@profile
		public getView(index: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View {
			//this.owner._dumpRealizedTemplates();

			if (!this.owner) {
				return null;
			}

			if (this.owner.sectioned) {
				const positionInfo = this._getPositionInfo(index);

				if (positionInfo.isHeader) {
					// Create section header view
					return this._createHeaderView(positionInfo.section, convertView, parent);
				} else {
					// Create regular item view with adjusted index
					return this._createItemView(positionInfo.section, positionInfo.itemIndex, convertView, parent);
				}
			} else {
				// Non-sectioned - use original logic
				return this._createItemView(0, index, convertView, parent);
			}
		}

		private _createHeaderView(section: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View {
			let headerView: View = null;
			const headerViewType = this.owner._itemTemplatesInternal.length; // Same as getItemViewType for headers

			// Try to reuse convertView if it's the right type
			if (convertView) {
				const existingData = this.owner._realizedItems.get(convertView);
				if (existingData && existingData.templateKey === `header_${headerViewType}`) {
					headerView = existingData.view;
				}
			}

			// Create new header view if we can't reuse
			if (!headerView) {
				if (this.owner.stickyHeaderTemplate) {
					if (typeof this.owner.stickyHeaderTemplate === 'string') {
						try {
							headerView = Builder.parse(this.owner.stickyHeaderTemplate, this.owner);
						} catch (error) {
							// Fallback to simple label
							headerView = new Label();
							(headerView as Label).text = 'Header Error';
						}
					}
				}

				if (!headerView) {
					// Default header
					headerView = new Label();
					(headerView as Label).text = `Section ${section}`;
				}

				// Add to parent and get native view
				if (!headerView.parent) {
					if (headerView instanceof LayoutBase && !(headerView instanceof ProxyViewContainer)) {
						this.owner._addView(headerView);
						convertView = headerView.nativeViewProtected;
					} else {
						const sp = new StackLayout();
						sp.addChild(headerView);
						this.owner._addView(sp);
						convertView = sp.nativeViewProtected;
					}
				}

				// Register the header view for recycling
				this.owner._realizedItems.set(convertView, {
					view: headerView,
					templateKey: `header_${headerViewType}`,
				});
			}

			// Set binding context to section data (always update, even for recycled views)
			const sectionData = this.owner._getSectionData(section);
			if (sectionData) {
				headerView.bindingContext = sectionData;
			} else {
				headerView.bindingContext = { title: `Section ${section}`, section: section };
			}

			return convertView;
		}

		private _createItemView(section: number, itemIndex: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View {
			// Use existing item creation logic but with sectioned data
			const template = this.owner._getItemTemplate(itemIndex);
			let view: View;

			// convertView is of the wrong type
			if (convertView && this.owner._getKeyFromView(convertView) !== template.key) {
				this.owner._markViewUnused(convertView); // release this view
				convertView = this.owner._getAvailableView(template.key); // get a view from the right type or null
			}
			if (convertView) {
				view = this.owner._realizedItems.get(convertView).view;
			}

			if (!view) {
				view = template.createView();
			}

			const args: ItemEventData = {
				eventName: ITEMLOADING,
				object: this.owner,
				index: itemIndex,
				view: view,
				android: parent,
				ios: undefined,
			};

			this.owner.notify(args);

			if (!args.view) {
				args.view = this.owner._getDefaultItemContent(itemIndex);
			}

			if (args.view) {
				if (this.owner._effectiveRowHeight > -1) {
					args.view.height = this.owner.rowHeight;
				} else {
					args.view.height = <CoreTypes.LengthType>unsetValue;
				}

				// Use sectioned item preparation
				if (this.owner.sectioned) {
					this.owner._prepareItemInSection(args.view, section, itemIndex);
				} else {
					this.owner._prepareItem(args.view, itemIndex);
				}

				if (!args.view.parent) {
					// Proxy containers should not get treated as layouts.
					// Wrap them in a real layout as well.
					if (args.view instanceof LayoutBase && !(args.view instanceof ProxyViewContainer)) {
						this.owner._addView(args.view);
						convertView = args.view.nativeViewProtected;
					} else {
						const sp = new StackLayout();
						sp.addChild(args.view);
						this.owner._addView(sp);

						convertView = sp.nativeViewProtected;
					}
				}

				this.owner._registerViewToTemplate(template.key, convertView, args.view);
				this.owner._markViewUsed(convertView);
			}

			return convertView;
		}
	}

	ListViewAdapterClass = ListViewAdapter;
}
