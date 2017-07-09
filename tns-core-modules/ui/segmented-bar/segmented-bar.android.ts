import { Font } from "../styling/font";
import {
    SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty,
    colorProperty, fontInternalProperty, fontSizeProperty, Color, layout
} from "./segmented-bar-common";

export * from "./segmented-bar-common";

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

let apiLevel: number;
let selectedIndicatorThickness: number;

let TabHost: TabHost;
let TabChangeListener: TabChangeListener;
let TabContentFactory: TabContentFactory;

function initializeNativeClasses(): void {
    if (TabChangeListener) {
        return;
    }

    apiLevel = android.os.Build.VERSION.SDK_INT;
    // Indicator thickness for material - 2dip. For pre-material - 5dip. 
    selectedIndicatorThickness = layout.toDevicePixels(apiLevel >= 21 ? 2 : 5);

    @Interfaces([android.widget.TabHost.OnTabChangeListener])
    class TabChangeListenerImpl extends java.lang.Object implements android.widget.TabHost.OnTabChangeListener {
        constructor(public owner: SegmentedBar) {
            super();
            return global.__native(this);
        }

        onTabChanged(id: string): void {
            const owner = this.owner;
            if (owner.shouldChangeSelectedIndex()) {
                owner.selectedIndex = parseInt(id);
            }
        }
    }

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

    class TabHostImpl extends android.widget.TabHost {
        constructor(context: android.content.Context, attrs: android.util.AttributeSet) {
            super(context, attrs);
            return global.__native(this);
        }

        protected onAttachedToWindow(): void {
            // overriden to remove the code that will steal the focus from edit fields.
        }
    }

    TabHost = TabHostImpl;
    TabChangeListener = TabChangeListenerImpl;
    TabContentFactory = TabContentFactoryImpl;
}

export class SegmentedBarItem extends SegmentedBarItemBase {
    nativeView: android.widget.TextView;

    public setupNativeView(tabIndex: number): void {
        // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
        // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
        const titleTextView = <android.widget.TextView>this.parent.nativeView.getTabWidget().getChildAt(tabIndex).findViewById(TITLE_TEXT_VIEW_ID);

        this.setNativeView(titleTextView);
        if (titleTextView) {
            if (this.titleDirty) {
                this._update();
            }
        }
    }

    private titleDirty: boolean;
    public _update(): void {
        const tv = this.nativeView;
        if (tv) {
            let title = this.title;
            title = (title === null || title === undefined) ? "" : title;
            tv.setText(title);
            this.titleDirty = false;
        } else {
            this.titleDirty = true;
        }
    }

    [colorProperty.getDefault](): number {
        return this.nativeView.getCurrentTextColor();
    }
    [colorProperty.setNative](value: Color | number) {
        const color = value instanceof Color ? value.android : value;
        this.nativeView.setTextColor(color);
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        return { nativeSize: this.nativeView.getTextSize() };
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this.nativeView.setTextSize(value);
        } else {
            this.nativeView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    [fontInternalProperty.getDefault](): android.graphics.Typeface {
        return this.nativeView.getTypeface();
    }
    [fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
        this.nativeView.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    [selectedBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable.ConstantState {
        const viewGroup = <android.view.ViewGroup>this.nativeView.getParent();
        return viewGroup.getBackground().getConstantState();
    }
    [selectedBackgroundColorProperty.setNative](value: Color | android.graphics.drawable.Drawable.ConstantState) {
        const viewGroup = <android.view.ViewGroup>this.nativeView.getParent();
        if (value instanceof Color) {
            const color = value.android;
            const backgroundDrawable = viewGroup.getBackground();
            if (apiLevel > 21 && backgroundDrawable && typeof backgroundDrawable.setColorFilter === "function") {
                const newDrawable = backgroundDrawable.getConstantState().newDrawable();
                newDrawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
                org.nativescript.widgets.ViewHelper.setBackground(viewGroup, newDrawable);
            } else {
                const stateDrawable = new android.graphics.drawable.StateListDrawable();
                const colorDrawable: android.graphics.drawable.ColorDrawable = new org.nativescript.widgets.SegmentedBarColorDrawable(color, selectedIndicatorThickness);
                const arr = Array.create("int", 1);
                arr[0] = R_ATTR_STATE_SELECTED;
                stateDrawable.addState(arr, colorDrawable);
                stateDrawable.setBounds(0, 15, viewGroup.getRight(), viewGroup.getBottom());

                org.nativescript.widgets.ViewHelper.setBackground(viewGroup, stateDrawable);
            }
        } else {
            org.nativescript.widgets.ViewHelper.setBackground(viewGroup, value.newDrawable());
        }
    }
}

export class SegmentedBar extends SegmentedBarBase {
    nativeView: android.widget.TabHost;
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

        const listener = new TabChangeListener(this);
        nativeView.setOnTabChangedListener(listener);
        (<any>nativeView).listener = listener;
        nativeView.setup();
        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = this;
        this._tabContentFactory = this._tabContentFactory || new TabContentFactory(this);
    }

    public disposeNativeView() {
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = null;
        super.disposeNativeView();
    }

    private insertTab(tabItem: SegmentedBarItem, index: number): void {
        const tabHost = this.nativeView;
        const tab = tabHost.newTabSpec(index + "");
        tab.setIndicator(tabItem.title + "");
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
        this.nativeView.setCurrentTab(value);
    }

    [itemsProperty.getDefault](): SegmentedBarItem[] {
        return null;
    }
    [itemsProperty.setNative](value: SegmentedBarItem[]) {
        this.nativeView.clearAllTabs();

        const newItems = value;
        if (newItems) {
            newItems.forEach((item, i, arr) => this.insertTab(item, i));
        }

        selectedIndexProperty.coerce(this);
    }
}