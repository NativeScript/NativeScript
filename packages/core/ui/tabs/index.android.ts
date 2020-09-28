// Types
import { TabContentItem } from '../tab-navigation-base/tab-content-item';
import { TabStrip } from '../tab-navigation-base/tab-strip';
import { TabStripItem } from '../tab-navigation-base/tab-strip-item';
import { TextTransform } from '../text-base';

// Requires
import * as application from '../../application';
import { ImageSource } from '../../image-source';
import { ad, isFontIconURI, layout, RESOURCE_PREFIX } from '../../utils/utils';
import { Color } from '../../color';
import { Frame } from '../frame';
import { Font } from '../styling/font';
import { getIconSpecSize, itemsProperty, selectedIndexProperty, tabStripProperty } from '../tab-navigation-base/tab-navigation-base';
import { getTransformedText } from '../text-base';
import { offscreenTabLimitProperty, swipeEnabledProperty, animationEnabledProperty, TabsBase } from './tabs-common';

export * from './tabs-common';

const ACCENT_COLOR = 'colorAccent';
const PRIMARY_COLOR = 'colorPrimary';
const DEFAULT_ELEVATION = 4;

const TABID = '_tabId';
const INDEX = '_index';

interface PagerAdapter {
	new (owner: Tabs): androidx.viewpager.widget.PagerAdapter;
}

let PagerAdapter: PagerAdapter;
let TabsBar: any;
let appResources: android.content.res.Resources;

function makeFragmentName(viewId: number, id: number): string {
	return 'android:viewpager:' + viewId + ':' + id;
}

function getTabById(id: number): Tabs {
	const ref = tabs.find((ref) => {
		const tab = ref.get();

		return tab && tab._domId === id;
	});

	return ref && ref.get();
}

