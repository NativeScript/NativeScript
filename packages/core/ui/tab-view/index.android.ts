import { TabViewItem as TabViewItemDefinition } from '.';
import { Font } from '../styling/font';

import { TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty, tabTextColorProperty, tabBackgroundColorProperty, tabTextFontSizeProperty, selectedTabTextColorProperty, androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty, traceCategory, traceMissingIcon, androidIconRenderingModeProperty } from './tab-view-common';
import { textTransformProperty, getTransformedText } from '../text-base';
import { CoreTypes } from '../../core-types';
import { ImageSource } from '../../image-source';
import { Trace } from '../../trace';
import { Color } from '../../color';
import { fontSizeProperty, fontInternalProperty } from '../styling/style-properties';
import { RESOURCE_PREFIX, android as androidUtils, layout } from '../../utils';
import { FONT_PREFIX, isFontIconURI } from '../../utils/common';
import { Frame } from '../frame';
import { getNativeApp } from '../../application/helpers-common';
import { AndroidHelper } from '../core/view';

export * from './tab-view-common';

const ACCENT_COLOR = 'colorAccent';
const PRIMARY_COLOR = 'colorPrimary';
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
	new (owner: TabView): androidx.viewpager.widget.PagerAdapter;
}

const TABID = '_tabId';
const INDEX = '_index';
let PagerAdapter: PagerAdapter;
let appResources: android.content.res.Resources;

function makeFragmentName(viewId: number, id: number): string {
	return 'android:viewpager:' + viewId + ':' + id;
}

function getTabById(id: number): TabView {
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
		private owner: TabView;
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

			return tabItem.view.nativeViewProtected;
		}

		public onDestroyView() {
			const hasRemovingParent = this.getRemovingParentFragment();

			// Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
			// TODO: Consider removing it when update to androidx.fragment:1.2.0
			if (hasRemovingParent && this.owner.selectedIndex === this.index) {
				const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(appResources, this.backgroundBitmap);
				this.owner._originalBackground = this.owner.backgroundColor || new Color('White');
				this.owner.nativeViewProtected.setBackground(bitmapDrawable);
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
		public items: Array<TabViewItemDefinition>;
		private mCurTransaction: androidx.fragment.app.FragmentTransaction;
		private mCurrentPrimaryItem: androidx.fragment.app.Fragment;
		// in fragments 1.3+, committing a transaction may call the adapter's methods and trigger another commit
		// we prevent that here.
		private transactionRunning = false;

		constructor(public owner: TabView) {
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

			return items[index].title;
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
			if (this.mCurTransaction != null && !this.transactionRunning) {
				this.transactionRunning = true;
				this.mCurTransaction.commitNowAllowingStateLoss();
				this.transactionRunning = false;
				this.mCurTransaction = null;
			}
		}
	}

	PagerAdapter = FragmentPagerAdapter;
	appResources = getNativeApp<android.app.Application>().getApplicationContext().getResources();
}

function createTabItemSpec(item: TabViewItem): org.nativescript.widgets.TabItemSpec {
	const result = new org.nativescript.widgets.TabItemSpec();
	result.title = item.title;

	if (item.iconSource) {
		const addDrawable = (is: ImageSource) => {
			if (is) {
				// TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
				result.iconDrawable = new android.graphics.drawable.BitmapDrawable(appResources, is.android);
			} else {
				traceMissingIcon(item.iconSource);
			}
		};
		if (item.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
			result.iconId = androidUtils.resources.getDrawableId(item.iconSource.slice(RESOURCE_PREFIX.length));
			if (result.iconId === 0) {
				traceMissingIcon(item.iconSource);
			}
		} else if (isFontIconURI(item.iconSource)) {
			// Allow specifying a separate font family for the icon via style.iconFontFamily.
			let iconFont: any = item.style.fontInternal;
			const iconFontFamily = item.iconFontFamily || item.style.iconFontFamily;
			if (iconFontFamily) {
				const baseFont = item.style.fontInternal || Font.default;
				iconFont = baseFont.withFontFamily(iconFontFamily);
			}
			const is = ImageSource.fromFontIconCodeSync(item.iconSource.slice(FONT_PREFIX.length), iconFont, item.style.color);
			addDrawable(is);
		} else {
			addDrawable(ImageSource.fromFileOrResourceSync(item.iconSource));
		}
	}

	return result;
}

