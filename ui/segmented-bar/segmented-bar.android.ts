import common = require("ui/segmented-bar/segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.android) {
        return;
    }

    var index = <number>data.newValue;
    if (types.isNumber(index) && index >= 0 && index <= view.items.length - 1) {
        view.android.setCurrentTab(index);
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.android) {
        return;
    }

    view.android.clearAllTabs();

    for (var i = 0; i < view.items.length; i++) {
        var title = view.items[i].title;
        var tab = view.android.newTabSpec(i + "");

        tab.setIndicator(title);

        tab.setContent(new android.widget.TabHost.TabContentFactory({
            createTabContent: function (tag: string): android.view.View {
                var tv = new android.widget.TextView(view._context);
                tv.setVisibility(android.view.View.GONE);
                return tv;
            }
        }));

        view.android.addTab(tab);
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

export class SegmentedBar extends common.SegmentedBar {
    private _android: OurTabHost;

    public _createUI() {
        this._android = new OurTabHost(this._context, null);

        var that = new WeakRef(this);

        this._android.setOnTabChangedListener(new android.widget.TabHost.OnTabChangeListener({
            onTabChanged: function (id: string) {
                var bar = that.get();
                if (bar) {
                    bar.selectedIndex = parseInt(id);
                }
            }
        }));

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

    get android(): OurTabHost {
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