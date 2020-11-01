// Types
import { TabContentItem } from '../tab-navigation-base/tab-content-item';
import { TabStrip } from '../tab-navigation-base/tab-strip';
import { TabStripItem } from '../tab-navigation-base/tab-strip-item';
import { TextTransform } from '../text-base';

// Requires
import * as application from '../../application';
import { ImageSource } from '../../image-source';
import { ad, isFontIconURI, layout, RESOURCE_PREFIX } from '../../utils';
import { CSSType, View } from '../core/view';
import { Color } from '../../color';
import { Frame } from '../frame';
import { Font } from '../styling/font';
import { getIconSpecSize, itemsProperty, selectedIndexProperty, TabNavigationBase, tabStripProperty } from '../tab-navigation-base/tab-navigation-base';
import { getTransformedText } from '../text-base';

// TODO: Impl trace
// import { Trace } from "../../../trace";

const PRIMARY_COLOR = 'colorPrimary';
const DEFAULT_ELEVATION = 8;

const TABID = '_tabId';
const INDEX = '_index';
const ownerSymbol = Symbol('_owner');

let TabFragment: any;
let BottomNavigationBar: any;
let AttachStateChangeListener: any;
let appResources: android.content.res.Resources;

class IconInfo {
	drawable: android.graphics.drawable.BitmapDrawable;
	height: number;
}

function makeFragmentName(viewId: number, id: number): string {
	return 'android:bottomnavigation:' + viewId + ':' + id;
}

function getTabById(id: number): BottomNavigation {
	const ref = tabs.find((ref) => {
		const tab = ref.get();

		return tab && tab._domId === id;
	});

	return ref && ref.get();
}

