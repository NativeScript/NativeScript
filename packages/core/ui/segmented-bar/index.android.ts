import { Font } from '../styling/font';
import { SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty, selectedTextColorProperty } from './segmented-bar-common';
import { AndroidHelper, isEnabledProperty } from '../core/view';
import { colorProperty, fontInternalProperty, fontSizeProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { Trace } from '../../trace';

export * from './segmented-bar-common';

const R_ID_TABS = 0x01020013;
const R_ID_TABCONTENT = 0x01020011;
const R_ATTR_STATE_SELECTED = 0x010100a1;
const TITLE_TEXT_VIEW_ID = 16908310; // http://developer.android.com/reference/android/R.id.html#title

interface TabChangeListener {
	new (owner: SegmentedBar): android.widget.TabHost.OnTabChangeListener;
}

interface TabContentFactory {
	new (owner: SegmentedBar): android.widget.TabHost.TabContentFactory;
}

interface TabHost {
	new (context: android.content.Context, attrs: android.util.AttributeSet): android.widget.TabHost;
}

let selectedIndicatorThickness: number;

let TabHost: TabHost;
let TabChangeListener: TabChangeListener;
let TabContentFactory: TabContentFactory;

// TODO: All TabHost public methods become deprecated in API 30.
function initializeNativeClasses(): void {
	if (TabChangeListener) {
		return;
	}

	// Indicator thickness for material - 2dip. For pre-material - 5dip.
	selectedIndicatorThickness = layout.toDevicePixels(SDK_VERSION >= 21 ? 2 : 5);

	@NativeClass
	@Interfaces([android.widget.TabHost.OnTabChangeListener])
	class TabChangeListenerImpl extends java.lang.Object implements android.widget.TabHost.OnTabChangeListener {
		constructor(public owner: SegmentedBar) {
			super();

			return global.__native(this);
		}

		onTabChanged(id: string): void {
			const owner = this.owner;
			if (owner) {
				setTimeout(() => {
					owner.setTabColor(id);
				});
				if (owner.shouldChangeSelectedIndex()) {
					owner.selectedIndex = parseInt(id);
				}
			}
		}
	}

	@NativeClass
	@Interfaces([android.widget.TabHost.TabContentFactory])
	class TabContentFactoryImpl extends java.lang.Object implements android.widget.TabHost.TabContentFactory {
		constructor(public owner: SegmentedBar) {
			super();

			return global.__native(this);
		}

		createTabContent(tag: string): android.view.View {
			const tv = new android.widget.TextView(this.owner._context);
			// This is collapsed by default and made visible
			// by android when TabItem becomes visible/selected.
			// TODO: Try commenting visibility change.
			tv.setVisibility(android.view.View.GONE);
			tv.setMaxLines(1);
			tv.setEllipsize(android.text.TextUtils.TruncateAt.END);

			return tv;
		}
	}

	@NativeClass
	class TabHostImpl extends android.widget.TabHost {
		constructor(context: android.content.Context, attrs: android.util.AttributeSet) {
			super(context, attrs);

			return global.__native(this);
		}

		public onAttachedToWindow(): void {
			// overriden to remove the code that will steal the focus from edit fields.
		}
	}

	TabHost = TabHostImpl;
	TabChangeListener = TabChangeListenerImpl;
	TabContentFactory = TabContentFactoryImpl;
}

export class SegmentedBarItem extends SegmentedBarItemBase {
	nativeViewProtected: android.widget.TextView;

	public setupNativeView(tabIndex: number): void {
		// TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
		// http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
		const titleTextView = <android.widget.TextView>this.parent.nativeViewProtected.getTabWidget().getChildAt(tabIndex).findViewById(TITLE_TEXT_VIEW_ID);

		this.setNativeView(titleTextView);
		if (titleTextView) {
			if (this.titleDirty) {
				this._update();
			}
		}
	}

	private titleDirty: boolean;
	public _update(): void {
		const tv = this.nativeViewProtected;
		if (tv) {
			let title = this.title;
			title = title === null || title === undefined ? '' : title;
			tv.setText(title);
			this.titleDirty = false;
		} else {
			this.titleDirty = true;
		}
	}

	[colorProperty.getDefault](): number {
		return this.nativeViewProtected.getCurrentTextColor();
	}
	[colorProperty.setNative](value: Color | number) {
		const color = value instanceof Color ? value.android : value;
		this.nativeViewProtected.setTextColor(color);
	}

	[fontSizeProperty.getDefault](): number {
		return this.nativeViewProtected.getTextSize() / layout.getDisplayDensity();
	}
	[fontSizeProperty.setNative](value: number) {
		this.nativeViewProtected.setTextSize(value);
	}

	[fontInternalProperty.getDefault](): android.graphics.Typeface {
		return this.nativeViewProtected.getTypeface();
	}
	[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
		this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
	}

	[selectedBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable {
		const viewGroup = <android.view.ViewGroup>this.nativeViewProtected.getParent();

		return viewGroup.getBackground();
	}
	[selectedBackgroundColorProperty.setNative](value: Color | android.graphics.drawable.Drawable) {
		const nativeView = this.nativeViewProtected;
		const viewGroup = <android.view.ViewGroup>nativeView.getParent();
		if (value instanceof Color) {
			const color = value.android;
			const backgroundDrawable = viewGroup.getBackground();
			if (SDK_VERSION > 21 && backgroundDrawable) {
				const newDrawable = AndroidHelper.getCopyOrDrawable(backgroundDrawable, nativeView.getResources());
				AndroidHelper.setDrawableColor(color, newDrawable);
				viewGroup.setBackground(newDrawable);
			} else {
				const stateDrawable = new android.graphics.drawable.StateListDrawable();
				const colorDrawable: android.graphics.drawable.ColorDrawable = new org.nativescript.widgets.SegmentedBarColorDrawable(color, selectedIndicatorThickness);
				const arr = Array.create('int', 1);
				arr[0] = R_ATTR_STATE_SELECTED;
				stateDrawable.addState(arr, colorDrawable);
				stateDrawable.setBounds(0, 15, viewGroup.getRight(), viewGroup.getBottom());
				viewGroup.setBackground(stateDrawable);
			}
		} else {
			const backgroundDrawable = AndroidHelper.getCopyOrDrawable(value, nativeView.getResources());
			viewGroup.setBackground(backgroundDrawable);
		}
	}
}

export class SegmentedBar extends SegmentedBarBase {
	nativeViewProtected: android.widget.TabHost;
	private _tabContentFactory: android.widget.TabHost.TabContentFactory;
	private _addingTab: boolean;

	public shouldChangeSelectedIndex(): boolean {
		return !this._addingTab;
	}

	public createNativeView() {
		initializeNativeClasses();

		const context: android.content.Context = this._context;
		const nativeView = new TabHost(context, null);

		const tabHostLayout = new android.widget.LinearLayout(context);
		tabHostLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

		const tabWidget = new android.widget.TabWidget(context);
		tabWidget.setId(R_ID_TABS);
		tabHostLayout.addView(tabWidget);

		const frame = new android.widget.FrameLayout(context);
		frame.setId(R_ID_TABCONTENT);
		frame.setVisibility(android.view.View.GONE);
		tabHostLayout.addView(frame);

		nativeView.addView(tabHostLayout);

		return nativeView;
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		const listener = new TabChangeListener(this);
		nativeView.setOnTabChangedListener(listener);
		(<any>nativeView).listener = listener;
		nativeView.setup();
		this._tabContentFactory = this._tabContentFactory || new TabContentFactory(this);
	}

	public disposeNativeView() {
		const nativeView: any = this.nativeViewProtected;
		if (nativeView?.listener) {
			nativeView.listener.owner = null;
		}
		super.disposeNativeView();
	}

	public onLoaded() {
		super.onLoaded();

		// Can only be applied after view is loaded
		const tabWidget = this.nativeViewProtected.getTabWidget();
		if (tabWidget) {
			tabWidget.setEnabled(tabWidget.isEnabled());
		}
	}

	private insertTab(tabItem: SegmentedBarItem, index: number): void {
		const tabHost = this.nativeViewProtected;
		const tab = tabHost.newTabSpec(index + '');
		tab.setIndicator(tabItem.title + '');
		tab.setContent(this._tabContentFactory);

		this._addingTab = true;
		tabHost.addTab(tab);
		tabItem.setupNativeView(index);
		this._addingTab = false;
	}

	[selectedIndexProperty.getDefault](): number {
		return -1;
	}
	[selectedIndexProperty.setNative](value: number) {
		this.nativeViewProtected.setCurrentTab(value);
	}

	[itemsProperty.getDefault](): SegmentedBarItem[] {
		return null;
	}
	[itemsProperty.setNative](value: SegmentedBarItem[]) {
		this.nativeViewProtected.clearAllTabs();

		const newItems = value;
		if (newItems) {
			newItems.forEach((item, i, arr) => this.insertTab(item, i));
		}

		selectedIndexProperty.coerce(this);
	}
	[isEnabledProperty.setNative](value: boolean) {
		const tabWidget = this.nativeViewProtected.getTabWidget();
		if (tabWidget) {
			tabWidget.setEnabled(value);
		}
	}
	public setTabColor(index) {
		try {
			const tabWidget = this.nativeViewProtected?.getTabWidget();
			if (tabWidget) {
				const unselectedTextColor = this.getColorForAndroid(this.color ?? '#6e6e6e');
				const selectedTextColor = this.getColorForAndroid(this?.selectedTextColor ?? '#000000');
				const unselectedBackgroundColor = this.getColorForAndroid(this?.backgroundColor ?? '#dbdbdb');
				const selectedBackgroundColor = this.getColorForAndroid(this?.selectedBackgroundColor ?? this?.backgroundColor ?? 'blue');
				if (tabWidget) {
					for (let i = 0; i < tabWidget.getTabCount(); i++) {
						const view = tabWidget.getChildTabViewAt(i);
						const item = this.items[i];
						const textView = item?.nativeViewProtected;
						view.setBackgroundColor(unselectedBackgroundColor);
						if (textView) {
							textView.setTextColor(unselectedTextColor);
						}
						if (index == i) {
							view.setBackgroundColor(selectedBackgroundColor);
							if (textView) {
								textView.setTextColor(selectedTextColor);
							}
							continue;
						}
					}
				}
			}
		} catch (e) {
			Trace.error(e);
		}
	}
	private getColorForAndroid(color: string | Color): number {
		if (typeof color === 'string') {
			return new Color(color).android;
		} else if (color instanceof Color) {
			return color.android;
		}
	}
}