function initializeNativeClasses() {
	if (PagerAdapter) {
		return;
	}

	@NativeClass
	class TabFragmentImplementation extends org.nativescript.widgets.FragmentBase {
		private owner: Tabs;
		private index: number;
		private backgroundBitmap: android.graphics.Bitmap = null;

		constructor() {
			super();

			return global.__native(this);
		}

		static newInstance(tabId: number, index: number): TabFragmentImplementation {
			const args = new android.os.Bundle();
			args.putInt(TABID, tabId);
			args.putInt(INDEX, index);
			const fragment = new TabFragmentImplementation();
			fragment.setArguments(args);

			return fragment;
		}

		public onCreate(savedInstanceState: android.os.Bundle): void {
			super.onCreate(savedInstanceState);
			const args = this.getArguments();
			this.owner = getTabById(args.getInt(TABID));
			this.index = args.getInt(INDEX);
			if (!this.owner) {
				throw new Error(`Cannot find TabView`);
			}
		}

		public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
			const tabItem = this.owner.items[this.index];

			return tabItem.nativeViewProtected;
		}

		public onDestroyView() {
			const hasRemovingParent = this.getRemovingParentFragment();

			// Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
			// TODO: Consider removing it when update to androidx.fragment:1.2.0
			if (hasRemovingParent && this.owner.selectedIndex === this.index) {
				const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(appResources, this.backgroundBitmap);
				this.owner._originalBackground = this.owner.backgroundColor || new Color('White');
				this.owner.nativeViewProtected.setBackgroundDrawable(bitmapDrawable);
				this.backgroundBitmap = null;
			}

			super.onDestroyView();
		}

		public onPause(): void {
			const hasRemovingParent = this.getRemovingParentFragment();

			// Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
			// TODO: Consider removing it when update to androidx.fragment:1.2.0
			if (hasRemovingParent && this.owner.selectedIndex === this.index) {
				this.backgroundBitmap = this.loadBitmapFromView(this.owner.nativeViewProtected);
			}

			super.onPause();
		}

		private loadBitmapFromView(view: android.view.View): android.graphics.Bitmap {
			// Another way to get view bitmap. Test performance vs setDrawingCacheEnabled
			// const width = view.getWidth();
			// const height = view.getHeight();
			// const bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
			// const canvas = new android.graphics.Canvas(bitmap);
			// view.layout(0, 0, width, height);
			// view.draw(canvas);

			view.setDrawingCacheEnabled(true);
			const bitmap = android.graphics.Bitmap.createBitmap(view.getDrawingCache());
			view.setDrawingCacheEnabled(false);

			return bitmap;
		}
	}

	const POSITION_UNCHANGED = -1;
	const POSITION_NONE = -2;

	@NativeClass
	class FragmentPagerAdapter extends androidx.viewpager.widget.PagerAdapter {
		public items: Array<TabContentItem>;
		private mCurTransaction: androidx.fragment.app.FragmentTransaction;
		private mCurrentPrimaryItem: androidx.fragment.app.Fragment;

		constructor(public owner: Tabs) {
			super();

			return global.__native(this);
		}

		getCount() {
			const items = this.items;

			return items ? items.length : 0;
		}

		getPageTitle(index: number) {
			const items = this.items;
			if (index < 0 || index >= items.length) {
				return '';
			}

			return ''; // items[index].title;
		}

		startUpdate(container: android.view.ViewGroup): void {
			if (container.getId() === android.view.View.NO_ID) {
				throw new Error(`ViewPager with adapter ${this} requires a view containerId`);
			}
		}

		instantiateItem(container: android.view.ViewGroup, position: number): java.lang.Object {
			const fragmentManager = this.owner._getFragmentManager();
			if (!this.mCurTransaction) {
				this.mCurTransaction = fragmentManager.beginTransaction();
			}

			const itemId = this.getItemId(position);
			const name = makeFragmentName(container.getId(), itemId);

			let fragment: androidx.fragment.app.Fragment = fragmentManager.findFragmentByTag(name);
			if (fragment != null) {
				this.mCurTransaction.attach(fragment);
			} else {
				fragment = TabFragmentImplementation.newInstance(this.owner._domId, position);
				this.mCurTransaction.add(container.getId(), fragment, name);
			}

			if (fragment !== this.mCurrentPrimaryItem) {
				fragment.setMenuVisibility(false);
				fragment.setUserVisibleHint(false);
			}

			const tabItems = this.owner.items;
			const tabItem = tabItems ? tabItems[position] : null;
			if (tabItem) {
				tabItem.canBeLoaded = true;
			}

			return fragment;
		}

		getItemPosition(object: java.lang.Object): number {
			return this.items ? POSITION_UNCHANGED : POSITION_NONE;
		}

		destroyItem(container: android.view.ViewGroup, position: number, object: java.lang.Object): void {
			if (!this.mCurTransaction) {
				const fragmentManager = this.owner._getFragmentManager();
				this.mCurTransaction = fragmentManager.beginTransaction();
			}

			const fragment: androidx.fragment.app.Fragment = <androidx.fragment.app.Fragment>object;
			this.mCurTransaction.detach(fragment);

			if (this.mCurrentPrimaryItem === fragment) {
				this.mCurrentPrimaryItem = null;
			}

			const tabItems = this.owner.items;
			const tabItem = tabItems ? tabItems[position] : null;
			if (tabItem) {
				tabItem.canBeLoaded = false;
			}
		}

		setPrimaryItem(container: android.view.ViewGroup, position: number, object: java.lang.Object): void {
			const fragment = <androidx.fragment.app.Fragment>object;
			if (fragment !== this.mCurrentPrimaryItem) {
				if (this.mCurrentPrimaryItem != null) {
					this.mCurrentPrimaryItem.setMenuVisibility(false);
					this.mCurrentPrimaryItem.setUserVisibleHint(false);
				}

				if (fragment != null) {
					fragment.setMenuVisibility(true);
					fragment.setUserVisibleHint(true);
				}

				this.mCurrentPrimaryItem = fragment;
				this.owner.selectedIndex = position;

				const tab = this.owner;
				const tabItems = tab.items;
				const newTabItem = tabItems ? tabItems[position] : null;

				if (newTabItem) {
					tab._loadUnloadTabItems(tab.selectedIndex);
				}
			}
		}

		finishUpdate(container: android.view.ViewGroup): void {
			this._commitCurrentTransaction();
		}

		isViewFromObject(view: android.view.View, object: java.lang.Object): boolean {
			return (<androidx.fragment.app.Fragment>object).getView() === view;
		}

		saveState(): android.os.Parcelable {
			// Commit the current transaction on save to prevent "No view found for id 0xa" exception on restore.
			// Related to: https://github.com/NativeScript/NativeScript/issues/6466
			this._commitCurrentTransaction();

			return null;
		}

		restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader): void {
			//
		}

		getItemId(position: number): number {
			return position;
		}

		private _commitCurrentTransaction() {
			if (this.mCurTransaction != null) {
				this.mCurTransaction.commitNowAllowingStateLoss();
				this.mCurTransaction = null;
			}
		}
	}

	@NativeClass
	class TabsBarImplementation extends org.nativescript.widgets.TabsBar {
		constructor(context: android.content.Context, public owner: Tabs) {
			super(context);

			return global.__native(this);
		}

		public onSelectedPositionChange(position: number, prevPosition: number): void {
			const owner = this.owner;
			if (!owner) {
				return;
			}

			const tabStripItems = owner.tabStrip && owner.tabStrip.items;

			if (position >= 0 && tabStripItems && tabStripItems[position]) {
				tabStripItems[position]._emit(TabStripItem.selectEvent);
				owner._setItemColor(tabStripItems[position]);
			}

			if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
				tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
				owner._setItemColor(tabStripItems[prevPosition]);
			}
		}

		public onTap(position: number): boolean {
			const owner = this.owner;
			if (!owner) {
				return false;
			}

			const tabStrip = owner.tabStrip;
			const tabStripItems = tabStrip && tabStrip.items;

			if (position >= 0 && tabStripItems[position]) {
				tabStripItems[position]._emit(TabStripItem.tapEvent);
				tabStrip.notify({
					eventName: TabStrip.itemTapEvent,
					object: tabStrip,
					index: position,
				});
			}

			if (!owner.items[position]) {
				return false;
			}

			return true;
		}
	}

	PagerAdapter = FragmentPagerAdapter;
	TabsBar = TabsBarImplementation;
	appResources = application.android.context.getResources();
}

