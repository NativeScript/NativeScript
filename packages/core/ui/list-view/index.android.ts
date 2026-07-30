import { ItemEventData, ItemsSource, SearchEventData } from '.';
import { ListViewBase, separatorColorProperty, itemTemplatesProperty, stickyHeaderProperty, stickyHeaderTemplateProperty, stickyHeaderHeightProperty, sectionedProperty, showSearchProperty } from './list-view-common';
import { View, KeyedTemplate } from '../core/view';
import { PercentLength } from '../styling/length-shared';
import { unsetValue } from '../core/properties/property-shared';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { Observable } from '../../data/observable';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { LayoutBase } from '../layouts/layout-base';
import { profile } from '../../profiling';
import { Trace } from '../../trace';
import { Builder } from '../builder';
import { Label } from '../label';

export * from './list-view-common';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const SEARCHCHANGE = ListViewBase.searchChangeEvent;
const STICKY_HEADER_Z_INDEX = 1000;
const SEARCH_VIEW_Z_INDEX = 2000;

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

	// Search functionality
	private _searchView: android.widget.SearchView;
	private _searchListener: android.widget.SearchView.OnQueryTextListener;

	public get hasSearchView(): boolean {
		return !!this._searchView;
	}

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

		// Don't setup search here - wait for onLoaded when context is properly available
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

		// Cleanup search
		this._cleanupSearchView();

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

		// Setup search if enabled and not already set up
		if (this.showSearch && !this._searchView && this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
			this._setupSearchView();
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

		// Safely refresh the adapter - no HeaderViewListAdapter issues since we don't use headers
		const adapter = nativeView.getAdapter();
		if (adapter instanceof android.widget.BaseAdapter) {
			try {
				adapter.notifyDataSetChanged();
			} catch (error) {
				if (Trace.isEnabled()) {
					Trace.error('Error refreshing adapter, recreating: ' + error);
				}
				nativeView.setAdapter(new ListViewAdapterClass(this));
			}
		}
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
		// If search view exists, position sticky header after it (index 1), otherwise at top (index 0)
		const parentLayout = this.parent;
		const hasSearchView = this.showSearch && this._searchView && (this._searchView as any)._wrapper;

		if (parentLayout instanceof StackLayout) {
			const insertIndex = hasSearchView ? 1 : 0;
			parentLayout.insertChild(this._stickyHeaderView, insertIndex);
		} else {
			parentLayout._addView(this._stickyHeaderView);
		}

		// When search is enabled, position sticky header below search view with proper top margin
		if (this.showSearch && this._searchView) {
			// Add top margin to push sticky header below search view
			this._stickyHeaderView.marginTop = 0; // Reset any previous margin

			// Position sticky header with proper offset using native positioning
			if (this._stickyHeaderView.nativeViewProtected) {
				this._stickyHeaderView.nativeViewProtected.setZ(STICKY_HEADER_Z_INDEX);

				// Use a timeout to ensure search view is measured first
				setTimeout(() => {
					if (this._searchView && (this._searchView as any)._wrapper) {
						const searchWrapper = (this._searchView as any)._wrapper;
						if (searchWrapper.nativeViewProtected) {
							const searchHeight = searchWrapper.nativeViewProtected.getMeasuredHeight() || 50;

							// Position sticky header below search view using translation
							if (this._stickyHeaderView.nativeViewProtected) {
								this._stickyHeaderView.nativeViewProtected.setTranslationY(searchHeight);
							}
						}
					}
				}, 100);
			}
		} else {
			// No search view - position at top
			if (this._stickyHeaderView.nativeViewProtected) {
				this._stickyHeaderView.nativeViewProtected.setZ(STICKY_HEADER_Z_INDEX);
				this._stickyHeaderView.nativeViewProtected.setTranslationY(0);
			}
		}
	}

	private _addListViewPadding() {
		if (!this._stickyHeaderView) {
			return;
		}

		// Calculate total top padding: search view height + sticky header height
		let searchViewHeight = 0;
		if (this.showSearch && this._searchView && (this._searchView as any)._wrapper) {
			const searchWrapper = (this._searchView as any)._wrapper;
			if (searchWrapper.nativeViewProtected && searchWrapper.nativeViewProtected.getMeasuredHeight() > 0) {
				searchViewHeight = searchWrapper.nativeViewProtected.getMeasuredHeight();
			} else {
				searchViewHeight = 50; // Default search view height
			}
		}

		// Apply immediate padding with defaults to prevent content hiding
		const defaultHeaderHeight = 50; // Reasonable default height in dp
		const totalPadding = searchViewHeight + defaultHeaderHeight;
		this.nativeViewProtected.setPadding(0, totalPadding, 0, 0);
		this._stickyHeaderHeight = defaultHeaderHeight;

		// Request layout to ensure proper measurement
		this._stickyHeaderView.requestLayout();

		// Then measure and adjust padding if needed using a layout listener for determinism
		const stickyHeaderNativeView = this._stickyHeaderView && this._stickyHeaderView.nativeViewProtected;
		if (stickyHeaderNativeView) {
			const layoutListener = new android.view.View.OnLayoutChangeListener({
				onLayoutChange: (v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) => {
					if (v.getMeasuredHeight() > 0) {
						const measuredHeaderHeight = v.getMeasuredHeight();
						let finalSearchHeight = searchViewHeight;
						// Re-measure search view if needed
						if (this.showSearch && this._searchView && (this._searchView as any)._wrapper) {
							const searchWrapper = (this._searchView as any)._wrapper;
							if (searchWrapper.nativeViewProtected && searchWrapper.nativeViewProtected.getMeasuredHeight() > 0) {
								finalSearchHeight = searchWrapper.nativeViewProtected.getMeasuredHeight();
							}
						}
						// Calculate final padding: search height + sticky header height + small buffer
						const totalPaddingHeight = finalSearchHeight + measuredHeaderHeight + 4;
						this._stickyHeaderHeight = measuredHeaderHeight;
						this.nativeViewProtected.setPadding(0, totalPaddingHeight, 0, 0);
						this.scrollToIndex(0);
						// Remove the listener after first valid layout
						v.removeOnLayoutChangeListener(layoutListener);
					}
				},
			});
			stickyHeaderNativeView.addOnLayoutChangeListener(layoutListener);
		}
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
			const sectionItems = this._getItemsInSection(section) || [];
			const itemsInSection = (sectionItems as any).length || 0;
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

		if (this.nativeViewProtected) {
			this.nativeViewProtected.setAdapter(new ListViewAdapterClass(this));
			this.refresh();
		}
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

	// Search methods
	private _setupSearchView() {
		if (this._searchView || !this.showSearch || !this.nativeViewProtected) {
			return;
		}

		// Create SearchView using the ListView's context
		this._searchView = new android.widget.SearchView(this.nativeViewProtected.getContext());
		this._searchView.setQueryHint('Search...');
		this._searchView.setIconifiedByDefault(false);
		this._searchView.setSubmitButtonEnabled(false);

		// Setup search listener
		const owner = this;
		this._searchListener = new android.widget.SearchView.OnQueryTextListener({
			onQueryTextChange(newText: string): boolean {
				const args: SearchEventData = {
					eventName: SEARCHCHANGE,
					object: owner,
					text: newText,
					android: owner._searchView,
				};
				owner.notify(args);
				return true;
			},

			onQueryTextSubmit(query: string): boolean {
				const args: SearchEventData = {
					eventName: SEARCHCHANGE,
					object: owner,
					text: query,
					android: owner._searchView,
				};
				owner.notify(args);
				return true;
			},
		});

		this._searchView.setOnQueryTextListener(this._searchListener);

		// Add search view to the parent container above the ListView
		this._addSearchToParent();

		// Add padding to ListView if no sticky header (otherwise sticky header method handles it)
		if (!this.stickyHeader || !this._stickyHeaderView) {
			this._addSearchPadding();
		}
	}

	private _addSearchPadding() {
		if (!this._searchView) {
			return;
		}

		// Add basic padding for search view
		const defaultSearchHeight = 50; // Default search view height
		this.nativeViewProtected.setPadding(0, defaultSearchHeight, 0, 0);

		// Measure and adjust if needed
		setTimeout(() => {
			if (this._searchView && (this._searchView as any)._wrapper) {
				const searchWrapper = (this._searchView as any)._wrapper;
				if (searchWrapper.nativeViewProtected && searchWrapper.nativeViewProtected.getMeasuredHeight() > 0) {
					const measuredHeight = searchWrapper.nativeViewProtected.getMeasuredHeight();
					this.nativeViewProtected.setPadding(0, measuredHeight + 4, 0, 0);
				}
			}
		}, 100);
	}

	private _addSearchToParent() {
		if (!this._searchView || !this.parent) {
			return;
		}

		// Get the parent layout
		const parentLayout = this.parent;

		// Create a simple NativeScript wrapper for the native SearchView
		const searchView = this._searchView;
		const searchViewWrapper = new (class extends View {
			createNativeView() {
				return searchView;
			}
		})();

		// Set layout properties - ensure it's at the top
		searchViewWrapper.height = 'auto';
		searchViewWrapper.width = { unit: '%', value: 100 };
		searchViewWrapper.verticalAlignment = 'top';
		searchViewWrapper.horizontalAlignment = 'stretch';

		// Always insert at position 0 (top) regardless of ListView position
		if (parentLayout instanceof StackLayout) {
			parentLayout.insertChild(searchViewWrapper, 0);
		} else {
			// For other layout types, add as first child
			parentLayout._addView(searchViewWrapper);
		}

		// Ensure search view appears above everything else
		if (searchViewWrapper.nativeViewProtected) {
			searchViewWrapper.nativeViewProtected.setZ(SEARCH_VIEW_Z_INDEX);
		}

		// Store reference for cleanup
		(this._searchView as any)._wrapper = searchViewWrapper;
	}

	private _cleanupSearchView() {
		if (this._searchView) {
			// Remove search view wrapper from parent
			const wrapper = (this._searchView as any)._wrapper;
			if (wrapper && wrapper.parent) {
				wrapper.parent._removeView(wrapper);
			}

			// Clear listener
			if (this._searchListener) {
				this._searchView.setOnQueryTextListener(null);
				this._searchListener = null;
			}

			this._searchView = null;

			// Reset ListView padding if no sticky header
			if (!this.stickyHeader || !this._stickyHeaderView) {
				this.nativeViewProtected.setPadding(0, 0, 0, 0);
			}
		}
	}

	[showSearchProperty.setNative](value: boolean) {
		if (value) {
			if (this.isLoaded && this.nativeViewProtected && this.nativeViewProtected.getAdapter()) {
				this._setupSearchView();

				// Reposition sticky header if it exists
				if (this._stickyHeaderView) {
					this._repositionStickyHeader();
				}
			}
		} else {
			this._cleanupSearchView();

			// Reposition sticky header if it exists
			if (this._stickyHeaderView) {
				this._repositionStickyHeader();
			}
		}
	}

	private _repositionStickyHeader() {
		if (!this._stickyHeaderView || !this._stickyHeaderView.nativeViewProtected) {
			return;
		}

		// Reset positioning
		this._stickyHeaderView.nativeViewProtected.setTranslationY(0);

		// If search is enabled, position below search view
		if (this.showSearch && this._searchView && (this._searchView as any)._wrapper) {
			setTimeout(() => {
				const searchWrapper = (this._searchView as any)._wrapper;
				if (searchWrapper.nativeViewProtected) {
					const searchHeight = searchWrapper.nativeViewProtected.getMeasuredHeight() || 50;
					this._stickyHeaderView.nativeViewProtected.setTranslationY(searchHeight);
				}
			}, 100);
		}

		// Update ListView padding
		if (this.stickyHeader && this._stickyHeaderView) {
			this._addListViewPadding();
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
			if (!this.owner) {
				return 0;
			}

			// Ensure we always have at least the items array length, even if empty
			let count = 0;

			if (this.owner.sectioned) {
				// If items are not ready, report 0 to avoid early crashes
				const sectionCount = this.owner._getSectionCount();
				if (!this.owner.items || sectionCount <= 0) {
					return 0;
				}

				// Count items + section headers
				for (let i = 0; i < sectionCount; i++) {
					const itemsInSection = this.owner._getItemsInSection(i) || [];
					// Only add header if section has items
					if ((itemsInSection as any).length > 0) {
						count += 1; // Section header
						count += (itemsInSection as any).length; // Items in section
					}
				}
			} else {
				const src: any = this.owner.items as any;
				count = src && typeof src.length === 'number' ? src.length : 0;
			}

			// Return the count, ensuring it's never negative
			return Math.max(0, count);
		}

		public getItem(i: number) {
			if (!this.owner || !this.owner.items) {
				return null;
			}

			// Safety check for index bounds
			const totalCount = this.getCount();
			if (i < 0 || i >= totalCount) {
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
				const src: any = this.owner.items as any;
				if (src && typeof src.length === 'number' && i < src.length) {
					const getItem = (<ItemsSource>src).getItem;
					return getItem ? getItem.call(src, i) : src[i];
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
				const itemsInSection = this.owner._getItemsInSection(section) || [];

				// Skip sections with no items (they won't have headers in our count)
				if ((itemsInSection as any).length === 0) {
					continue;
				}

				// Check if this position is the section header
				if (currentPosition === position) {
					return { isHeader: true, section: section, itemIndex: -1 };
				}
				currentPosition++; // Move past header

				// Check if position is within this section's items
				if (position < currentPosition + (itemsInSection as any).length) {
					const itemIndex = position - currentPosition;
					return { isHeader: false, section: section, itemIndex: itemIndex };
				}
				currentPosition += (itemsInSection as any).length; // Move past items
			}

			// Fallback - should not reach here with proper bounds checking
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

		public isEnabled(position: number): boolean {
			// Safety check to prevent crashes when adapter is empty
			const totalCount = this.getCount();
			if (totalCount === 0 || position < 0 || position >= totalCount) {
				return false;
			}

			// For sectioned lists, check if this is a header position
			if (this.owner.sectioned) {
				const positionInfo = this._getPositionInfo(position);
				// Headers are typically not clickable, items are
				return !positionInfo.isHeader;
			}

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

			// Safety check for empty adapter
			const totalCount = this.getCount();
			if (index < 0 || index >= totalCount) {
				// Return a minimal empty view to prevent crashes
				const emptyView = new android.view.View(this.owner._context);
				const layoutParams = new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, 0);
				emptyView.setLayoutParams(layoutParams);
				return emptyView;
			}

			// Trigger loadMoreItems when binding the last visible row (matches prior Android behavior)
			if (index === totalCount - 1) {
				this.owner.notify({
					eventName: LOADMOREITEMS,
					object: this.owner,
				});
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

			if (this.owner.sectioned) {
				(args as any).section = section;
			}

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

				if (this.owner.sectioned) {
					(args.view as any)._listViewItemIndex = itemIndex;
					(args.view as any)._listViewSectionIndex = section;
				}

				// Use sectioned item preparation
				if (this.owner.sectioned) {
					this.owner._prepareItemInSection(args.view, section, itemIndex);
				} else {
					this.owner._prepareItem(args.view, itemIndex);
				}

				if (!args.view.parent) {
					// Ensure margins defined on the template root are honored on Android ListView.
					// ListView's children don't support layout margins, so we insert an outer wrapper
					// and keep the original view (with its margins) inside. This mirrors iOS spacing.

					// If the view is already a LayoutBase (typical for templates like GridLayout),
					// we wrap it so its margins take effect. For non-layout roots (labels, etc.)
					// we already wrap below with a StackLayout.
					if (args.view instanceof LayoutBase && !(args.view instanceof ProxyViewContainer)) {
						const mt = PercentLength.toDevicePixels(args.view.marginTop, 0, Number.NaN);
						const mb = PercentLength.toDevicePixels(args.view.marginBottom, 0, Number.NaN);
						const ml = PercentLength.toDevicePixels(args.view.marginLeft, 0, Number.NaN);
						const mr = PercentLength.toDevicePixels(args.view.marginRight, 0, Number.NaN);
						const hasMargins = mt > 0 || mb > 0 || ml > 0 || mr > 0;
						if (hasMargins) {
							const outer = new StackLayout();
							outer.addChild(args.view);
							this.owner._addView(outer);
							convertView = outer.nativeViewProtected;
						} else {
							this.owner._addView(args.view);
							convertView = args.view.nativeViewProtected;
						}
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
