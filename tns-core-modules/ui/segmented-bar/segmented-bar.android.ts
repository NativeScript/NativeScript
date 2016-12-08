import {
    SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty,
    colorProperty, fontInternalProperty, Color, Font, applyNativeSetters
} from "./segmented-bar-common";

export * from "./segmented-bar-common";

const R_ID_TABS = 0x01020013;
const R_ID_TABCONTENT = 0x01020011;
const R_ATTR_STATE_SELECTED = 0x010100a1;

// TODO: Make SegmentedBarItem inherit from ViewBase and use ._addView.
// TODO: Move colorProperty.native get/set from SegmentedBar to SegmentedBarItem.
// TODO: Fix selectedIndex coerce implementation.
// TODO: Use addView instead of _parent property. This way
// bindingContext and style propagation will work out fo the box. 

let apiLevel: number;
// TODO: Move this into widgets.
let SegmentedBarColorDrawableClass;
function ensureSegmentedBarColorDrawableClass() {
    if (SegmentedBarColorDrawableClass) {
        return;
    }

    apiLevel = android.os.Build.VERSION.SDK_INT;

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

function setBackground(view: android.view.View, background: android.graphics.drawable.Drawable): void {
    if (apiLevel >= 16) {
        view.setBackground(background);
    } else {
        view.setBackgroundDrawable(background);
    }
}

export class SegmentedBarItem extends SegmentedBarItemBase {
    private _nativeView: android.widget.TextView;

    public setNativeView(textView: android.widget.TextView): void {
        this._nativeView = textView;
        applyNativeSetters(this);
        if (this.titleDirty) {
            this._update();
        }
    }

    private titleDirty: boolean;
    public _update(): void {
        // if (this._parent && this._parent.android) {
        //     // TabHost.TabSpec.setIndicator DOES NOT WORK once the title has been set.
        //     // http://stackoverflow.com/questions/2935781/modify-tab-indicator-dynamically-in-android
        //     const tabIndex = this._parent.items.indexOf(this);
        //     const titleTextViewId = 16908310; // http://developer.android.com/reference/android/R.id.html#title
        //     const titleTextView = <android.widget.TextView>this._parent.android.getTabWidget().getChildAt(tabIndex).findViewById(titleTextViewId);
        //     titleTextView.setText(this.title || "");
        // }

        let tv = this._nativeView;
        if (tv) {
            tv.setText(this.title || "");
            this.titleDirty = false;
        } else {
            this.titleDirty = true;
        }
    }

    get [colorProperty.native](): number {
        return this._nativeView.getCurrentTextColor();
    }
    set [colorProperty.native](value: Color | number) {
        let color = typeof value === "Color" ? value.android : value;
        this._nativeView.setTextColor(color);
    }

    get [fontInternalProperty.native](): { typeface: android.graphics.Typeface, fontSize: number } {
        let textView = this._nativeView;
        return {
            typeface: textView.getTypeface(),
            fontSize: textView.getTextSize()
        };
    }
    set [fontInternalProperty.native](value: Font | { typeface: android.graphics.Typeface, fontSize: number }) {
        let tv = this._nativeView;
        if (value instanceof Font) {
            tv.setTypeface(value.getAndroidTypeface());
            tv.setTextSize(value.fontSize);
        } else {
            tv.setTypeface(value.typeface);
            tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.fontSize);
        }
    }

    get [selectedBackgroundColorProperty.native](): android.graphics.drawable.Drawable {
        let viewGroup = <android.view.ViewGroup>this._nativeView.getParent();
        return viewGroup.getBackground();
    }
    set [selectedBackgroundColorProperty.native](value: Color | android.graphics.drawable.Drawable) {
        let viewGroup = <android.view.ViewGroup>this._nativeView.getParent();
        if (value instanceof Color) {
            let color = value.android;
            let backgroundDrawable = viewGroup.getBackground();
            if (apiLevel > 21 && backgroundDrawable && typeof backgroundDrawable.setColorFilter === "function") {
                backgroundDrawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
            } else {
                let stateDrawable = new android.graphics.drawable.StateListDrawable();

                let arr = Array.create("int", 1);
                arr[0] = R_ATTR_STATE_SELECTED;
                let colorDrawable: android.graphics.drawable.ColorDrawable = new SegmentedBarColorDrawableClass(color);
                stateDrawable.addState(arr, colorDrawable);
                stateDrawable.setBounds(0, 15, viewGroup.getRight(), viewGroup.getBottom());

                setBackground(viewGroup, stateDrawable);
            }
        } else {
            setBackground(viewGroup, value);
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
            let index = parseInt(tag);
            // This is collapsed by default and made visibile 
            // by android when TabItem becomes visible/selected.
            // TODO: Try commenting visigility change.
            tv.setVisibility(android.view.View.GONE);
            tv.setMaxLines(1);
            tv.setEllipsize(android.text.TextUtils.TruncateAt.END);

            (<SegmentedBarItem>owner.items[index]).setNativeView(tv);
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

    public insertTab(tabItem: SegmentedBarItem, index: number): void {
        const tab = this.android.newTabSpec(index + "");
        tab.setIndicator(tabItem.title);
        tab.setContent(this.tabContentFactory);

        let tabHost = this.android;
        tabHost.addTab(tab);

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
        this._android.setCurrentTab(value);
    }

    get [itemsProperty.native](): SegmentedBarItem[] {
        return null;
    }
    set [itemsProperty.native](value: SegmentedBarItem[]) {
        this._android.clearAllTabs();

        const newItems = value;
        let tabHost = this._android;
        if (newItems && newItems.length) {
            for (let i = 0; i < newItems.length; i++) {
                this.insertTab(newItems[i], i);
            }

            if (this.selectedIndex < 0) {
                this.selectedIndex = tabHost.getCurrentTab();
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