let defaultAccentColor: number = undefined;
function getDefaultAccentColor(context: android.content.Context): number {
	if (defaultAccentColor === undefined) {
		//Fallback color: https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
		defaultAccentColor = ad.resources.getPaletteColor(ACCENT_COLOR, context) || 0xff33b5e5;
	}

	return defaultAccentColor;
}

function setElevation(grid: org.nativescript.widgets.GridLayout, tabsBar: org.nativescript.widgets.TabsBar, tabsPosition: string) {
	const compat = <any>androidx.core.view.ViewCompat;
	if (compat.setElevation) {
		const val = DEFAULT_ELEVATION * layout.getDisplayDensity();

		if (tabsPosition === 'top') {
			compat.setElevation(grid, val);
		}

		compat.setElevation(tabsBar, val);
	}
}

export const tabs = new Array<WeakRef<Tabs>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
	const rangeStart = Math.max(0, index - eps);
	const rangeEnd = Math.min(index + eps, lastIndex);
	for (let i = rangeStart; i <= rangeEnd; i++) {
		callback(i);
	}
}

export class Tabs extends TabsBase {
	private _tabsBar: org.nativescript.widgets.TabsBar;
	private _viewPager: androidx.viewpager.widget.ViewPager;
	private _pagerAdapter: androidx.viewpager.widget.PagerAdapter;
	private _androidViewId: number = -1;
	public _originalBackground: any;
	private _textTransform: TextTransform = 'uppercase';
	private _selectedItemColor: Color;
	private _unSelectedItemColor: Color;
	public animationEnabled: boolean;

