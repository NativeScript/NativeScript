import {View} from "ui/core/view";
import {
    FlexDirection,
    FlexWrap,
    JustifyContent,
    AlignItems,
    AlignContent,
    AlignSelf,
    FlexboxLayoutBase
} from "./flexbox-layout-common";

export * from "./flexbox-layout-common";

import FlexboxLayoutWidget = org.nativescript.widgets.FlexboxLayout;

const flexDirectionMap = {
    [FlexDirection.ROW]: FlexboxLayoutWidget.FLEX_DIRECTION_ROW,
    [FlexDirection.ROW_REVERSE]: FlexboxLayoutWidget.FLEX_DIRECTION_ROW_REVERSE,
    [FlexDirection.COLUMN]: FlexboxLayoutWidget.FLEX_DIRECTION_COLUMN,
    [FlexDirection.COLUMN_REVERSE]: FlexboxLayoutWidget.FLEX_DIRECTION_COLUMN_REVERSE
}

const flexWrapMap = {
    [FlexWrap.NOWRAP]: FlexboxLayoutWidget.FLEX_WRAP_NOWRAP,
    [FlexWrap.WRAP]: FlexboxLayoutWidget.FLEX_WRAP_WRAP,
    [FlexWrap.WRAP_REVERSE]: FlexboxLayoutWidget.FLEX_WRAP_WRAP_REVERSE
}

const justifyContentMap = {
    [JustifyContent.CENTER]: FlexboxLayoutWidget.JUSTIFY_CONTENT_CENTER,
    [JustifyContent.FLEX_END]: FlexboxLayoutWidget.JUSTIFY_CONTENT_FLEX_END,
    [JustifyContent.FLEX_START]: FlexboxLayoutWidget.JUSTIFY_CONTENT_FLEX_START,
    [JustifyContent.SPACE_AROUND]: FlexboxLayoutWidget.JUSTIFY_CONTENT_SPACE_AROUND,
    [JustifyContent.SPACE_BETWEEN]: FlexboxLayoutWidget.JUSTIFY_CONTENT_SPACE_BETWEEN
}

const alignItemsMap = {
    [AlignItems.BASELINE]: FlexboxLayoutWidget.ALIGN_ITEMS_BASELINE,
    [AlignItems.CENTER]: FlexboxLayoutWidget.ALIGN_ITEMS_CENTER,
    [AlignItems.FLEX_END]: FlexboxLayoutWidget.ALIGN_ITEMS_FLEX_END,
    [AlignItems.FLEX_START]: FlexboxLayoutWidget.ALIGN_ITEMS_FLEX_START,
    [AlignItems.STRETCH]: FlexboxLayoutWidget.ALIGN_ITEMS_STRETCH
}

const alignContentMap = {
    [AlignContent.CENTER]: FlexboxLayoutWidget.ALIGN_CONTENT_CENTER,
    [AlignContent.FLEX_END]: FlexboxLayoutWidget.ALIGN_CONTENT_FLEX_END,
    [AlignContent.FLEX_START]: FlexboxLayoutWidget.ALIGN_CONTENT_FLEX_START,
    [AlignContent.SPACE_AROUND]: FlexboxLayoutWidget.ALIGN_CONTENT_SPACE_AROUND,
    [AlignContent.SPACE_BETWEEN]: FlexboxLayoutWidget.ALIGN_CONTENT_SPACE_BETWEEN,
    [AlignContent.STRETCH]: FlexboxLayoutWidget.ALIGN_CONTENT_STRETCH
}

export class FlexboxLayout extends FlexboxLayoutBase {
    private _layout: FlexboxLayoutWidget;

    constructor() {
        super();
        console.log("New FlexBoxLayout!");
    }

    get android(): FlexboxLayoutWidget { return this._layout; }
    get _nativeView(): FlexboxLayoutWidget { return this._layout; }

    public _createUI() {
        this._layout = new org.nativescript.widgets.FlexboxLayout(this._context);
    }

    protected setNativeFlexDirection(flexDirection: FlexDirection) {
        let value = flexDirectionMap[flexDirection];
        console.log("setNativeFlexDirection: " + flexDirection + " -> " + value);
        this.android.setFlexDirection(value);
    }

    protected setNativeFlexWrap(flexWrap: FlexWrap) {
        console.log("flexWrap: " + flexWrap);
        this.android.setFlexWrap(flexWrapMap[flexWrap]);
    }

    protected setNativeJustifyContent(justifyContent: JustifyContent) {
        console.log("setNativeJustifyContent: " + justifyContent);
        this.android.setJustifyContent(justifyContentMap[justifyContent]);
    }

    protected setNativeAlignItems(alignItems: AlignItems) {
        console.log("setNativeAlignItems: " + alignItems);
        this.android.setAlignItems(alignItemsMap[alignItems]);
    }

    protected setNativeAlignContent(alignContent: AlignContent) {
        console.log("setNativeAlignContent: " + alignContent);
        this.android.setAlignContent(alignContentMap[alignContent]);
    }

    protected onOrderPropertyChanged(view: View, oldValue: number, newValue: number): void {
        console.log("order changed: " + newValue + " " + view);
        this.setLayoutParamsProperty(view, lp => lp.order = newValue);
    }

    protected onFlexGrowPropertyChanged(view: View, oldValue: number, newValue: number): void {
        console.log("flex-grow changed: " + newValue + " " + view);
        this.setLayoutParamsProperty(view, lp => lp.flexGrow = newValue);
    }

    protected onFlexShrinkPropertyChanged(view: View, oldValue: number, newValue: number): void {
        console.log("flex-shrink changed: " + newValue + " " + view);
        this.setLayoutParamsProperty(view, lp => lp.flexShrink = newValue);
    }

    protected onAlignSelfPropertyChanged(view: View, oldValue: AlignSelf, newValue: AlignSelf): void {
        console.log("align-self changed: " + newValue + " " + view);
        // TODO: Map the align self enum:
        // this.setLayoutParamsProperty(view, lp => lp.alignSelf = newValue);
    }

    private setLayoutParamsProperty(view: View, setter: (lp: org.nativescript.widgets.FlexboxLayout.LayoutParams) => void) {
        let nativeView: android.view.View = view._nativeView;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.FlexboxLayout.LayoutParams();
        if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            setter(lp);
            nativeView.setLayoutParams(lp);
        }
    }
}
