// Types
import { TabNavigationBase, getIconSpecSize } from "../tab-navigation-base/tab-navigation-base";
import { TextTransform, getTransformedText } from "../text-base/text-base";
import { Color } from "../core/view/view";
import { Frame } from "../frame";
import { Font } from "../styling/font";
import { ImageSource } from "../../image-source/image-source";
import { isFontIconURI, layout } from "../../utils/utils";
import * as application from "../../application/application";
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";
import { itemsProperty, selectedIndexProperty, tabStripProperty } from "../tab-navigation-base/tab-navigation-base";

class IconInfo {
    drawable: android.graphics.drawable.BitmapDrawable;
    height: number;
}

export abstract class TabbableComponent extends TabNavigationBase {
    protected nativeBar: org.nativescript.widgets.TabbableBar;
    public _originalBackground: any;
    protected _textTransform: TextTransform = "uppercase";
    protected _selectedItemColor: Color;
    protected _unSelectedItemColor: Color;
    protected _offscreenTabLimit: number;
    protected _contentViewId: number = -1;

    protected abstract setNativeItems(items: Array<org.nativescript.widgets.TabItemSpec>);
    protected abstract setSelectedItem(value: number);

    public onLoaded(): void {
        super.onLoaded();

        if (this._originalBackground) {
            this.backgroundColor = null;
            this.backgroundColor = this._originalBackground;
            this._originalBackground = null;
        }
    }

    public onUnloaded(): void {
        super.onUnloaded();

        this.setItems(null);
        if (this.tabStrip) {
            this.setTabStripItems(null);
        }
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this._contentViewId < 0) {
            this._contentViewId = android.view.View.generateViewId();
        }

        const nativeView: any = this.nativeViewProtected;
        this.nativeBar = (<any>nativeView).bottomNavigationBar;

