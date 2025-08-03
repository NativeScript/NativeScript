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

	// Sticky header support
	private _stickyHeaderView: View;
	private _stickyHeaderHeight: number = 0;
	private _scrollListener: android.widget.AbsListView.OnScrollListener;
	_hiddenHeaderPositions = new Set<number>(); // Track which headers to hide

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

		// Cleanup sticky header
		this._cleanupStickyHeader();

		this.clearRealizedCells();
		super.disposeNativeView();
	}

	private _cleanupStickyHeader() {
		// Remove scroll listener
		if (this._scrollListener) {
			this.nativeViewProtected.setOnScrollListener(null);
			this._scrollListener = null;
		}

		// Remove sticky header from parent
		if (this._stickyHeaderView && this._stickyHeaderView.parent) {
			this._stickyHeaderView.parent._removeView(this._stickyHeaderView);
		}

		this._stickyHeaderView = null;
		this._stickyHeaderHeight = 0;

		// Clear hidden headers
		this._hiddenHeaderPositions.clear();
	}

	public onLoaded() {
		super.onLoaded();
		// Without this call itemClick won't be fired... :(
		this.requestLayout();

		// Setup sticky header if enabled
		if (this.stickyHeader && this.sectioned && this.stickyHeaderTemplate) {
			this._setupStickyHeader();
		}
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

	// Sticky header methods
	private _setupStickyHeader() {
		if (!this.stickyHeader || !this.sectioned || !this.stickyHeaderTemplate) {
			return;
		}

		// Create the sticky header view
		this._createStickyHeaderView();

		// Add it as an overlay to the parent
		this._addStickyHeaderToParent();

		// Add padding to ListView so content doesn't hide behind sticky header
		this._addListViewPadding();

		// Setup scroll listener to update header content
		this._setupScrollListener();
	}

	private _createStickyHeaderView() {
		if (this._stickyHeaderView) {
			return; // Already created
		}

		// Create header view using the same template as section headers
		if (typeof this.stickyHeaderTemplate === 'string') {
			try {
				this._stickyHeaderView = Builder.parse(this.stickyHeaderTemplate, this);
			} catch (error) {
				// Fallback to simple label
				this._stickyHeaderView = new Label();
				(this._stickyHeaderView as Label).text = 'Header Error';
			}
		}

		if (!this._stickyHeaderView) {
			// Default header
			this._stickyHeaderView = new Label();
			(this._stickyHeaderView as Label).text = 'Section 0';
		}

		// Set initial binding context (section 0)
		this._updateStickyHeader(0);
	}

	private _addStickyHeaderToParent() {
		if (!this._stickyHeaderView || !this.parent) {
			return;
		}

		// Remove from current parent if it has one (likely the ListView from Builder.parse)
		if (this._stickyHeaderView.parent) {
			this._stickyHeaderView.parent._removeView(this._stickyHeaderView);
		}

		// Set proper sizing - don't stretch to fill parent
		this._stickyHeaderView.width = { unit: '%', value: 100 };
		this._stickyHeaderView.height = 'auto'; // Let it size to content
		this._stickyHeaderView.verticalAlignment = 'top';
		this._stickyHeaderView.horizontalAlignment = 'stretch';

		// Add sticky header to the parent layout
		// Position it at the top, overlaying the ListView
		this.parent._addView(this._stickyHeaderView);

		// Make sure it's positioned correctly
		if (this._stickyHeaderView.nativeViewProtected) {
			// Bring to front
			this._stickyHeaderView.nativeViewProtected.setZ(1000);
		}
	}

	private _addListViewPadding() {
		if (!this._stickyHeaderView) {
			return;
		}

		// Apply immediate padding with a reasonable default to prevent content hiding
		const defaultHeaderHeight = 50; // Reasonable default height in dp
		this.nativeViewProtected.setPadding(0, defaultHeaderHeight, 0, 0);
		this._stickyHeaderHeight = defaultHeaderHeight;

		// Request layout to ensure proper measurement
		this._stickyHeaderView.requestLayout();

		// Then measure and adjust padding if needed
		setTimeout(() => {
			if (this._stickyHeaderView) {
				// Get the actual measured height from the native view
				const nativeView = this._stickyHeaderView.nativeViewProtected;
				if (nativeView && nativeView.getMeasuredHeight() > 0) {
					const measuredHeight = nativeView.getMeasuredHeight();
					const paddingHeight = measuredHeight + 4;

					// Only update if significantly different
					if (Math.abs(paddingHeight - this._stickyHeaderHeight) > 5) {
						this._stickyHeaderHeight = paddingHeight;
						this.nativeViewProtected.setPadding(0, paddingHeight, 0, 0);
					}
					this.scrollToIndex(0);
				}
			}
		}, 100); // Slightly longer delay for more reliable measurement
	}

	private _setupScrollListener() {
		if (this._scrollListener) {
			return; // Already setup
		}

		const owner = this;
		this._scrollListener = new android.widget.AbsListView.OnScrollListener({
			onScrollStateChanged(view: android.widget.AbsListView, scrollState: number) {
				// Not needed for sticky headers
			},

			onScroll(view: android.widget.AbsListView, firstVisibleItem: number, visibleItemCount: number, totalItemCount: number) {
				if (owner.sectioned && owner._stickyHeaderView) {
					const currentSection = owner._getCurrentSection(firstVisibleItem);
					owner._updateStickyHeader(currentSection);

					// Hide section headers when they would appear right below sticky header
					owner._updateHiddenHeaders(firstVisibleItem);
				}
			},
		});

		this.nativeViewProtected.setOnScrollListener(this._scrollListener);
	}

	private _getCurrentSection(firstVisibleItem: number): number {
		if (!this.sectioned) {
			return 0;
		}

		// Convert the first visible list position to section number
		let currentPosition = 0;
		const sectionCount = this._getSectionCount();

		for (let section = 0; section < sectionCount; section++) {
			// Check if firstVisibleItem is in this section (header or items)
			const itemsInSection = this._getItemsInSection(section).length;
			const sectionEndPosition = currentPosition + 1 + itemsInSection; // +1 for header

			if (firstVisibleItem < sectionEndPosition) {
				return section;
			}

			currentPosition = sectionEndPosition;
		}

		return Math.max(0, sectionCount - 1); // Fallback to last section
	}

	private _updateStickyHeader(section: number) {
		if (!this._stickyHeaderView) {
			return;
		}

		// Update binding context to match the current section
		const sectionData = this._getSectionData(section);
		if (sectionData) {
			this._stickyHeaderView.bindingContext = sectionData;
		} else {
			this._stickyHeaderView.bindingContext = { title: `Section ${section}`, section: section };
		}
	}

	private _updateHiddenHeaders(firstVisibleItem: number) {
		const previousHiddenHeaders = new Set(this._hiddenHeaderPositions);
		this._hiddenHeaderPositions.clear();

		// If we're at the very top (first item is position 0, which is the first section header),
		// hide that section header to avoid duplication with sticky header
		if (firstVisibleItem === 0) {
			this._hiddenHeaderPositions.add(0); // Hide the first section header position
		}

		// If hidden headers changed, refresh the adapter
		const hiddenHeadersChanged = previousHiddenHeaders.size !== this._hiddenHeaderPositions.size || [...previousHiddenHeaders].some((pos) => !this._hiddenHeaderPositions.has(pos));

		if (hiddenHeadersChanged) {
			// Refresh adapter to update visibility
			const adapter = this.nativeViewProtected.getAdapter();
			if (adapter instanceof android.widget.BaseAdapter) {
				adapter.notifyDataSetChanged();
			}
		}
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

	// Sticky header property handlers
	[stickyHeaderProperty.setNative](value: boolean) {
		// Refresh adapter to handle sectioned vs non-sectioned display
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}

		// Setup or cleanup sticky header
		if (value && this.sectioned && this.stickyHeaderTemplate && this.isLoaded) {
			this._setupStickyHeader();
		} else {
			this._cleanupStickyHeader();
		}
	}

	[stickyHeaderTemplateProperty.setNative](value: string) {
		// Refresh adapter when template changes
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}

		// Recreate sticky header with new template
		this._cleanupStickyHeader();
		if (value && this.stickyHeader && this.sectioned && this.isLoaded) {
			this._setupStickyHeader();
		}
	}

	[sectionedProperty.setNative](value: boolean) {
		// Refresh adapter to handle sectioned vs non-sectioned data
		if (this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
		}

		// Setup or cleanup sticky header based on sectioned state
		if (value && this.stickyHeader && this.stickyHeaderTemplate && this.isLoaded) {
			this._setupStickyHeader();
		} else {
			this._cleanupStickyHeader();
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
					// Create section header view (pass index for hiding logic)
					return this._createHeaderView(positionInfo.section, convertView, parent, index);
				} else {
					// Create regular item view with adjusted index
					return this._createItemView(positionInfo.section, positionInfo.itemIndex, convertView, parent);
				}
			} else {
				// Non-sectioned - use original logic
				return this._createItemView(0, index, convertView, parent);
			}
		}

		private _createHeaderView(section: number, convertView: android.view.View, parent: android.view.ViewGroup, index: number): android.view.View {
			// Check if this header should be hidden to avoid duplication with sticky header
			if (this.owner._hiddenHeaderPositions.has(index)) {
				// Return an empty view with zero height
				const emptyView = new android.view.View(this.owner._context);
				const layoutParams = new android.view.ViewGroup.LayoutParams(
					android.view.ViewGroup.LayoutParams.MATCH_PARENT,
					0, // Zero height
				);
				emptyView.setLayoutParams(layoutParams);
				return emptyView;
			}

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
					// Android ListView doesn't properly respect margins on direct child views.
					// Always wrap item views in a StackLayout container to ensure margins work correctly.
					const container = new StackLayout();
					container.addChild(args.view);
					this.owner._addView(container);
					convertView = container.nativeViewProtected;
				}

				this.owner._registerViewToTemplate(template.key, convertView, args.view);
				this.owner._markViewUsed(convertView);
			}

			return convertView;
		}
	}

	ListViewAdapterClass = ListViewAdapter;
}
