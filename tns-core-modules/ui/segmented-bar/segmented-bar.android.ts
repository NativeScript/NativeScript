import { SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty } from "./segmented-bar-common";
import { colorProperty, fontInternalProperty } from "ui/core/view";
import { Color } from "color";
import { Font } from "ui/styling/font";

export * from "./segmented-bar-common";

const R_ID_TABS = 0x01020013;
const R_ID_TABCONTENT = 0x01020011;
const R_ATTR_STATE_SELECTED = 0x010100a1;

// TODO: Make SegmentedBarItem inherit from ViewBase and use ._addView.
// TODO: Move colorProperty.native get/set from SegmentedBar to SegmentedBarItem.
// TODO: Fix selectedIndex coerce implementation.
// TODO: Use addView instead of _parent property. This way
// bindingContext and style propagation will work out fo the box. 

// TODO: Move this into widgets.
let SegmentedBarColorDrawableClass;
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
            let p = new android.graphics.Paint();
            p.setColor(this.getColor());
            p.setStyle(android.graphics.Paint.Style.FILL);
            canvas.drawRect(0, this.getBounds().height() - 15, this.getBounds().width(), this.getBounds().height(), p);
        }
    }

    SegmentedBarColorDrawableClass = SegmentedBarColorDrawable;
}

export class SegmentedBarItem extends SegmentedBarItemBase {
    public _update() {
        if (this._parent && this._parent.android) {
            // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
            // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
            const tabIndex = this._parent.items.indexOf(this);
            const titleTextViewId = 16908310; // http://developer.android.com/reference/android/R.id.html#title
            const titleTextView = <android.widget.TextView>this._parent.android.getTabWidget().getChildAt(tabIndex).findViewById(titleTextViewId);
            titleTextView.setText(this.title || "");
        }
    }
}

@Interfaces([android.widget.TabHost.OnTabChangeListener])
class TabChangeListener implements android.widget.TabHost.OnTabChangeListener {
    constructor(private owner: WeakRef<SegmentedBar>) {
        return global.__native(this);
    }

    onTabChanged(id: string): void {
        let owner = this.owner.get();
        if (owner) {
            owner.selectedIndex = parseInt(id);
        }
    }
}

@Interfaces([android.widget.TabHost.TabContentFactory])
class TabContentFactory implements android.widget.TabHost.TabContentFactory {
    constructor(private owner: WeakRef<SegmentedBar>) {
        return global.__native(this);
    }

    createTabContent(tag: string): android.view.View {
        let owner = this.owner.get();
        if (owner) {
            let tv = new android.widget.TextView(owner._context);
            // TODO: Why do we set it to collapse???
            tv.setVisibility(android.view.View.GONE);
            return tv;
        } else {
            throw new Error(`Invalid owner: ${this.owner}`);
        }
    }
}

export class SegmentedBar extends SegmentedBarBase {
    private _android: android.widget.TabHost;
    private listener: android.widget.TabHost.OnTabChangeListener;
    private tabContentFactory: android.widget.TabHost.TabContentFactory;
    private apiLevel: number;

    public _createUI() {
        ensureTabHostClass();
        ensureSegmentedBarColorDrawableClass();
        if (this.apiLevel === undefined) {
            this.apiLevel = android.os.Build.VERSION.SDK_INT;
        }

        let weakRef = new WeakRef(this);
        this._android = new TabHostClass(this._context, null);
        // We don't have native tabs here.
        // if (typeof this.selectedIndex === "number" && this._android.getCurrentTab() !== this.selectedIndex) {
        //     this._android.setCurrentTab(this.selectedIndex);
        // }
        this.listener = this.listener || new TabChangeListener(weakRef);
        this.tabContentFactory = this.tabContentFactory || new TabContentFactory(weakRef);

        const tabHostLayout = new android.widget.LinearLayout(this._context);
        tabHostLayout.setOrientation(android.widget.LinearLayout.VERTICAL);

        const tabWidget = new android.widget.TabWidget(this._context);
        tabWidget.setId(R_ID_TABS);
        tabHostLayout.addView(tabWidget);

        const frame = new android.widget.FrameLayout(this._context);
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
        tabItem._parent = this;

        const tab = this.android.newTabSpec(this.getValidIndex(index) + "");
        tab.setIndicator(tabItem.title);
        tab.setContent(this.tabContentFactory);

        this.android.addTab(tab);
        // TODO: Why do we need to call this for every added tab?
        this.resetNativeListener();
    }

    private resetNativeListener() {
        this.android.setOnTabChangedListener(null);
        this.android.setOnTabChangedListener(this.listener);
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        let items = this.items;
        if (!items) {
            return;
        }

        if (value >= 0 && value <= (items.length - 1)) {
            this._android.setCurrentTab(value);
            this.notify({ eventName: SegmentedBar.selectedIndexChangedEvent, object: this, oldIndex: this.previousSelectedIndex, newIndex: value });
        }
    }