        (<any>this.nativeBar).owner = this;
    }

    protected getOffscreenTabLimit(): number {
        return 0;
    }

    public _loadUnloadTabItems(newIndex: number) {
        const items = this.items;
        if (!items) {
            return;
        }

        const lastIndex = items.length - 1;
        const offsideItems = this.getOffscreenTabLimit();

        let toUnload = [];
        let toLoad = [];

        iterateIndexRange(newIndex, offsideItems, lastIndex, (i) => toLoad.push(i));

        items.forEach((item, i) => {
            const indexOfI = toLoad.indexOf(i);
            if (indexOfI < 0) {
                toUnload.push(i);
            }
        });

        toUnload.forEach(index => {
            const item = items[index];
            if (items[index]) {
                item.unloadView(item.content);
            }
        });

        const newItem = items[newIndex];
        const selectedView = newItem && newItem.content;
        if (selectedView instanceof Frame) {
            (<Frame>selectedView)._pushInFrameStackRecursive();
        }

        toLoad.forEach(index => {
            const item = items[index];
            if (this.isLoaded && items[index]) {
                item.loadView(item.content);
            }
        });
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
        for (let fragment of (<Array<any>>fragmentManager.getFragments().toArray())) {
            transaction.remove(fragment);
        }
        transaction.commitNowAllowingStateLoss();
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

    protected setItems(items: Array<TabContentItem>) {
        //overriden
    }

    protected setTabStripItems(items: Array<TabStripItem>) {
        if (!this.tabStrip || !items) {
            this.setNativeItems(null);

            return;
        }

        const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
        items.forEach((tabStripItem, i) => {
            tabStripItem._index = i;
            const tabItemSpec = this.createTabItemSpec(tabStripItem);
            (<any>tabStripItem).tabItemSpec = tabItemSpec;
            tabItems.push(tabItemSpec);
        });

        this.setNativeItems(tabItems);
        this.tabStrip.setNativeView(this.nativeBar);
        items.forEach((item, i, arr) => {
            const textView = this.nativeBar.getTextViewForItemAt(i);
            item.setNativeView(textView);
            this._setItemColor(item);
        });
    }

    public _setItemsColors(items: Array<TabStripItem>): void {
        items.forEach((item) => {
            if (item.nativeView) {
                this._setItemColor(item);
            }
        });
    }

    public setTabBarItemColor(tabStripItem: TabStripItem, value: number | Color): void {
        const itemColor = (tabStripItem._index === this.selectedIndex) ? this._selectedItemColor : this._unSelectedItemColor;
        if (itemColor) {
            // the itemColor is set through the selectedItemColor and unSelectedItemColor properties
            // so it does not respect the css color
            return;
        }

        const androidColor = value instanceof Color ? value.android : value;
        tabStripItem.nativeViewProtected.setTextColor(androidColor);
    }

    public setTabBarIconColor(tabStripItem: TabStripItem, value: number | Color): void {
        const itemColor = (tabStripItem._index === this.selectedIndex) ? this._selectedItemColor : this._unSelectedItemColor;
        if (itemColor) {
            // the itemColor is set through the selectedItemColor and unSelectedItemColor properties
            // so it does not respect the css color
            return;
        }

        this.setIconColor(tabStripItem);
    }

    public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: Font): void {
        if (value.fontSize) {
            tabStripItem.nativeViewProtected.setTextSize(value.fontSize);
        }
        tabStripItem.nativeViewProtected.setTypeface(value.getAndroidTypeface());
    }

    public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: TextTransform): void {
        const nestedLabel = tabStripItem.label;
        const title = getTransformedText(nestedLabel.text, value);
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

    protected updateItem(tabStripItem: TabStripItem): void {
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

    public setTabBarIconSource(tabStripItem: TabStripItem, value: number | Color): void {
        this.updateItem(tabStripItem);
    }

    public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
        this.nativeBar.updateItemAt(index, spec);
    }

    public getTabBarBackgroundColor(): android.graphics.drawable.Drawable {
        return this.nativeBar.getBackground();
    }

    public setTabBarBackgroundColor(value: android.graphics.drawable.Drawable | Color): void {
        if (value instanceof Color) {
            this.nativeBar.setBackgroundColor(value.android);
        } else {
            this.nativeBar.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources()));
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

    public _setItemColor(tabStripItem: TabStripItem) {
        const itemColor = (tabStripItem._index === this.selectedIndex) ? this._selectedItemColor : this._unSelectedItemColor;
        if (!itemColor) {
            return;
        }

        // set label color
        tabStripItem.nativeViewProtected.setTextColor(itemColor.android);

        // set icon color
        this.setIconColor(tabStripItem, itemColor);
    }

    protected setIconColor(tabStripItem: TabStripItem, color?: Color) {
        const tabBarItem = this.nativeBar.getViewForItemAt(tabStripItem._index);

        const drawableInfo = this.getIconInfo(tabStripItem, color);
        const imgView = <android.widget.ImageView>tabBarItem.getChildAt(0);
        imgView.setImageDrawable(drawableInfo.drawable);
        if (color) {
            imgView.setColorFilter(color.android);
        }
    }

    protected createTabItemSpec(tabStripItem: TabStripItem): org.nativescript.widgets.TabItemSpec {
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

    public getTabBarItemTextTransform(tabStripItem: TabStripItem): TextTransform {
        return this.getItemLabelTextTransform(tabStripItem);
    }

    private getItemLabelTextTransform(tabStripItem: TabStripItem): TextTransform {
        const nestedLabel = tabStripItem.label;
        let textTransform: TextTransform = null;
        if (nestedLabel && nestedLabel.style.textTransform !== "initial") {
            textTransform = nestedLabel.style.textTransform;
        } else if (tabStripItem.style.textTransform !== "initial") {
            textTransform = tabStripItem.style.textTransform;
        }

        return textTransform || this._textTransform;
    }

    private getOriginalIcon(tabStripItem: TabStripItem, color?: Color): android.graphics.Bitmap {
        const iconSource = tabStripItem.image && tabStripItem.image.src;
        if (!iconSource) {
            return null;
        }

        let is: ImageSource;
        if (isFontIconURI(iconSource)) {
            const fontIconCode = iconSource.split("//")[1];
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

    private getFixedSizeIcon(image: android.graphics.Bitmap): android.graphics.Bitmap {
        const inWidth = image.getWidth();
        const inHeight = image.getHeight();

        const iconSpecSize = getIconSpecSize({ width: inWidth, height: inHeight });

        const widthPixels = iconSpecSize.width * layout.getDisplayDensity();
        const heightPixels = iconSpecSize.height * layout.getDisplayDensity();

        const scaledImage = android.graphics.Bitmap.createScaledBitmap(image, widthPixels, heightPixels, true);

        return scaledImage;
    }

    protected getIconInfo(tabStripItem: TabStripItem, color?: Color): IconInfo {
        let originalIcon = this.getOriginalIcon(tabStripItem, color);

        return this.getDrawableInfo(originalIcon);
    }

    private getDrawableInfo(image: android.graphics.Bitmap): IconInfo {
        if (image) {
            if (this.tabStrip && this.tabStrip.isIconSizeFixed) {
                image = this.getFixedSizeIcon(image);
            }

            let imageDrawable = new android.graphics.drawable.BitmapDrawable(application.android.context.getResources(), image);

            return {
                drawable: imageDrawable,
                height: image.getHeight()
            };
        }

        return new IconInfo();
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

    [selectedIndexProperty.setNative](value: number) {
        this.setSelectedItem(value);
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

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
    const rangeStart = Math.max(0, index - eps);
    const rangeEnd = Math.min(index + eps, lastIndex);
    for (let i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}