	constructor() {
		super();
		tabs.push(new WeakRef(this));
	}

	get _hasFragments(): boolean {
		return true;
	}

	public onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void {
		super.onItemsChanged(oldItems, newItems);

		if (oldItems) {
			oldItems.forEach((item: TabContentItem, i, arr) => {
				(<any>item).index = 0;
				(<any>item).tabItemSpec = null;
				item.setNativeView(null);
			});
		}
	}

	public createNativeView() {
		initializeNativeClasses();
		// TODO
		// if (Trace.isEnabled()) {
		//     Trace.write("TabView._createUI(" + this + ");", traceCategory);
		// }

		const context: android.content.Context = this._context;
		const nativeView = new org.nativescript.widgets.GridLayout(context);
		const viewPager = new org.nativescript.widgets.TabViewPager(context);
		const tabsBar = new TabsBar(context, this);
		const lp = new org.nativescript.widgets.CommonLayoutParams();
		const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
		let accentColor = getDefaultAccentColor(context);

		lp.row = 1;

		if (this.tabsPosition === 'top') {
			nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
			nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

			viewPager.setLayoutParams(lp);
		} else {
			nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
			nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

			tabsBar.setLayoutParams(lp);
		}

		nativeView.addView(viewPager);
		(<any>nativeView).viewPager = viewPager;

		const adapter = new PagerAdapter(this);
		viewPager.setAdapter(adapter);
		(<any>viewPager).adapter = adapter;

		nativeView.addView(tabsBar);
		(<any>nativeView).tabsBar = tabsBar;

		setElevation(nativeView, tabsBar, this.tabsPosition);

		if (accentColor) {
			tabsBar.setSelectedIndicatorColors([accentColor]);
		}

		if (primaryColor) {
			tabsBar.setBackgroundColor(primaryColor);
		}

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();
		if (this._androidViewId < 0) {
			this._androidViewId = android.view.View.generateViewId();
		}

		const nativeView: any = this.nativeViewProtected;
		this._tabsBar = (<any>nativeView).tabsBar;

		const viewPager = (<any>nativeView).viewPager;
		viewPager.setId(this._androidViewId);
		this._viewPager = viewPager;
		this._pagerAdapter = (<any>viewPager).adapter;
		(<any>this._pagerAdapter).owner = this;
	}

	public _loadUnloadTabItems(newIndex: number) {
		const items = this.items;
		if (!items) {
			return;
		}

		const lastIndex = items.length - 1;
		const offsideItems = this.offscreenTabLimit;

		let toUnload = [];
		let toLoad = [];

		iterateIndexRange(newIndex, offsideItems, lastIndex, (i) => toLoad.push(i));

		items.forEach((item, i) => {
			const indexOfI = toLoad.indexOf(i);
			if (indexOfI < 0) {
				toUnload.push(i);
			}
		});

		toUnload.forEach((index) => {
			const item = items[index];
			if (items[index]) {
				item.unloadView(item.content);
			}
		});

		const newItem = items[newIndex];
		const selectedView = newItem && newItem.content;
		if (selectedView instanceof Frame) {
			(<Frame>selectedView)._pushInFrameStackRecursive();
		}

		toLoad.forEach((index) => {
			const item = items[index];
			if (this.isLoaded && items[index]) {
				item.loadView(item.content);
			}
		});
	}

	public onLoaded(): void {
		super.onLoaded();

		if (this._originalBackground) {
			this.backgroundColor = null;
			this.backgroundColor = this._originalBackground;
			this._originalBackground = null;
		}

		this.setItems(<any>this.items);

		if (this.tabStrip) {
			this.setTabStripItems(this.tabStrip.items);
		}

		// this.setAdapterItems(this.items);
	}