let defaultAccentColor: number = undefined;
function getDefaultAccentColor(context: android.content.Context): number {
	if (defaultAccentColor === undefined) {
		//Fallback color: https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
		defaultAccentColor = androidUtils.resources.getPaletteColor(ACCENT_COLOR, context) || 0xff33b5e5;
	}

	return defaultAccentColor;
}

export class TabViewItem extends TabViewItemBase {
	nativeViewProtected: android.widget.TextView;
	public tabItemSpec: org.nativescript.widgets.TabItemSpec;
	public index: number;
	private _defaultTransformationMethod: android.text.method.TransformationMethod;

	get _hasFragments(): boolean {
		return true;
	}

	public initNativeView(): void {
		super.initNativeView();
		if (this.nativeViewProtected) {
			this._defaultTransformationMethod = this.nativeViewProtected.getTransformationMethod();
		}
	}

	public onLoaded(): void {
		super.onLoaded();
	}

	public resetNativeView(): void {
		super.resetNativeView();
		if (this.nativeViewProtected) {
			// We reset it here too because this could be changed by multiple properties - whiteSpace, secure, textTransform
			this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
		}
	}

	public disposeNativeView(): void {
		(<TabViewItemDefinition>this).canBeLoaded = false;
		super.disposeNativeView();
	}

	public createNativeView() {
		return this.nativeViewProtected;
	}

	public _update(): void {
		const tabView = this.parent as TabView;
		if (!tabView) {
			return;
		}
		// Top path needs the per-item TextView; bottom-nav path drives updates through
		// the BottomNavigationView's menu and has no per-item TextView. Either widget
		// being present means the parent has initialized its tabs and can take an update.
		const tv = this.nativeViewProtected;
		const hasBottomNav = !!(<any>tabView)._bottomNav;
		if (!tv && !hasBottomNav) {
			return;
		}
		this.tabItemSpec = createTabItemSpec(this);
		tabView.updateAndroidItemAt(this.index, this.tabItemSpec);
	}

	public _getChildFragmentManager(): androidx.fragment.app.FragmentManager {
		const tabView = this.parent as TabView;
		let tabFragment = null;
		const fragmentManager = tabView._getFragmentManager();
		const fragments = fragmentManager.getFragments().toArray();
		for (let i = 0; i < fragments.length; i++) {
			if (fragments[i].index === this.index) {
				tabFragment = fragments[i];
				break;
			}
		}

		// TODO: can happen in a modal tabview scenario when the modal dialog fragment is already removed
		if (!tabFragment) {
			if (Trace.isEnabled()) {
				Trace.write(`Could not get child fragment manager for tab item with index ${this.index}`, traceCategory);
			}

			return (<any>tabView)._getRootFragmentManager();
		}

		return tabFragment.getChildFragmentManager();
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		return { nativeSize: this.nativeViewProtected.getTextSize() };
	}
	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (typeof value === 'number') {
			this.nativeViewProtected.setTextSize(value);
		} else {
			this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
		}
	}

	[fontInternalProperty.getDefault](): android.graphics.Typeface {
		return this.nativeViewProtected.getTypeface();
	}
	[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
		this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
	}

	[textTransformProperty.getDefault](): 'default' {
		return 'default';
	}
	[textTransformProperty.setNative](value: CoreTypes.TextTransformType | 'default') {
		const tv = this.nativeViewProtected;
		if (value === 'default') {
			tv.setTransformationMethod(this._defaultTransformationMethod);
			tv.setText(this.title);
		} else {
			const result = getTransformedText(this.title, value);
			tv.setText(result);
			tv.setTransformationMethod(null);
		}
	}
}

function setElevation(grid: org.nativescript.widgets.GridLayout, tabLayout: org.nativescript.widgets.TabLayout) {
	const compat = <any>androidx.core.view.ViewCompat;
	if (compat.setElevation) {
		const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
		compat.setElevation(grid, val);
		compat.setElevation(tabLayout, val);
	}
}

export const tabs = new Array<WeakRef<TabView>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
	const rangeStart = Math.max(0, index - eps);
	const rangeEnd = Math.min(index + eps, lastIndex);
	for (let i = rangeStart; i <= rangeEnd; i++) {
		callback(i);
	}
}

