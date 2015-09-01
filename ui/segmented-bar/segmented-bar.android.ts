import definition = require("ui/segmented-bar");
import common = require("ui/segmented-bar/segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

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
        } else {
            view.selectedIndex = undefined;
            throw new Error("selectedIndex should be between [0, items.length - 1]");
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
            (<SegmentedBarItem>newItems[i])._parent = view;
            var tab = view.android.newTabSpec(i + "");
            tab.setIndicator(newItems[i].title || "");

            tab.setContent(new android.widget.TabHost.TabContentFactory({
                createTabContent: function (tag: string): android.view.View {
                    var tv = new android.widget.TextView(view._context);
                    tv.setVisibility(android.view.View.GONE);
                    return tv;
                }
            }));

            view.android.addTab(tab);
        }

        if (types.isNumber(view.selectedIndex) && view.android.getCurrentTab() !== view.selectedIndex) {
            view.android.setCurrentTab(view.selectedIndex);
        }

        view.android.setOnTabChangedListener(null);
        view.android.setOnTabChangedListener(view._listener);

        var tabHost = <android.widget.TabHost>view.android;
        var tabIndex: number;

        if (view.selectedBackgroundColor) {
            for (tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
                var vg = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);

                var stateDrawable = new android.graphics.drawable.StateListDrawable();

                var arr = java.lang.reflect.Array.newInstance(java.lang.Integer.class.getField("TYPE").get(null), 1);
                arr[0] = (<any>android).R.attr.state_selected;

                var colorDrawable = new SegmentedBarColorDrawable(view.selectedBackgroundColor.android)
                stateDrawable.addState(arr, colorDrawable);
                stateDrawable.setBounds(0, 15, vg.getRight(), vg.getBottom());

                vg.setBackgroundDrawable(stateDrawable);
            }
        }

        for (tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tabChild = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tabChild.getChildAt(1);

            if (view.color) {
                t.setTextColor(view.color.android);
            }
        }
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

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

export class SegmentedBarItem extends common.SegmentedBarItem {
    public _update() {
        if (this._parent && this._parent.android) {
            // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
            // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
            var tabIndex = this._parent.items.indexOf(this);
            var titleTextViewId = 16908310; // http://developer.android.com/reference/android/R.id.html#title
            var titleTextView = <android.widget.TextView>this._parent.android.getTabWidget().getChildAt(tabIndex).findViewById(titleTextViewId);
            titleTextView.setText(this.title || "");
        }
    }
}

export class SegmentedBar extends common.SegmentedBar {
    private _android: OurTabHost;
    public _listener: android.widget.TabHost.OnTabChangeListener;

    public _createUI() {
        this._android = new OurTabHost(this._context, null);
        if (types.isNumber(this.selectedIndex) && this._android.getCurrentTab() !== this.selectedIndex) {
            this._android.setCurrentTab(this.selectedIndex);
        }

        var that = new WeakRef(this);

        this._listener = new android.widget.TabHost.OnTabChangeListener({
            onTabChanged: function (id: string) {
                var bar = that.get();
                if (bar) {
                    var oldIndex = bar.selectedIndex;
                    var newIndex = parseInt(id);

                    if (oldIndex !== newIndex) {
                        bar._onPropertyChangedFromNative(SegmentedBar.selectedIndexProperty, newIndex);
                    }
                }
            }
        });

        var tabHostLayout = new android.widget.LinearLayout(this._context);
        tabHostLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

        var tabWidget = new android.widget.TabWidget(this._context);
        tabWidget.setId((<any>android).R.id.tabs);
        tabHostLayout.addView(tabWidget);

        var frame = new android.widget.FrameLayout(this._context);
        frame.setId((<any>android).R.id.tabcontent);
        frame.setVisibility(android.view.View.GONE);
        tabHostLayout.addView(frame);

        this._android.addView(tabHostLayout);
        this._android.setup();
    }

    get android(): android.widget.TabHost {
        return this._android;
    }
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
