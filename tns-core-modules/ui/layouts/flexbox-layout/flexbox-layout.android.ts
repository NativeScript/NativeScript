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
import {layout} from "utils/utils";

function setLayoutParamsProperty(view: View, setter: (lp: org.nativescript.widgets.FlexboxLayout.LayoutParams) => void) {
    let nativeView: android.view.View = view._nativeView;
    if (nativeView) {
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.FlexboxLayout.LayoutParams();
        if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            setter(lp);
            nativeView.setLayoutParams(lp);
        }
    }
}

export function _onNativeOrderPropertyChanged(view: View, newValue: number): void {
    setLayoutParamsProperty(view, lp => lp.order = newValue);
}

export function _onNativeFlexGrowPropertyChanged(view: View, newValue: number): void {
    setLayoutParamsProperty(view, lp => lp.flexGrow = newValue);
}

export function _onNativeFlexShrinkPropertyChanged(view: View, newValue: number): void {
    setLayoutParamsProperty(view, lp => lp.flexShrink = newValue);
}

export function _onNativeAlignSelfPropertyChanged(view: View, newValue: AlignSelf): void {
    setLayoutParamsProperty(view, lp => lp.alignSelf = alignSelfMap[newValue]);
}

export function _onNativeFlexWrapBeforePropertyChanged(view: View, newValue: boolean): void {
    setLayoutParamsProperty(view, lp => lp.wrapBefore = newValue);
}

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

const alignSelfMap = {
    [AlignSelf.AUTO]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_AUTO,
    [AlignSelf.FLEX_START]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_FLEX_START,
    [AlignSelf.FLEX_END]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_FLEX_END,
    [AlignSelf.CENTER]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_CENTER,
    [AlignSelf.BASELINE]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_BASELINE,
    [AlignSelf.STRETCH]: FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_STRETCH
}

export class FlexboxLayout extends FlexboxLayoutBase {
    private _layout: FlexboxLayoutWidget;

    constructor() {
        super();
    }

    get android(): FlexboxLayoutWidget { return this._layout; }
    get _nativeView(): FlexboxLayoutWidget { return this._layout; }

    public _createUI() {
        this._layout = new org.nativescript.widgets.FlexboxLayout(this._context);
    }

    _setNativeFlexDirection(flexDirection: FlexDirection) {
        let value = flexDirectionMap[flexDirection];
        this.android.setFlexDirection(value);
    }

    _setNativeFlexWrap(flexWrap: FlexWrap) {
        this.android.setFlexWrap(flexWrapMap[flexWrap]);
    }

    _setNativeJustifyContent(justifyContent: JustifyContent) {
        this.android.setJustifyContent(justifyContentMap[justifyContent]);
    }

    _setNativeAlignItems(alignItems: AlignItems) {
        this.android.setAlignItems(alignItemsMap[alignItems]);
    }

    _setNativeAlignContent(alignContent: AlignContent) {
        this.android.setAlignContent(alignContentMap[alignContent]);
    }
}

export function _setAndroidLayoutParams(lp: org.nativescript.widgets.FlexboxLayout.LayoutParams, view: View) {
    lp.order = FlexboxLayout.getOrder(view);
    lp.flexGrow = FlexboxLayout.getFlexGrow(view);
    lp.flexShrink = FlexboxLayout.getFlexShrink(view);
    lp.alignSelf = alignSelfMap[FlexboxLayout.getAlignSelf(view)];
    lp.wrapBefore = FlexboxLayout.getFlexWrapBefore(view);
    lp.minWidth = layout.toDevicePixels(view.minWidth);
    lp.minHeight = layout.toDevicePixels(view.minHeight);
}