	public onUnloaded(): void {
		super.onUnloaded();

		this.setItems(null);
		this.setTabStripItems(null);

		// this.setAdapterItems(null);
	}

	public disposeNativeView() {
		this._tabsBar.setItems(null, null);
		(<any>this._pagerAdapter).owner = null;
		this._pagerAdapter = null;

		this._tabsBar = null;
		this._viewPager = null;
		super.disposeNativeView();
	}

	public _onRootViewReset(): void {
		super._onRootViewReset();

		// call this AFTER the super call to ensure descendants apply their rootview-reset logic first
		// i.e. in a scenario with tab frames let the frames cleanup their fragments first, and then
		// cleanup the tab fragments to avoid
		// android.content.res.Resources$NotFoundException: Unable to find resource ID #0xfffffff6
		this.disposeCurrentFragments();
	}

	private disposeCurrentFragments(): void {
		const fragmentManager = this._getFragmentManager();
		const transaction = fragmentManager.beginTransaction();
		let fragments = <Array<any>>fragmentManager.getFragments().toArray();
		for (let i = 0; i < fragments.length; i++) {
			transaction.remove(fragments[i]);
		}
		transaction.commitNowAllowingStateLoss();
	}

	private shouldUpdateAdapter(items: Array<TabContentItem>) {
		if (!this._pagerAdapter) {
			return false;
		}

		const currentPagerAdapterItems = (<any>this._pagerAdapter).items;

		// if both values are null, should not update
		if (!items && !currentPagerAdapterItems) {
			return false;
		}

		// if one value is null, should update
		if (!items || !currentPagerAdapterItems) {
			return true;
		}

		// if both are Arrays but length doesn't match, should update
		if (items.length !== currentPagerAdapterItems.length) {
			return true;
		}

		const matchingItems = currentPagerAdapterItems.filter((currentItem) => {
			return !!items.filter((item) => {
				return item._domId === currentItem._domId;
			})[0];
		});

		// if both are Arrays and length matches, but not all items are the same, should update
		if (matchingItems.length !== items.length) {
			return true;
		}

		// if both are Arrays and length matches and all items are the same, should not update
		return false;
	}

	private setItems(items: Array<TabContentItem>) {
		if (this.shouldUpdateAdapter(items)) {
			(<any>this._pagerAdapter).items = items;

			if (items && items.length) {
				items.forEach((item: TabContentItem, i) => {
					(<any>item).index = i;
				});
			}

			this._pagerAdapter.notifyDataSetChanged();
		}
	}

	private setTabStripItems(items: Array<TabStripItem>) {
		const length = items ? items.length : 0;
		if (length === 0) {
			this._tabsBar.setItems(null, null);

			return;
		}

		const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
		items.forEach((tabStripItem: TabStripItem, i, arr) => {
			tabStripItem._index = i;
			const tabItemSpec = this.createTabItemSpec(tabStripItem);
			(<any>tabStripItem).tabItemSpec = tabItemSpec;
			tabItems.push(tabItemSpec);
		});

		const tabsBar = this._tabsBar;
		tabsBar.setItems(tabItems, this._viewPager);
		this.tabStrip.setNativeView(tabsBar);
		items.forEach((item, i, arr) => {
			const tv = tabsBar.getTextViewForItemAt(i);
			item.setNativeView(tv);
			this._setItemColor(item);
		});
	}

	private getItemLabelTextTransform(tabStripItem: TabStripItem): TextTransform {
		const nestedLabel = tabStripItem.label;
		let textTransform: TextTransform = null;
		if (nestedLabel && nestedLabel.style.textTransform !== 'initial') {
			textTransform = nestedLabel.style.textTransform;
		} else if (tabStripItem.style.textTransform !== 'initial') {
			textTransform = tabStripItem.style.textTransform;
		}

		return textTransform || this._textTransform;
	}

