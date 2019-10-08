// Types
import { TabNavigationBase as TabNavigationBaseDefinition, SelectedIndexChangedEventData } from ".";
import { TabContentItem } from "../tab-content-item";
import { TabStrip } from "../tab-strip";
import { TabStripItem } from "../tab-strip-item";
import { ViewBase, AddArrayFromBuilder, AddChildFromBuilder, EventData } from "../../core/view";

// Requires
import { View, Property, CoercibleProperty, isIOS, Color } from "../../core/view";

// TODO: Impl trace
// export const traceCategory = "TabView";

const TABID = "_tabId";
const INDEX = "_index";

function getTabById(id: number): any {
    const ref = _tabs.find(ref => {
        const tab = ref.get();

        return tab && tab._domId === id;
    });

    return ref && ref.get();
}

export module knownCollections {
    export const items = "items";
}

export class TabFragmentImplementation extends androidx.fragment.app.Fragment {
    private owner: TabNavigationBase;
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
        const hasRemovingParent = this.getParentFragment() && this.getParentFragment().isRemoving();

        // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
        // TO DO: Consider removing it when update to androidx.fragment:1.2.0
        if (hasRemovingParent && this.owner.selectedIndex === this.index) {
            const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(this.backgroundBitmap);
            this.owner._originalBackground = this.owner.backgroundColor || new Color("White");
            this.owner.nativeViewProtected.setBackgroundDrawable(bitmapDrawable);
            this.backgroundBitmap = null;
        }

        super.onDestroyView();
    }

    public onPause(): void {
        const hasRemovingParent = this.getParentFragment() && this.getParentFragment().isRemoving();

        // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
        // TO DO: Consider removing it when update to androidx.fragment:1.2.0
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

export class TabNavigationBase extends View implements TabNavigationBaseDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabContentItem[];
    public tabStrip: TabStrip;
    public selectedIndex: number;
    public _originalBackground: any;

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabContentItem") {
            if (!this.items) {
                this.items = new Array<TabContentItem>();
            }
            this.items.push(<TabContentItem>value);
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        } else if (name === "TabStrip") {
            // Setting tabStrip will trigger onTabStripChanged
            this.tabStrip = value;
        }
    }

    get _selectedView(): View {
        let selectedIndex = this.selectedIndex;

        return selectedIndex > -1 ? this.items[selectedIndex].content : null;
    }

    get _childrenCount(): number {
        const items = this.items;

        return items ? items.length : 0;
    }

    public onLoaded(): void {
        if (this._originalBackground) {
            this.backgroundColor = null;
            this.backgroundColor = this._originalBackground;
            this._originalBackground = null;
        }

        super.onLoaded();
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
        }

        const tabStrip = this.tabStrip;
        if (tabStrip) {
            callback(tabStrip);
        }
    }

    public eachChildView(callback: (child: View) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item.content);
            });
        }
    }

    public onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void {
        if (oldItems) {
            oldItems.forEach(item => this._removeView(item));
        }

        if (newItems) {
            newItems.forEach(item => {
                if (!item.content) {
                    throw new Error(`TabContentItem must have a content (view).`);
                }

                this._addView(item);
            });
        }
    }

    public onTabStripChanged(oldTabStrip: TabStrip, newTabStrip: TabStrip) {
        if (oldTabStrip && oldTabStrip.parent) {
            this._removeView(oldTabStrip);
        }

        if (newTabStrip) {
            this._addView(newTabStrip);
        }
    }

    public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
        // to be overridden in platform specific files
        this.notify(<SelectedIndexChangedEventData>{ eventName: TabNavigationBase.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
    }

    public getTabBarBackgroundColor(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarBackgroundColor(value: any): void {
        // overridden by inheritors
    }

    public getTabBarFontInternal(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarFontInternal(value: any): void {
        // overridden by inheritors
    }

    public getTabBarTextTransform(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarTextTransform(value: any): void {
        // overridden by inheritors
    }

    public getTabBarHighlightColor(): any {
        // overridden by inheritors
    }

    public setTabBarHighlightColor(value: any) {
        // overridden by inheritors
    }

    public getTabBarColor(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarColor(value: any): void {
        // overridden by inheritors
    }

    public setTabBarItemTitle(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemBackgroundColor(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemColor(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemColor(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public setTabBarIconColor(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemFontSize(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemFontSize(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemFontInternal(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemTextTransform(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }
}

export interface TabNavigationBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

const MIN_ICON_SIZE = 24;
const MAX_ICON_WIDTH = 31;
const MAX_ICON_HEIGHT = 28;

export function getIconSpecSize(size: { width: number, height: number }): { width: number, height: number } {
    const inWidth = size.width;
    const inHeight = size.height;
    let outWidth = 0;
    let outHeight = 0;

    if (inWidth < inHeight) {
        outWidth = MIN_ICON_SIZE;
        outHeight = (inHeight * MIN_ICON_SIZE) / inWidth;
        if (outHeight > MAX_ICON_HEIGHT) {
            outHeight = MAX_ICON_HEIGHT;
            outWidth = (inWidth * MAX_ICON_HEIGHT) / inHeight;
        }
    } else {
        outHeight = MIN_ICON_SIZE;
        outWidth = (inWidth * MIN_ICON_SIZE) / inHeight;
        if (outWidth > MAX_ICON_WIDTH) {
            outWidth = MAX_ICON_WIDTH;
            outHeight = (inHeight * MAX_ICON_WIDTH) / inWidth;
        }
    }

    return { width: outWidth, height: outHeight };
}

export const selectedIndexProperty = new CoercibleProperty<TabNavigationBase, number>({
    name: "selectedIndex", defaultValue: -1, affectsLayout: isIOS,
    valueChanged: (target, oldValue, newValue) => {
        target.onSelectedIndexChanged(oldValue, newValue);
    },
    coerceValue: (target, value) => {
        let items = target.items;
        if (items) {
            let max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        } else {
            value = -1;
        }

        return value;
    },
    valueConverter: (v) => parseInt(v)
});
selectedIndexProperty.register(TabNavigationBase);

export const _tabs = new Array<WeakRef<TabNavigationBase>>();

export const itemsProperty = new Property<TabNavigationBase, TabContentItem[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabNavigationBase);

export const tabStripProperty = new Property<TabNavigationBase, TabStrip>({
    name: "tabStrip", valueChanged: (target, oldValue, newValue) => {
        target.onTabStripChanged(oldValue, newValue);
    }
});
tabStripProperty.register(TabNavigationBase);