function initializeNativeClasses() {
	if (BottomNavigationBar) {
		return;
	}

	@NativeClass
	class TabFragmentImplementation extends org.nativescript.widgets.FragmentBase {
		private owner: BottomNavigation;
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
				throw new Error(`Cannot find BottomNavigation`);
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

				let thisView = this.getView();
				if (thisView) {
					let thisViewParent = thisView.getParent();
					if (thisViewParent && thisViewParent instanceof android.view.ViewGroup) {
						thisViewParent.removeView(thisView);
					}
				}
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

	@NativeClass
	class BottomNavigationBarImplementation extends org.nativescript.widgets.BottomNavigationBar {
		constructor(context: android.content.Context, public owner: BottomNavigation) {
			super(context);

			return global.__native(this);
		}

		public onSelectedPositionChange(position: number, prevPosition: number): void {
			const owner = this.owner;
			if (!owner) {
				return;
			}

			owner.changeTab(position);

			const tabStripItems = owner.tabStrip && owner.tabStrip.items;

			if (position >= 0 && tabStripItems && tabStripItems[position]) {
				tabStripItems[position]._emit(TabStripItem.selectEvent);
			}

			if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
				tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
			}

			owner._setItemsColors(owner.tabStrip.items);
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

	@NativeClass
	@Interfaces([android.view.View.OnAttachStateChangeListener])
	class AttachListener extends java.lang.Object implements android.view.View.OnAttachStateChangeListener {
		constructor() {
			super();

			return global.__native(this);
		}

		onViewAttachedToWindow(view: android.view.View): void {
			const owner: View = view[ownerSymbol];
			if (owner) {
				owner._onAttachedToWindow();
			}
		}

		onViewDetachedFromWindow(view: android.view.View): void {
			const owner: View = view[ownerSymbol];
			if (owner) {
				owner._onDetachedFromWindow();
			}
		}
	}

	TabFragment = TabFragmentImplementation;
	BottomNavigationBar = BottomNavigationBarImplementation;
	AttachStateChangeListener = new AttachListener();
	appResources = application.android.context.getResources();
}

function setElevation(bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar) {
	const compat = <any>androidx.core.view.ViewCompat;
	if (compat.setElevation) {
		const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
		compat.setElevation(bottomNavigationBar, val);
	}
}

export const tabs = new Array<WeakRef<BottomNavigation>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
	const rangeStart = Math.max(0, index - eps);
	const rangeEnd = Math.min(index + eps, lastIndex);
	for (let i = rangeStart; i <= rangeEnd; i++) {
		callback(i);
	}
}

@CSSType('BottomNavigation')
export class BottomNavigation extends TabNavigationBase {
	private _contentView: org.nativescript.widgets.ContentLayout;
	private _contentViewId: number = -1;
	private _bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar;
	private _currentFragment: androidx.fragment.app.Fragment;
	private _currentTransaction: androidx.fragment.app.FragmentTransaction;
	private _attachedToWindow = false;
	public _originalBackground: any;
	private _textTransform: TextTransform = 'none';
	private _selectedItemColor: Color;
	private _unSelectedItemColor: Color;

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
		// if (Trace.isEnabled()) {
		//     Trace.write("BottomNavigation._createUI(" + this + ");", traceCategory);
		// }

		const context: android.content.Context = this._context;
		const nativeView = new org.nativescript.widgets.GridLayout(context);

		nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
		nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

		// CONTENT VIEW
		const contentView = new org.nativescript.widgets.ContentLayout(this._context);
		const contentViewLayoutParams = new org.nativescript.widgets.CommonLayoutParams();
		contentViewLayoutParams.row = 0;
		contentView.setLayoutParams(contentViewLayoutParams);
		nativeView.addView(contentView);
		(<any>nativeView).contentView = contentView;

		// TABSTRIP
		const bottomNavigationBar = new BottomNavigationBar(context, this);
		const bottomNavigationBarLayoutParams = new org.nativescript.widgets.CommonLayoutParams();
		bottomNavigationBarLayoutParams.row = 1;
		bottomNavigationBar.setLayoutParams(bottomNavigationBarLayoutParams);
		nativeView.addView(bottomNavigationBar);
		(<any>nativeView).bottomNavigationBar = bottomNavigationBar;

		setElevation(bottomNavigationBar);

		const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
		if (primaryColor) {
			bottomNavigationBar.setBackgroundColor(primaryColor);
		}

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();

		if (this._contentViewId < 0) {
			this._contentViewId = android.view.View.generateViewId();
		}

		const nativeView: any = this.nativeViewProtected;

		nativeView.addOnAttachStateChangeListener(AttachStateChangeListener);
		nativeView[ownerSymbol] = this;

		this._contentView = (<any>nativeView).contentView;
		this._contentView.setId(this._contentViewId);

		this._bottomNavigationBar = (<any>nativeView).bottomNavigationBar;
		(<any>this._bottomNavigationBar).owner = this;

		if (this.tabStrip) {
			this.tabStrip.setNativeView(this._bottomNavigationBar);
		}
	}

	public _loadUnloadTabItems(newIndex: number) {
		const items = this.items;
		const lastIndex = this.items.length - 1;
		const offsideItems = 0;

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
			selectedView._pushInFrameStackRecursive();
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

		if (this.tabStrip) {
			this.setTabStripItems(this.tabStrip.items);
		} else {
			// manually set the visibility, so that the grid layout remeasures
			this._bottomNavigationBar.setVisibility(android.view.View.GONE);
		}

		this.changeTab(this.selectedIndex);
	}

	_onAttachedToWindow(): void {
		super._onAttachedToWindow();

		// _onAttachedToWindow called from OS again after it was detach
		// TODO: Consider testing and removing it when update to androidx.fragment:1.2.0
		if (this._manager && this._manager.isDestroyed()) {
			return;
		}

		this._attachedToWindow = true;
		this.changeTab(this.selectedIndex);
	}

	_onDetachedFromWindow(): void {
		super._onDetachedFromWindow();

		this._attachedToWindow = false;
	}

	public onUnloaded(): void {
		super.onUnloaded();

		if (this.tabStrip) {
			this.setTabStripItems(null);
		}

		const fragmentToDetach = this._currentFragment;
		if (fragmentToDetach) {
			this.destroyItem((<any>fragmentToDetach).index, fragmentToDetach);
			this.commitCurrentTransaction();
		}
	}

	public disposeNativeView() {
		this._bottomNavigationBar.setItems(null);
		this._bottomNavigationBar = null;

		this.nativeViewProtected.removeOnAttachStateChangeListener(AttachStateChangeListener);
		this.nativeViewProtected[ownerSymbol] = null;

		super.disposeNativeView();
	}

	public _onRootViewReset(): void {
		super._onRootViewReset();

		// call this AFTER the super call to ensure descendants apply their rootview-reset logic first
		// i.e. in a scenario with tab frames let the frames cleanup their fragments first, and then
		// cleanup the tab fragments to avoid
		// android.content.res.Resources$NotFoundException: Unable to find resource ID #0xfffffff6
		this.disposeTabFragments();
	}

	private disposeTabFragments(): void {
		const fragmentManager = this._getFragmentManager();
		const transaction = fragmentManager.beginTransaction();
		const fragments = fragmentManager.getFragments().toArray();
		for (let i = 0; i < fragments.length; i++) {
			transaction.remove(fragments[i]);
		}

		transaction.commitNowAllowingStateLoss();
	}

	private get currentTransaction(): androidx.fragment.app.FragmentTransaction {
		if (!this._currentTransaction) {
			const fragmentManager = this._getFragmentManager();
			this._currentTransaction = fragmentManager.beginTransaction();
		}

		return this._currentTransaction;
	}

	private commitCurrentTransaction(): void {
		if (this._currentTransaction) {
			this._currentTransaction.commitNowAllowingStateLoss();
			this._currentTransaction = null;
		}
	}

	// TODO: Should we extract adapter-like class?
	// TODO: Rename this?
	public changeTab(index: number) {
		// index is -1 when there are no items
		// bot nav is not attached if you change the tab too early
		if (index === -1 || !this._attachedToWindow) {
			return;
		}

		const fragmentToDetach = this._currentFragment;
		if (fragmentToDetach) {
			this.destroyItem((<any>fragmentToDetach).index, fragmentToDetach);
		}

		const fragment = this.instantiateItem(this._contentView, index);
		this.setPrimaryItem(index, fragment);

		this.commitCurrentTransaction();
	}

	private instantiateItem(container: android.view.ViewGroup, position: number): androidx.fragment.app.Fragment {
		const name = makeFragmentName(container.getId(), position);

		const fragmentManager = this._getFragmentManager();
		let fragment: androidx.fragment.app.Fragment = fragmentManager.findFragmentByTag(name);
		if (fragment != null) {
			this.currentTransaction.attach(fragment);
		} else {
			fragment = TabFragment.newInstance(this._domId, position);
			this.currentTransaction.add(container.getId(), fragment, name);
		}

		if (fragment !== this._currentFragment) {
			fragment.setMenuVisibility(false);
			fragment.setUserVisibleHint(false);
		}

		return fragment;
	}

	private setPrimaryItem(position: number, fragment: androidx.fragment.app.Fragment): void {
		if (fragment !== this._currentFragment) {
			if (this._currentFragment != null) {
				this._currentFragment.setMenuVisibility(false);
				this._currentFragment.setUserVisibleHint(false);
			}

			if (fragment != null) {
				fragment.setMenuVisibility(true);
				fragment.setUserVisibleHint(true);
			}

			this._currentFragment = fragment;
			this.selectedIndex = position;

			const tabItems = this.items;
			const tabItem = tabItems ? tabItems[position] : null;
			if (tabItem) {
				tabItem.canBeLoaded = true;
				this._loadUnloadTabItems(position);
			}
		}
	}

	private destroyItem(position: number, fragment: androidx.fragment.app.Fragment): void {
		if (fragment) {
			this.currentTransaction.detach(fragment);
			if (this._currentFragment === fragment) {
				this._currentFragment = null;
			}
		}

		if (this.items && this.items[position]) {
			this.items[position].canBeLoaded = false;
		}
	}

	private setTabStripItems(items: Array<TabStripItem>) {
		if (!this.tabStrip || !items) {
			this._bottomNavigationBar.setItems(null);

			return;
		}

		const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
		items.forEach((tabStripItem, i, arr) => {
			tabStripItem._index = i;
			if (items[i]) {
				const tabItemSpec = this.createTabItemSpec(items[i]);
				tabItems.push(tabItemSpec);
			}
		});

		this._bottomNavigationBar.setItems(tabItems);

		items.forEach((item, i, arr) => {
			const textView = this._bottomNavigationBar.getTextViewForItemAt(i);
			item.setNativeView(textView);
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
			const titleLabel = tabStripItem.label;
			let title = titleLabel.text;

			// TEXT-TRANSFORM
			const textTransform = this.getItemLabelTextTransform(tabStripItem);
			title = getTransformedText(title, textTransform);
			tabItemSpec.title = title;

			// BACKGROUND-COLOR
			const backgroundColor = tabStripItem.style.backgroundColor;
			tabItemSpec.backgroundColor = backgroundColor ? backgroundColor.android : this.getTabBarBackgroundArgbColor();

			// COLOR
			let itemColor = this.selectedIndex === tabStripItem._index ? this._selectedItemColor : this._unSelectedItemColor;
			const color = itemColor || titleLabel.style.color;
			tabItemSpec.color = color && color.android;

			// FONT
			const fontInternal = titleLabel.style.fontInternal;
			if (fontInternal) {
				tabItemSpec.fontSize = fontInternal.fontSize;
				tabItemSpec.typeFace = fontInternal.getAndroidTypeface();
			}

			// ICON
			const iconSource = tabStripItem.image && tabStripItem.image.src;
			if (iconSource) {
				const iconInfo = this.getIconInfo(tabStripItem, itemColor);

				if (iconInfo) {
					// TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
					// tslint:disable-next-line:deprecation
					tabItemSpec.iconDrawable = iconInfo.drawable;
					tabItemSpec.imageHeight = iconInfo.height;
				} else {
					// TODO:
					// traceMissingIcon(iconSource);
				}
			}
		}

		return tabItemSpec;
	}

	private getOriginalIcon(tabStripItem: TabStripItem, color?: Color): android.graphics.Bitmap {
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

		return is && is.android;
	}

	private getDrawableInfo(image: android.graphics.Bitmap): IconInfo {
		if (image) {
			if (this.tabStrip && this.tabStrip.isIconSizeFixed) {
				image = this.getFixedSizeIcon(image);
			}

			let imageDrawable = new android.graphics.drawable.BitmapDrawable(application.android.context.getResources(), image);

			return {
				drawable: imageDrawable,
				height: image.getHeight(),
			};
		}

		return new IconInfo();
	}

	private getIconInfo(tabStripItem: TabStripItem, color?: Color): IconInfo {
		let originalIcon = this.getOriginalIcon(tabStripItem, color);

		return this.getDrawableInfo(originalIcon);
	}

	private getFixedSizeIcon(image: android.graphics.Bitmap): android.graphics.Bitmap {
		const inWidth = image.getWidth();
		const inHeight = image.getHeight();

		const iconSpecSize = getIconSpecSize({
			width: inWidth,
			height: inHeight,
		});

		const widthPixels = iconSpecSize.width * layout.getDisplayDensity();
		const heightPixels = iconSpecSize.height * layout.getDisplayDensity();

		const scaledImage = android.graphics.Bitmap.createScaledBitmap(image, widthPixels, heightPixels, true);

		return scaledImage;
	}

	public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
		this._bottomNavigationBar.updateItemAt(index, spec);
	}

	public getTabBarBackgroundColor(): android.graphics.drawable.Drawable {
		return this._bottomNavigationBar.getBackground();
	}

	public setTabBarBackgroundColor(value: android.graphics.drawable.Drawable | Color): void {
		if (value instanceof Color) {
			this._bottomNavigationBar.setBackgroundColor(value.android);
		} else {
			this._bottomNavigationBar.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources()));
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

	public _setItemsColors(items: Array<TabStripItem>): void {
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
		this._setItemsColors(this.tabStrip.items);
	}

	public getTabBarUnSelectedItemColor(): Color {
		return this._unSelectedItemColor;
	}

	public setTabBarUnSelectedItemColor(value: Color) {
		this._unSelectedItemColor = value;
		this._setItemsColors(this.tabStrip.items);
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
		const tabBarItem = this._bottomNavigationBar.getViewForItemAt(tabStripItem._index);

		const drawableInfo = this.getIconInfo(tabStripItem, color);
		const imgView = <android.widget.ImageView>tabBarItem.getChildAt(0);
		imgView.setImageDrawable(drawableInfo.drawable);
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

	public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: TextTransform): void {
		const titleLabel = tabStripItem.label;
		const title = getTransformedText(titleLabel.text, value);
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
		// const smoothScroll = false;

		// if (Trace.isEnabled()) {
		//     Trace.write("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
		// }

		if (this.tabStrip) {
			this._bottomNavigationBar.setSelectedPosition(value);
		} else {
			this.changeTab(value);
		}
	}

	[itemsProperty.getDefault](): TabContentItem[] {
		return null;
	}
	[itemsProperty.setNative](value: TabContentItem[]) {
		if (value) {
			value.forEach((item: TabContentItem, i) => {
				(<any>item).index = i;
			});
		}

		selectedIndexProperty.coerce(this);
	}

	[tabStripProperty.getDefault](): TabStrip {
		return null;
	}
	[tabStripProperty.setNative](value: TabStrip) {
		const items = this.tabStrip ? this.tabStrip.items : null;
		this.setTabStripItems(items);
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