	private createTabItemSpec(tabStripItem: TabStripItem): org.nativescript.widgets.TabItemSpec {
		const tabItemSpec = new org.nativescript.widgets.TabItemSpec();

		if (tabStripItem.isLoaded) {
			const nestedLabel = tabStripItem.label;
			let title = nestedLabel.text;

			// TEXT-TRANSFORM
			const textTransform = this.getItemLabelTextTransform(tabStripItem);
			title = getTransformedText(title, textTransform);
			tabItemSpec.title = title;

			// BACKGROUND-COLOR
			const backgroundColor = tabStripItem.style.backgroundColor;
			tabItemSpec.backgroundColor = backgroundColor ? backgroundColor.android : this.getTabBarBackgroundArgbColor();

			// COLOR
			let itemColor = this.selectedIndex === tabStripItem._index ? this._selectedItemColor : this._unSelectedItemColor;
			const color = itemColor || nestedLabel.style.color;
			tabItemSpec.color = color && color.android;

			// FONT
			const fontInternal = nestedLabel.style.fontInternal;
			if (fontInternal) {
				tabItemSpec.fontSize = fontInternal.fontSize;
				tabItemSpec.typeFace = fontInternal.getAndroidTypeface();
			}

			// ICON
			const iconSource = tabStripItem.image && tabStripItem.image.src;
			if (iconSource) {
				const icon = this.getIcon(tabStripItem, itemColor);

				if (icon) {
					// TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
					// tslint:disable-next-line:deprecation
					tabItemSpec.iconDrawable = icon;
				} else {
					// TODO:
					// traceMissingIcon(iconSource);
				}
			}
		}

		return tabItemSpec;
	}

	private getIcon(tabStripItem: TabStripItem, color?: Color): android.graphics.drawable.BitmapDrawable {
		const iconSource = tabStripItem.image && tabStripItem.image.src;
		if (!iconSource) {
			return null;
		}

		let is: ImageSource;
		if (isFontIconURI(iconSource)) {
			const fontIconCode = iconSource.split('//')[1];
			const target = tabStripItem.image ? tabStripItem.image : tabStripItem;
			const font = target.style.fontInternal;
			if (!color) {
				color = target.style.color;
			}
			is = ImageSource.fromFontIconCodeSync(fontIconCode, font, color);
		} else {
			is = ImageSource.fromFileOrResourceSync(iconSource);
		}

		let imageDrawable: android.graphics.drawable.BitmapDrawable;
		if (is && is.android) {
			let image = is.android;

			if (this.tabStrip && this.tabStrip.isIconSizeFixed) {
				image = this.getFixedSizeIcon(image);
			}

			imageDrawable = new android.graphics.drawable.BitmapDrawable(appResources, image);
		} else {
			// TODO
			// traceMissingIcon(iconSource);
		}

		return imageDrawable;
	}

	private getFixedSizeIcon(image: android.graphics.Bitmap): android.graphics.Bitmap {
		const inWidth = image.getWidth();
		const inHeight = image.getHeight();

		const iconSpecSize = getIconSpecSize({ width: inWidth, height: inHeight });

		const widthPixels = iconSpecSize.width * layout.getDisplayDensity();
		const heightPixels = iconSpecSize.height * layout.getDisplayDensity();

		const scaledImage = android.graphics.Bitmap.createScaledBitmap(image, widthPixels, heightPixels, true);

		return scaledImage;
	}

	// private setAdapterItems(items: Array<TabStripItem>) {
	//     if (this.shouldUpdateAdapter(items)) {
	//         (<any>this._pagerAdapter).items = items;

	//         const length = items ? items.length : 0;
	//         if (length === 0) {
	//             this._tabLayout.setItems(null, null);
	//             this._pagerAdapter.notifyDataSetChanged();
	//             return;
	//         }