export class TabView extends TabViewBase {
	private _tabLayout: org.nativescript.widgets.TabLayout;
	private _bottomNav!: com.google.android.material.bottomnavigation.BottomNavigationView;
	private _isBottomNav = false;
	private _suppressBottomNavListener = false;
	private _bottomNavSelectedListener: any;
	private _bottomNavPageListener: any;
	private _viewPager: androidx.viewpager.widget.ViewPager;
	private _pagerAdapter: androidx.viewpager.widget.PagerAdapter;
	private _androidViewId = -1;
	public _originalBackground: any;

	constructor() {
		super();
		tabs.push(new WeakRef(this));
	}

	get _hasFragments(): boolean {
		return true;
	}

	public onItemsChanged(oldItems: TabViewItem[], newItems: TabViewItem[]): void {
		super.onItemsChanged(oldItems, newItems);

		if (oldItems) {
			oldItems.forEach((item: TabViewItem, i, arr) => {
				item.index = 0;
				item.tabItemSpec = null;
				item.setNativeView(null);
			});
		}
	}

	public createNativeView() {
		initializeNativeClasses();
		if (Trace.isEnabled()) {
			Trace.write('TabView._createUI(' + this + ');', traceCategory);
		}

		this._isBottomNav = this.androidTabsPosition === 'bottom';

		return this._isBottomNav ? this._createBottomNavView() : this._createTabLayoutView();
	}

	private _createTabLayoutView(): org.nativescript.widgets.GridLayout {
		const context: android.content.Context = this._context;
		const nativeView = new org.nativescript.widgets.GridLayout(context);
		const viewPager = new org.nativescript.widgets.TabViewPager(context);
		const tabLayout = new org.nativescript.widgets.TabLayout(context);
		const lp = new org.nativescript.widgets.CommonLayoutParams();
		const primaryColor = androidUtils.resources.getPaletteColor(PRIMARY_COLOR, context);
		const accentColor = getDefaultAccentColor(context);

		lp.row = 1;

		nativeView.addRowsFromJSON(
			JSON.stringify([
				{ value: 1, type: 0 /* org.nativescript.widgets.GridUnitType.auto */ },
				{ value: 1, type: 2 /* org.nativescript.widgets.GridUnitType.star */ },
			]),
		);
		viewPager.setLayoutParams(lp);

		if (!this.androidSwipeEnabled) {
			viewPager.setSwipePageEnabled(false);
		}

		nativeView.addView(viewPager);
		(<any>nativeView).viewPager = viewPager;

		const adapter = new PagerAdapter(this);
		viewPager.setAdapter(adapter);
		(<any>viewPager).adapter = adapter;

		nativeView.addView(tabLayout);
		(<any>nativeView).tabLayout = tabLayout;

		setElevation(nativeView, tabLayout);

		if (accentColor) {
			tabLayout.setSelectedIndicatorColors([accentColor]);
		}

		if (primaryColor) {
			tabLayout.setBackgroundColor(primaryColor);
		}

		return nativeView;
	}