    private previousItems: SegmentedBarItem[];
    get [itemsProperty.native](): SegmentedBarItem[] {
        return null;
    }
    set [itemsProperty.native](value: SegmentedBarItem[]) {
        const oldItems = this.previousItems;
        if (oldItems) {
            for (let i = 0, length = oldItems.length; i < length; i++) {
                oldItems[i]._parent = null;
            }
        }

        this._android.clearAllTabs();

        const newItems = value;
        this._adjustSelectedIndex(newItems);

        let tabHost = this._android;
        if (newItems && newItems.length) {
            for (let i = 0; i < newItems.length; i++) {
                this.insertTab(newItems[i], i);
            }

            if (this.selectedIndex !== undefined && tabHost.getCurrentTab() !== this.selectedIndex) {
                tabHost.setCurrentTab(this.selectedIndex);
            }

            let color = this.color ? this.color.android : -1;
            for (let i = 0, count = tabHost.getTabWidget().getTabCount(); i < count; i++) {
                let vg = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(i);
                let t = <android.widget.TextView>vg.getChildAt(1);
                if (color > -1) {
                    t.setTextColor(color);
                }

                t.setMaxLines(1);
                t.setEllipsize(android.text.TextUtils.TruncateAt.END);
            }
        }
    }

    get [selectedBackgroundColorProperty.native](): android.graphics.drawable.Drawable[] {
        let tabHost = this._android;
        let result = [];
        for (let i = 0, count = tabHost.getTabWidget().getTabCount(); i < count; i++) {
            let background = tabHost.getTabWidget().getChildTabViewAt(i).getBackground();
            result.push(background);
        }

        return result;
    }
    set [selectedBackgroundColorProperty.native](value: Color | android.graphics.drawable.Drawable[]) {
        let setValue: boolean;
        let color: number;
        if (value instanceof Color) {
            setValue = true;
            color = value.android;
        }
        
        let tabHost = this._android;
        let apiLevel = this.apiLevel;
        for (let i = 0, count = tabHost.getTabWidget().getTabCount(); i < count; i++) {
            let vg = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(i);
            if (setValue) {
                let backgroundDrawable = vg.getBackground();
                if (apiLevel > 21 && backgroundDrawable && typeof backgroundDrawable.setColorFilter === "function") {
                    backgroundDrawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
                } else {
                    let stateDrawable = new android.graphics.drawable.StateListDrawable();

                    let arr = Array.create("int", 1);
                    arr[0] = R_ATTR_STATE_SELECTED;
                    let colorDrawable: android.graphics.drawable.ColorDrawable = new SegmentedBarColorDrawableClass(color);
                    stateDrawable.addState(arr, colorDrawable);
                    stateDrawable.setBounds(0, 15, vg.getRight(), vg.getBottom());

                    if (android.os.Build.VERSION.SDK_INT >= 16) {
                        vg.setBackground(stateDrawable);
                    } else {
                        vg.setBackgroundDrawable(stateDrawable);
                    }
                }
            } else {
                if (apiLevel >= 16) {
                    vg.setBackground(value[i]);
                } else {
                    vg.setBackgroundDrawable(value[i]);
                }
            }
        }
    }

    get [colorProperty.native](): number {
        let textView = new android.widget.TextView(this._context);
        return textView.getCurrentTextColor();
    }
    set [colorProperty.native](value: Color | number) {
        let tabHost = this._android;
        let color = typeof value === "number" ? value : value.android;
        for (let i = 0, count = tabHost.getTabWidget().getTabCount(); i < count; i++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(i);
            let t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(color);
        }
    }

    get [fontInternalProperty.native](): { typeface: android.graphics.Typeface, fontSize: number } {
        let textView = new android.widget.TextView(this._context);
        return {
            typeface: textView.getTypeface(),
            fontSize: textView.getTextSize()
        };
    }
    set [fontInternalProperty.native](value: Font | { typeface: android.graphics.Typeface, fontSize: number }) {
        let typeface: android.graphics.Typeface;
        let fontSize: number;
        let isFont: boolean;
        if (value instanceof Font) {
            isFont = true;
            typeface = value.getAndroidTypeface();
            fontSize = value.fontSize;
        } else {
            typeface = value.typeface;
            fontSize = value.fontSize;
        }

        let tabHost = this._android;
        for (let i = 0, count = tabHost.getTabWidget().getTabCount(); i < count; i++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(i);
            let t = <android.widget.TextView>tab.getChildAt(1);

            t.setTypeface(typeface);

            if (isFont) {
                t.setTextSize(fontSize);
            }
            else {
                t.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, fontSize);
            }
        }
    }
}

let TabHostClass;
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