	//         const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
	//         items.forEach((item: TabStripItem, i, arr) => {
	//             const tabItemSpec = createTabItemSpec(item);
	//             (<any>item).index = i;
	//             (<any>item).tabItemSpec = tabItemSpec;
	//             tabItems.push(tabItemSpec);
	//         });

	//         const tabLayout = this._tabLayout;
	//         tabLayout.setItems(tabItems, this._viewPager);
	//         items.forEach((item, i, arr) => {
	//             const tv = tabLayout.getTextViewForItemAt(i);
	//             item.setNativeView(tv);
	//         });

	//         this._pagerAdapter.notifyDataSetChanged();
	//     }
	// }

	public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
		this._tabsBar.updateItemAt(index, spec);
	}

	public getTabBarBackgroundColor(): android.graphics.drawable.Drawable {
		return this._tabsBar.getBackground();
	}

	public setTabBarBackgroundColor(value: android.graphics.drawable.Drawable | Color): void {
		if (value instanceof Color) {
			this._tabsBar.setBackgroundColor(value.android);
		} else {
			this._tabsBar.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources()));
		}

		this.updateTabStripItems();
	}

	private updateTabStripItems(): void {
		this.tabStrip.items.forEach((tabStripItem: TabStripItem) => {
			if (tabStripItem.nativeView) {
				const tabItemSpec = this.createTabItemSpec(tabStripItem);
				this.updateAndroidItemAt(tabStripItem._index, tabItemSpec);
			}
		});
	}

	public getTabBarHighlightColor(): number {
		return getDefaultAccentColor(this._context);
	}

	public setTabBarHighlightColor(value: number | Color) {
		const color = value instanceof Color ? value.android : value;
		this._tabsBar.setSelectedIndicatorColors([color]);
	}

	private setItemsColors(items: Array<TabStripItem>): void {
		items.forEach((item) => {
			if (item.nativeView) {
				this._setItemColor(item);
			}
		});
	}

	public getTabBarSelectedItemColor(): Color {
		return this._selectedItemColor;
	}

	public setTabBarSelectedItemColor(value: Color) {
		this._selectedItemColor = value;
		this.setItemsColors(this.tabStrip.items);
	}

	public getTabBarUnSelectedItemColor(): Color {
		return this._unSelectedItemColor;
	}

	public setTabBarUnSelectedItemColor(value: Color) {
		this._unSelectedItemColor = value;
		this.setItemsColors(this.tabStrip.items);
	}

	private updateItem(tabStripItem: TabStripItem): void {
		// TODO: Should figure out a way to do it directly with the the nativeView
		const tabStripItemIndex = this.tabStrip.items.indexOf(tabStripItem);
		const tabItemSpec = this.createTabItemSpec(tabStripItem);
		this.updateAndroidItemAt(tabStripItemIndex, tabItemSpec);
	}

	public setTabBarItemTitle(tabStripItem: TabStripItem, value: string): void {
		this.updateItem(tabStripItem);
	}

	public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: android.graphics.drawable.Drawable | Color): void {
		this.updateItem(tabStripItem);
	}

	public _setItemColor(tabStripItem: TabStripItem) {
		const itemColor = tabStripItem._index === this.selectedIndex ? this._selectedItemColor : this._unSelectedItemColor;
		if (!itemColor) {
			return;
		}

		// set label color
		tabStripItem.nativeViewProtected.setTextColor(itemColor.android);

		// set icon color
		this.setIconColor(tabStripItem, itemColor);
	}

	private setIconColor(tabStripItem: TabStripItem, color?: Color) {
		const tabBarItem = this._tabsBar.getViewForItemAt(tabStripItem._index);

		const drawable = this.getIcon(tabStripItem, color);
		const imgView = <android.widget.ImageView>tabBarItem.getChildAt(0);
		imgView.setImageDrawable(drawable);
		if (color) {
			imgView.setColorFilter(color.android);
		}
	}

	public setTabBarItemColor(tabStripItem: TabStripItem, value: number | Color): void {
		const itemColor = tabStripItem._index === this.selectedIndex ? this._selectedItemColor : this._unSelectedItemColor;
		if (itemColor) {
			// the itemColor is set through the selectedItemColor and unSelectedItemColor properties
			// so it does not respect the css color
			return;
		}

		const androidColor = value instanceof Color ? value.android : value;
		tabStripItem.nativeViewProtected.setTextColor(androidColor);
	}

	public setTabBarIconColor(tabStripItem: TabStripItem, value: number | Color): void {
		const itemColor = tabStripItem._index === this.selectedIndex ? this._selectedItemColor : this._unSelectedItemColor;
		if (itemColor) {
			// the itemColor is set through the selectedItemColor and unSelectedItemColor properties
			// so it does not respect the css color
			return;
		}

		this.setIconColor(tabStripItem);
	}

	public setTabBarIconSource(tabStripItem: TabStripItem, value: number | Color): void {
		this.updateItem(tabStripItem);
	}

	public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: Font): void {
		if (value.fontSize) {
			tabStripItem.nativeViewProtected.setTextSize(value.fontSize);
		}
		tabStripItem.nativeViewProtected.setTypeface(value.getAndroidTypeface());
	}

	public getTabBarItemTextTransform(tabStripItem: TabStripItem): TextTransform {
		return this.getItemLabelTextTransform(tabStripItem);
	}

	public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: TextTransform): void {
		const nestedLabel = tabStripItem.label;
		const title = getTransformedText(nestedLabel.text, value);
		tabStripItem.nativeViewProtected.setText(title);
	}

	public getTabBarTextTransform(): TextTransform {
		return this._textTransform;
	}

	public setTabBarTextTransform(value: TextTransform): void {
		let items = this.tabStrip && this.tabStrip.items;
		if (items) {
			items.forEach((tabStripItem) => {
				if (tabStripItem.label && tabStripItem.nativeViewProtected) {
					const nestedLabel = tabStripItem.label;
					const title = getTransformedText(nestedLabel.text, value);
					tabStripItem.nativeViewProtected.setText(title);
				}
			});
		}
		this._textTransform = value;
	}

	[selectedIndexProperty.setNative](value: number) {
		// TODO
		// if (Trace.isEnabled()) {
		//     Trace.write("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
		// }
		this._viewPager.setCurrentItem(value, this.animationEnabled);
	}

	[itemsProperty.getDefault](): TabContentItem[] {
		return null;
	}
	[itemsProperty.setNative](value: TabContentItem[]) {
		this.setItems(value);
		selectedIndexProperty.coerce(this);
	}

	[tabStripProperty.getDefault](): TabStrip {
		return null;
	}
	[tabStripProperty.setNative](value: TabStrip) {
		this.setTabStripItems(value.items);
	}

	[swipeEnabledProperty.getDefault](): boolean {
		// TODO: create native method and get native?
		return true;
	}
	[swipeEnabledProperty.setNative](value: boolean) {
		(<any>this._viewPager).setSwipePageEnabled(value);
	}

	[offscreenTabLimitProperty.getDefault](): number {
		return this._viewPager.getOffscreenPageLimit();
	}
	[offscreenTabLimitProperty.setNative](value: number) {
		this._viewPager.setOffscreenPageLimit(value);
	}

	[animationEnabledProperty.setNative](value: number) {
		(<any>this._viewPager).setAnimationEnabled(value);
	}
}

function tryCloneDrawable(value: android.graphics.drawable.Drawable, resources: android.content.res.Resources): android.graphics.drawable.Drawable {
	if (value) {
		const constantState = value.getConstantState();
		if (constantState) {
			return constantState.newDrawable(resources);
		}
	}

	return value;
}