	private _createBottomNavView(): org.nativescript.widgets.GridLayout {
		const context: android.content.Context = this._context;
		const nativeView = new org.nativescript.widgets.GridLayout(context);
		const viewPager = new org.nativescript.widgets.TabViewPager(context);
		// BottomNavigationView reads required Material attributes (itemActiveIndicatorStyle,
		// itemTextAppearance*, etc.) from the Activity theme. NativeScript apps default to
		// Theme.AppCompat — without Material attrs the widget can render zero-height. Wrap
		// the context in a Material 3 Bridge theme so the widget styles correctly without
		// forcing the host app theme to change.
		const themedContext = this._wrapWithMaterialThemeOverlay(context);
		const bottomNav = new com.google.android.material.bottomnavigation.BottomNavigationView(themedContext);
		// Guarantee a measurable height even before the menu populates, so GridLayout's
		// auto row reserves space on the very first measure pass. Material 3 spec uses 80dp.
		bottomNav.setMinimumHeight(Math.round(80 * layout.getDisplayDensity()));
		const primaryColor = androidUtils.resources.getPaletteColor(PRIMARY_COLOR, context);

		// Row 0 = content (viewPager star), row 1 = bottom navigation bar (fixed Material 3
		// height of 80dp converted to device pixels — GridUnitType.pixel takes raw px).
		// Using a fixed size avoids GridLayout's auto-row measuring an empty
		// BottomNavigationView at zero height during the first pass and never recovering.
		const navBarHeightPx = Math.round(80 * layout.getDisplayDensity());
		nativeView.addRowsFromJSON(
			JSON.stringify([
				{ value: 1, type: 2 /* org.nativescript.widgets.GridUnitType.star */ },
				{ value: navBarHeightPx, type: 1 /* org.nativescript.widgets.GridUnitType.pixel (raw px) */ },
			]),
		);

		const viewPagerLp = new org.nativescript.widgets.CommonLayoutParams();
		viewPagerLp.row = 0;
		viewPager.setLayoutParams(viewPagerLp);
		// Swipe between tabs is not the BottomNavigation idiom; nav bar drives selection.
		viewPager.setSwipePageEnabled(false);

		nativeView.addView(viewPager);
		(<any>nativeView).viewPager = viewPager;

		const adapter = new PagerAdapter(this);
		viewPager.setAdapter(adapter);
		(<any>viewPager).adapter = adapter;

		const navLp = new org.nativescript.widgets.CommonLayoutParams();
		navLp.row = 1;
		bottomNav.setLayoutParams(navLp);

		nativeView.addView(bottomNav);
		(<any>nativeView).bottomNav = bottomNav;

		if (primaryColor) {
			bottomNav.setBackgroundColor(primaryColor);
		}

		return nativeView;
	}

	private _wrapWithMaterialThemeOverlay(context: android.content.Context): android.content.Context {
		// Try Material 3 first, then Material Components (Bridge variants extend AppCompat).
		const candidates = ['Theme.Material3.DayNight', 'Theme.Material3.Light', 'Theme.MaterialComponents.Light.Bridge', 'Theme.MaterialComponents.DayNight.Bridge'];
		const resources = context.getResources();
		const pkgName = context.getPackageName();
		for (const styleName of candidates) {
			const id = resources.getIdentifier(styleName, 'style', pkgName);
			if (id !== 0) {
				if (Trace.isEnabled()) {
					Trace.write(`TabView: BottomNavigationView theme overlay='${styleName}' id=${id}`, traceCategory);
				}
				return new android.view.ContextThemeWrapper(context, id);
			}
		}
		if (Trace.isEnabled()) {
			Trace.write(`TabView: no Material theme style resolved; BottomNavigationView will use host context`, traceCategory, Trace.messageType.warn);
		}
		return context;
	}

	public initNativeView(): void {
		super.initNativeView();
		if (this._androidViewId < 0) {
			this._androidViewId = android.view.View.generateViewId();
		}

		const nativeView: any = this.nativeViewProtected;

		const viewPager = nativeView.viewPager;
		viewPager.setId(this._androidViewId);
		this._viewPager = viewPager;
		this._pagerAdapter = viewPager.adapter;
		(<any>this._pagerAdapter).owner = this;

		if (this._isBottomNav) {
			this._bottomNav = nativeView.bottomNav;
			this._setupBottomNavListeners();
		} else {
			this._tabLayout = nativeView.tabLayout;
		}
	}

	private _setupBottomNavListeners(): void {
		if (!this._bottomNav || !this._viewPager) {
			return;
		}

		const ownerRef = new WeakRef<TabView>(this);

		const itemSelectedListener = new com.google.android.material.navigation.NavigationBarView.OnItemSelectedListener({
			onNavigationItemSelected(item: android.view.MenuItem): boolean {
				const owner = ownerRef.get();
				if (!owner || owner._suppressBottomNavListener) {
					return true;
				}
				const id = item.getItemId();
				if (owner._viewPager) {
					owner._viewPager.setCurrentItem(id, false);
				}
				return true;
			},
		});
		this._bottomNavSelectedListener = itemSelectedListener;
		this._bottomNav.setOnItemSelectedListener(itemSelectedListener);

		const pageChangeListener = new androidx.viewpager.widget.ViewPager.OnPageChangeListener({
			onPageScrolled(_position: number, _positionOffset: number, _positionOffsetPixels: number) {
				/* no-op */
			},
			onPageScrollStateChanged(_state: number) {
				/* no-op */
			},
			onPageSelected(position: number) {
				const owner = ownerRef.get();
				if (!owner || !owner._bottomNav) {
					return;
				}
				const menu = owner._bottomNav.getMenu();
				if (position >= 0 && position < menu.size()) {
					owner._suppressBottomNavListener = true;
					try {
						menu.getItem(position).setChecked(true);
					} finally {
						owner._suppressBottomNavListener = false;
					}
				}
			},
		});
		this._bottomNavPageListener = pageChangeListener;
		this._viewPager.addOnPageChangeListener(pageChangeListener);
	}

