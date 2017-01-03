import definition = require("ui/segmented-bar");
import common = require("./segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import view = require("ui/core/view");

const R_ID_TABS = 0x01020013;
const R_ID_TABCONTENT = 0x01020011;
const R_ATTR_STATE_SELECTED = 0x010100a1;

global.moduleMerge(common, exports);

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.android || !view.items) {
        return;
    }

    var index = <number>data.newValue;

    if (types.isNumber(index)) {
        if (index >= 0 && index <= view.items.length - 1) {
            view.android.setCurrentTab(index);
            view.notify({ eventName: SegmentedBar.selectedIndexChangedEvent, object: view, oldIndex: data.oldValue, newIndex: data.newValue });
        } else {
            view.selectedIndex = undefined;
            throw new Error("selectedIndex should be between [0, " + (view.items.length - 1) + "]");
        }
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.android) {
        return;
    }

    var oldItems = <Array<definition.SegmentedBarItem>>data.oldValue;
    if (oldItems && oldItems.length) {
        for (var i = 0; i < oldItems.length; i++) {
            (<SegmentedBarItem>oldItems[i])._parent = null;
        }
    }
    view.android.clearAllTabs();

    var newItems = <Array<definition.SegmentedBarItem>>data.newValue;

    view._adjustSelectedIndex(newItems);

    if (newItems && newItems.length) {
        for (var i = 0; i < newItems.length; i++) {
            view.insertTab((<SegmentedBarItem>newItems[i]), i);
        }

        if (types.isNumber(view.selectedIndex) && view.android.getCurrentTab() !== view.selectedIndex) {
            view.android.setCurrentTab(view.selectedIndex);
        }

        var tabHost = <android.widget.TabHost>view.android;
        var tabIndex: number;

        for (tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tabChild = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tabChild.getChildAt(1);

            if (view.color) {
                t.setTextColor(view.color.android);
            }

            t.setMaxLines(1);
            t.setEllipsize(android.text.TextUtils.TruncateAt.END);
        }
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

var SegmentedBarColorDrawableClass;
function ensureSegmentedBarColorDrawableClass() {
    if (SegmentedBarColorDrawableClass) {
        return;
    }

    class SegmentedBarColorDrawable extends android.graphics.drawable.ColorDrawable {
        constructor(arg: any) {
            super(arg);

            return global.__native(this);
        }

        public draw(canvas: android.graphics.Canvas): void {
            var p = new android.graphics.Paint();
            p.setColor(this.getColor());
            p.setStyle(android.graphics.Paint.Style.FILL);
            canvas.drawRect(0, this.getBounds().height() - 15, this.getBounds().width(), this.getBounds().height(), p);
        }
    }

    SegmentedBarColorDrawableClass = SegmentedBarColorDrawable;
}

export class SegmentedBarItem extends common.SegmentedBarItem {
    public _update() {
        if (this._parent && this._parent.android) {
            // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
            // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
            var tabIndex = this._parent.items.indexOf(this);
            var titleTextViewId = 16908310; // http://developer.android.com/reference/android/R.id.html#title
            var titleTextView = <android.widget.TextView>this._parent.android.getTabWidget().getChildAt(tabIndex).findViewById(titleTextViewId);
            titleTextView.setText(this.title + "");
        }
    }
}

export class SegmentedBar extends common.SegmentedBar {
    private _android: android.widget.TabHost;
    public _listener: android.widget.TabHost.OnTabChangeListener;

    public _createUI() {
        ensureTabHostClass();
        this._android = new TabHostClass(this._context, null);
        if (types.isNumber(this.selectedIndex) && this._android.getCurrentTab() !== this.selectedIndex) {
            this._android.setCurrentTab(this.selectedIndex);
        }

        var that = new WeakRef(this);

        this._listener = new android.widget.TabHost.OnTabChangeListener({
            onTabChanged: function (id: string) {
                var bar = that.get();
                if (bar) {
                    bar.selectedIndex = parseInt(id);
                }
            }
        });

        var tabHostLayout = new android.widget.LinearLayout(this._context);
        tabHostLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

        var tabWidget = new android.widget.TabWidget(this._context);
        tabWidget.setId(R_ID_TABS);
        tabHostLayout.addView(tabWidget);

        var frame = new android.widget.FrameLayout(this._context);
        frame.setId(R_ID_TABCONTENT);
        frame.setVisibility(android.view.View.GONE);
        tabHostLayout.addView(frame);

        this._android.addView(tabHostLayout);
        this._android.setup();
    }

    get android(): android.widget.TabHost {
        return this._android;
    }

    public insertTab(tabItem: SegmentedBarItem, index?: number): void {
        super.insertTab(tabItem, index);
        tabItem._parent = this;

        var tab = this.android.newTabSpec(this.getValidIndex(index) + "");
        tab.setIndicator(tabItem.title + "");
        let that = this;
        tab.setContent(new android.widget.TabHost.TabContentFactory({
            createTabContent: function (tag: string): android.view.View {
                var tv = new android.widget.TextView(that._context);
                tv.setVisibility(android.view.View.GONE);
                return tv;
            }
        }));

        this.android.addTab(tab);
        this.resetNativeListener();
    }

    private resetNativeListener() {
        this.android.setOnTabChangedListener(null);
        this.android.setOnTabChangedListener(this._listener);
    }
}

var TabHostClass;
function ensureTabHostClass() {
    if (TabHostClass) {
        return;
    }

    class OurTabHost extends android.widget.TabHost {
        constructor(context: any, attrs: any) {
            super(context, attrs);

            return global.__native(this);
        }

        protected onAttachedToWindow(): void {
            // overriden to remove the code that will steal the focus from edit fields.
        }
    }

    TabHostClass = OurTabHost;
}

export class SegmentedBarStyler implements style.Styler {
    //Text color methods
    private static setColorProperty(v: view.View, newValue: any) {
        var tabHost = <android.widget.TabHost>v._nativeView;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(newValue);
        }
    }

    private static resetColorProperty(v: view.View, nativeValue: number) {
        var tabHost = <android.widget.TabHost>v._nativeView;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(nativeValue);
        }
    }

    private static getColorProperty(v: view.View): number {
        var tabHost = <android.widget.TabHost>v._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return textView.getCurrentTextColor();
    }

    //Font methods
    private static setFontInternalProperty(v: view.View, newValue: any, nativeValue?: any) {
        let tabHost = <android.widget.TabHost>v._nativeView;
        let fontValue = <font.Font>newValue;

        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            let t = <android.widget.TextView>tab.getChildAt(1);
            let typeface = fontValue.getAndroidTypeface();
            if (typeface) {
                t.setTypeface(typeface);
            }
            else {
                t.setTypeface(nativeValue.typeface);
            }

            if (fontValue.fontSize) {
                t.setTextSize(fontValue.fontSize);
            }
            else {
                t.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
            }
        }
    }

    private static resetFontInternalProperty(v: view.View, nativeValue: any) {
        let tabHost = <android.widget.TabHost>v._nativeView;
        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            let t = <android.widget.TextView>tab.getChildAt(1);
            t.setTypeface(nativeValue.typeface);
            t.setTextSize(nativeValue.size);
        }
    }

    private static getFontInternalProperty(v: view.View): any {
        let tabHost = <android.widget.TabHost>v._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
    }

    // selectedBackgroundColor methods
    private static setSelectedBackgroundColorProperty(v: view.View, newValue: any) {
        ensureSegmentedBarColorDrawableClass();
        let tabHost = <android.widget.TabHost>v._nativeView;
        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let vg = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);

            var backgroundDrawable = vg.getBackground();
            if (android.os.Build.VERSION.SDK_INT > 21 && backgroundDrawable && types.isFunction(backgroundDrawable.setColorFilter)) {
                backgroundDrawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
            } else {
                let stateDrawable = new android.graphics.drawable.StateListDrawable();

                let arr = (<any>Array).create("int", 1);
                arr[0] = R_ATTR_STATE_SELECTED;
                let colorDrawable: android.graphics.drawable.ColorDrawable = new SegmentedBarColorDrawableClass(newValue)
                stateDrawable.addState(arr, colorDrawable);
                stateDrawable.setBounds(0, 15, vg.getRight(), vg.getBottom());

                if (android.os.Build.VERSION.SDK_INT >= 16) {
                    vg.setBackground(stateDrawable);
                } else {
                    vg.setBackgroundDrawable(stateDrawable);
                }
            }
        }
    }

    private static resetSelectedBackgroundColorProperty(v: view.View, nativeValue: Array<android.graphics.drawable.Drawable>) {
        let tabHost = <android.widget.TabHost>v._nativeView;
        ensureSegmentedBarColorDrawableClass();
        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let vg = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);

            if (android.os.Build.VERSION.SDK_INT >= 16) {
                vg.setBackground(nativeValue[tabIndex]);
            } else {
                vg.setBackgroundDrawable(nativeValue[tabIndex]);
            }
        }
    }

    private static getSelectedBackgroundColorProperty(v: view.View): Array<android.graphics.drawable.Drawable> {
        var tabHost = <android.widget.TabHost>v._nativeView;
        let result = [];
        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let background = tabHost.getTabWidget().getChildTabViewAt(tabIndex).getBackground();
            result.push(background);
        }

        return result;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty,
            SegmentedBarStyler.getColorProperty), "SegmentedBar");
        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            SegmentedBarStyler.setFontInternalProperty,
            SegmentedBarStyler.resetFontInternalProperty,
            SegmentedBarStyler.getFontInternalProperty), "SegmentedBar");
        style.registerHandler(style.selectedBackgroundColorProperty, new style.StylePropertyChangedHandler(
            SegmentedBarStyler.setSelectedBackgroundColorProperty,
            SegmentedBarStyler.resetSelectedBackgroundColorProperty,
            SegmentedBarStyler.getSelectedBackgroundColorProperty), "SegmentedBar");
    }
}

SegmentedBarStyler.registerHandlers();