	public _loadUnloadTabItems(newIndex: number) {
		const items = this.items;
		if (!items) {
			return;
		}

		const lastIndex = items.length - 1;
		const offsideItems = this.androidTabsPosition === 'top' ? this.androidOffscreenTabLimit : 1;

		const toUnload = [];
		const toLoad = [];

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
				item.unloadView(item.view);
			}
		});

		const newItem = items[newIndex];
		const selectedView = newItem && newItem.view;
		if (selectedView instanceof Frame) {
			selectedView._pushInFrameStackRecursive();
		}

		toLoad.forEach((index) => {
			const item = items[index];
			if (this.isLoaded && items[index]) {
				item.loadView(item.view);
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

		this.setAdapterItems(this.items);
	}

	public onUnloaded(): void {
		super.onUnloaded();

		this.setAdapterItems(null);
	}

	public disposeNativeView() {
		if (this._tabLayout) {
			this._tabLayout.setItems(null as any, null as any);
			this._tabLayout = null as any;
		}

		if (this._bottomNav) {
			if (this._bottomNavSelectedListener) {
				this._bottomNav.setOnItemSelectedListener(null as any);
			}
			if (this._bottomNavPageListener && this._viewPager) {
				this._viewPager.removeOnPageChangeListener(this._bottomNavPageListener);
			}
			this._bottomNav.getMenu().clear();
			this._bottomNav = null as any;
			this._bottomNavSelectedListener = null;
			this._bottomNavPageListener = null;
		}

		(<any>this._pagerAdapter).owner = null;
		this._pagerAdapter = null as any;

		this._viewPager = null as any;
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
		const fragments = <Array<any>>fragmentManager.getFragments().toArray();
		for (let i = 0; i < fragments.length; i++) {
			transaction.remove(fragments[i]);
		}
		transaction.commitNowAllowingStateLoss();
	}

	private shouldUpdateAdapter(items: Array<TabViewItemDefinition>) {
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

	private setAdapterItems(items: Array<TabViewItemDefinition>) {
		if (this.shouldUpdateAdapter(items)) {
			(<any>this._pagerAdapter).items = items;

			const length = items ? items.length : 0;
			if (length === 0) {
				if (this._tabLayout) {
					this._tabLayout.setItems(null as any, null as any);
				}
				if (this._bottomNav) {
					this._bottomNav.getMenu().clear();
				}
				this._pagerAdapter.notifyDataSetChanged();

				return;
			}

			const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
			items.forEach((item: TabViewItem, i, arr) => {
				const tabItemSpec = createTabItemSpec(item);
				item.index = i;
				item.tabItemSpec = tabItemSpec;
				tabItems.push(tabItemSpec);
			});

			if (this._tabLayout) {
				const tabLayout = this._tabLayout;
				tabLayout.setItems(tabItems, this._viewPager);
				items.forEach((item, i, arr) => {
					const tv = tabLayout.getTextViewForItemAt(i);
					item.setNativeView(tv);
				});
			} else if (this._bottomNav) {
				this._populateBottomNavMenu(tabItems);
			}

			this._pagerAdapter.notifyDataSetChanged();
		}
	}

	private _populateBottomNavMenu(tabItems: Array<org.nativescript.widgets.TabItemSpec>): void {
		const menu = this._bottomNav.getMenu();
		menu.clear();

		tabItems.forEach((spec, i) => {
			const menuItem = menu.add(android.view.Menu.NONE, i, i, spec.title || '');
			const drawable = this._getDrawableFromSpec(spec);
			if (drawable) {
				menuItem.setIcon(drawable);
			}
		});

		if (Trace.isEnabled()) {
			Trace.write(`TabView: BottomNavigationView populated with ${tabItems.length} menu item(s)`, traceCategory);
		}

		// Re-apply colors that depend on the menu existing.
		this._applyBottomNavTextAndIconColors();
		this._applyBottomNavIconRenderingMode();

		// Sync the visible selection with selectedIndex.
		const selectedIndex = this.selectedIndex;
		if (selectedIndex >= 0 && selectedIndex < menu.size()) {
			this._suppressBottomNavListener = true;
			try {
				menu.getItem(selectedIndex).setChecked(true);
			} finally {
				this._suppressBottomNavListener = false;
			}
		}

		// Force the host GridLayout to re-measure. Without this, an auto row that already
		// measured an empty BottomNavigationView (height 0) stays collapsed even after items
		// are added — the parent doesn't know to remeasure unless we ask.
		this._bottomNav.requestLayout();
		const parent = this._bottomNav.getParent();
		if (parent && (<any>parent).requestLayout) {
			(<any>parent).requestLayout();
		}
	}

	private _getDrawableFromSpec(spec: org.nativescript.widgets.TabItemSpec): android.graphics.drawable.Drawable | null {
		if (!spec) {
			return null;
		}
		if (spec.iconDrawable) {
			return spec.iconDrawable;
		}
		if (spec.iconId && spec.iconId !== 0) {
			try {
				return androidx.core.content.ContextCompat.getDrawable(this._context, spec.iconId);
			} catch (e) {
				return null;
			}
		}
		return null;
	}

	private _buildCheckedColorStateList(checkedColor: number, uncheckedColor: number): android.content.res.ColorStateList {
		const states: any = Array.create('[I', 2);
		const checkedAttr: any = Array.create('int', 1);
		checkedAttr[0] = android.R.attr.state_checked;
		states[0] = checkedAttr;
		const uncheckedAttr: any = Array.create('int', 1);
		uncheckedAttr[0] = -android.R.attr.state_checked;
		states[1] = uncheckedAttr;

		const colors = Array.create('int', 2);
		colors[0] = checkedColor;
		colors[1] = uncheckedColor;

		return new android.content.res.ColorStateList(states, colors);
	}

	private _applyBottomNavTextAndIconColors(): void {
		if (!this._bottomNav) {
			return;
		}
		const styleAny: any = this.style;
		const tabTextColor = styleAny.tabTextColor instanceof Color ? styleAny.tabTextColor.android : null;
		const selectedTabTextColor = styleAny.selectedTabTextColor instanceof Color ? styleAny.selectedTabTextColor.android : null;

		if (tabTextColor === null && selectedTabTextColor === null) {
			return;
		}

		const checked = selectedTabTextColor !== null ? selectedTabTextColor : tabTextColor;
		const unchecked = tabTextColor !== null ? tabTextColor : selectedTabTextColor;
		const csl = this._buildCheckedColorStateList(checked, unchecked);
		this._bottomNav.setItemTextColor(csl);
		// Tint icons to match in 'alwaysTemplate' mode; leave originals untinted otherwise.
		if (this.androidIconRenderingMode !== 'alwaysOriginal') {
			this._bottomNav.setItemIconTintList(csl);
		}
	}

	private _applyBottomNavIconRenderingMode(): void {
		if (!this._bottomNav) {
			return;
		}
		if (this.androidIconRenderingMode === 'alwaysOriginal') {
			this._bottomNav.setItemIconTintList(null as any);
		} else {
			this._applyBottomNavTextAndIconColors();
		}
	}

	private getNativeRenderingMode(mode: 'alwaysOriginal' | 'alwaysTemplate'): number {
		switch (mode) {
			case 'alwaysTemplate':
				return org.nativescript.widgets.TabIconRenderingMode.template;
			default:
			case 'alwaysOriginal':
				return org.nativescript.widgets.TabIconRenderingMode.original;
		}
	}

	public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
		if (this._tabLayout) {
			this._tabLayout.updateItemAt(index, spec);
		} else if (this._bottomNav) {
			const menu = this._bottomNav.getMenu();
			if (index >= 0 && index < menu.size()) {
				const menuItem = menu.getItem(index);
				menuItem.setTitle(spec.title || '');
				const drawable = this._getDrawableFromSpec(spec);
				if (drawable) {
					menuItem.setIcon(drawable);
				}
			}
		}
	}

	[androidOffscreenTabLimitProperty.getDefault](): number {
		return this._viewPager.getOffscreenPageLimit();
	}
	[androidOffscreenTabLimitProperty.setNative](value: number) {
		this._viewPager.setOffscreenPageLimit(value);
	}

	[androidIconRenderingModeProperty.getDefault](): 'alwaysOriginal' | 'alwaysTemplate' {
		return 'alwaysOriginal';
	}
	[androidIconRenderingModeProperty.setNative](value: 'alwaysOriginal' | 'alwaysTemplate') {
		if (this._tabLayout) {
			this._tabLayout.setIconRenderingMode(this.getNativeRenderingMode(value));
		} else if (this._bottomNav) {
			this._applyBottomNavIconRenderingMode();
		}
	}

	[selectedIndexProperty.setNative](value: number) {
		const smoothScroll = !this._isBottomNav && this.androidTabsPosition === 'top';

		if (Trace.isEnabled()) {
			Trace.write('TabView this._viewPager.setCurrentItem(' + value + ', ' + smoothScroll + ');', traceCategory);
		}

		this._viewPager.setCurrentItem(value, smoothScroll);

		if (this._bottomNav) {
			const menu = this._bottomNav.getMenu();
			if (value >= 0 && value < menu.size()) {
				this._suppressBottomNavListener = true;
				try {
					menu.getItem(value).setChecked(true);
				} finally {
					this._suppressBottomNavListener = false;
				}
			}
		}
	}

	[itemsProperty.getDefault](): TabViewItem[] {
		return null;
	}
	[itemsProperty.setNative](value: TabViewItem[]) {
		this.setAdapterItems(value);
		selectedIndexProperty.coerce(this);
	}

	[tabBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable {
		const target = this._tabLayout || this._bottomNav;
		return target ? target.getBackground() : (null as any);
	}
	[tabBackgroundColorProperty.setNative](value: android.graphics.drawable.Drawable | Color) {
		const target = this._tabLayout || this._bottomNav;
		if (!target) {
			return;
		}
		if (value instanceof Color) {
			target.setBackgroundColor(value.android);
		} else {
			target.setBackground(AndroidHelper.getCopyOrDrawable(value, this.nativeViewProtected.getResources()));
		}
	}

	[tabTextFontSizeProperty.getDefault](): number {
		if (this._tabLayout) {
			return this._tabLayout.getTabTextFontSize();
		}
		// BottomNavigationView text size is theme-driven; no per-instance default.
		return -1;
	}
	[tabTextFontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (this._tabLayout) {
			if (typeof value === 'number') {
				this._tabLayout.setTabTextFontSize(value);
			} else {
				this._tabLayout.setTabTextFontSize(value.nativeSize);
			}
		}
		// Note: BottomNavigationView label sizing comes from the host theme's
		// itemTextAppearanceActive / itemTextAppearanceInactive styles. Per-instance
		// text-size overrides are not supported; set those styles in the app theme.
	}

	[tabTextColorProperty.getDefault](): number {
		return this._tabLayout ? this._tabLayout.getTabTextColor() : 0;
	}
	[tabTextColorProperty.setNative](value: number | Color) {
		if (this._tabLayout) {
			const color = value instanceof Color ? value.android : value;
			this._tabLayout.setTabTextColor(color);
		} else if (this._bottomNav) {
			this._applyBottomNavTextAndIconColors();
		}
	}

	[selectedTabTextColorProperty.getDefault](): number {
		return this._tabLayout ? this._tabLayout.getSelectedTabTextColor() : 0;
	}
	[selectedTabTextColorProperty.setNative](value: number | Color) {
		if (this._tabLayout) {
			const color = value instanceof Color ? value.android : value;
			this._tabLayout.setSelectedTabTextColor(color);
		} else if (this._bottomNav) {
			this._applyBottomNavTextAndIconColors();
		}
	}

	[androidSelectedTabHighlightColorProperty.getDefault](): number {
		return getDefaultAccentColor(this._context);
	}
	[androidSelectedTabHighlightColorProperty.setNative](value: number | Color) {
		const color = value instanceof Color ? value.android : value;
		if (this._tabLayout) {
			this._tabLayout.setSelectedIndicatorColors([color]);
		} else if (this._bottomNav) {
			// Material 3 active indicator pill behind the selected item.
			this._bottomNav.setItemActiveIndicatorColor(android.content.res.ColorStateList.valueOf(color));
		}
	}
}
