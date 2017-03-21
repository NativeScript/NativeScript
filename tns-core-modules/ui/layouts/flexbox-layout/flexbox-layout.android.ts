import {
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent,
    FlexboxLayoutBase, View,
    Length,
    orderProperty, Order,
    flexGrowProperty, FlexGrow,
    flexShrinkProperty, FlexShrink,
    flexWrapBeforeProperty, FlexWrapBefore,
    alignSelfProperty, AlignSelf,
    flexDirectionProperty, flexWrapProperty, justifyContentProperty, alignItemsProperty, alignContentProperty
} from "./flexbox-layout-common";

export * from "./flexbox-layout-common";

function makeNativeSetter<T>(setter: (lp: org.nativescript.widgets.FlexboxLayout.LayoutParams, value: T) => void) {
    return function(this: View, value: T) {
        const nativeView: android.view.View = this._nativeView;
        const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.FlexboxLayout.LayoutParams();
        if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            setter(lp, value);
            nativeView.setLayoutParams(lp);
        }
    }
}

View.prototype[orderProperty.setNative] = makeNativeSetter<Order>((lp, value) => lp.order = value);
View.prototype[flexGrowProperty.setNative] = makeNativeSetter<FlexGrow>((lp, value) => lp.flexGrow = value);
View.prototype[flexShrinkProperty.setNative] = makeNativeSetter<FlexShrink>((lp, value) => lp.flexShrink = value);
View.prototype[flexWrapBeforeProperty.setNative] = makeNativeSetter<FlexWrapBefore>((lp, value) => lp.wrapBefore = value);
View.prototype[alignSelfProperty.setNative] = makeNativeSetter<AlignSelf>((lp, value) => lp.alignSelf = alignSelfMap[value]);

const flexDirectionMap = {
    [FlexDirection.ROW]: 0, //FlexboxLayoutWidget.FLEX_DIRECTION_ROW,
    [FlexDirection.ROW_REVERSE]: 1, //FlexboxLayoutWidget.FLEX_DIRECTION_ROW_REVERSE,
    [FlexDirection.COLUMN]: 2, //FlexboxLayoutWidget.FLEX_DIRECTION_COLUMN,
    [FlexDirection.COLUMN_REVERSE]: 3 //FlexboxLayoutWidget.FLEX_DIRECTION_COLUMN_REVERSE
};

const flexWrapMap = {
    [FlexWrap.NOWRAP]: 0, //FlexboxLayoutWidget.FLEX_WRAP_NOWRAP,
    [FlexWrap.WRAP]: 1, //FlexboxLayoutWidget.FLEX_WRAP_WRAP,
    [FlexWrap.WRAP_REVERSE]: 2 //FlexboxLayoutWidget.FLEX_WRAP_WRAP_REVERSE
}

const justifyContentMap = {
    [JustifyContent.FLEX_START]: 0, //FlexboxLayoutWidget.JUSTIFY_CONTENT_FLEX_START,
    [JustifyContent.FLEX_END]: 1, //FlexboxLayoutWidget.JUSTIFY_CONTENT_FLEX_END,
    [JustifyContent.CENTER]: 2, //FlexboxLayoutWidget.JUSTIFY_CONTENT_CENTER,
    [JustifyContent.SPACE_BETWEEN]: 3, //FlexboxLayoutWidget.JUSTIFY_CONTENT_SPACE_BETWEEN
    [JustifyContent.SPACE_AROUND]: 4 //FlexboxLayoutWidget.JUSTIFY_CONTENT_SPACE_AROUND,
}

const alignItemsMap = {
    [AlignItems.FLEX_START]: 0, //FlexboxLayoutWidget.ALIGN_ITEMS_FLEX_START,
    [AlignItems.FLEX_END]: 1, //FlexboxLayoutWidget.ALIGN_ITEMS_FLEX_END,
    [AlignItems.CENTER]: 2, //FlexboxLayoutWidget.ALIGN_ITEMS_CENTER,
    [AlignItems.BASELINE]: 3, //FlexboxLayoutWidget.ALIGN_ITEMS_BASELINE,
    [AlignItems.STRETCH]: 4 //FlexboxLayoutWidget.ALIGN_ITEMS_STRETCH
}

const alignContentMap = {
    [AlignContent.FLEX_START]: 0, //FlexboxLayoutWidget.ALIGN_CONTENT_FLEX_START,
    [AlignContent.FLEX_END]: 1, //FlexboxLayoutWidget.ALIGN_CONTENT_FLEX_END,
    [AlignContent.CENTER]: 2, //FlexboxLayoutWidget.ALIGN_CONTENT_CENTER,
    [AlignContent.SPACE_BETWEEN]: 3, //FlexboxLayoutWidget.ALIGN_CONTENT_SPACE_BETWEEN,
    [AlignContent.SPACE_AROUND]: 4, //FlexboxLayoutWidget.ALIGN_CONTENT_SPACE_AROUND,
    [AlignContent.STRETCH]: 5 //FlexboxLayoutWidget.ALIGN_CONTENT_STRETCH
}

const alignSelfMap = {
    [AlignSelf.AUTO]: -1, //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_AUTO,
    [AlignSelf.FLEX_START]: 0, //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_FLEX_START,
    [AlignSelf.FLEX_END]: 1, //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_FLEX_END,
    [AlignSelf.CENTER]: 2, //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_CENTER,
    [AlignSelf.BASELINE]: 3, //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_BASELINE,
    [AlignSelf.STRETCH]: 4 //FlexboxLayoutWidget.LayoutParams.ALIGN_SELF_STRETCH
}

export class FlexboxLayout extends FlexboxLayoutBase {
    private _layout: org.nativescript.widgets.FlexboxLayout;

    constructor() {
        super();
    }

    get android(): org.nativescript.widgets.FlexboxLayout { return this._layout; }
    get _nativeView(): org.nativescript.widgets.FlexboxLayout { return this._layout; }

    public _createNativeView() {
        const layout = this._layout = new org.nativescript.widgets.FlexboxLayout(this._context);
        return layout;
    }

    [flexDirectionProperty.getDefault](): FlexDirection {
        return flexDirectionProperty.defaultValue;
    }
    [flexDirectionProperty.setNative](flexDirection: FlexDirection) {
        this.android.setFlexDirection(flexDirectionMap[flexDirection]);
    }

    [flexWrapProperty.getDefault](): FlexWrap {
        return flexWrapProperty.defaultValue;
    }
    [flexWrapProperty.setNative](flexWrap: FlexWrap) {
        this.android.setFlexWrap(flexWrapMap[flexWrap]);
    }

    [justifyContentProperty.getDefault](): JustifyContent {
        return justifyContentProperty.defaultValue;
    }
    [justifyContentProperty.setNative](justifyContent: JustifyContent) {
        this.android.setJustifyContent(justifyContentMap[justifyContent]);
    }

    [alignItemsProperty.getDefault](): AlignItems {
        return alignItemsProperty.defaultValue;
    }
    [alignItemsProperty.setNative](alignItems: AlignItems) {
        this.android.setAlignItems(alignItemsMap[alignItems]);
    }

    [alignContentProperty.getDefault](): AlignContent {
        return alignContentProperty.defaultValue;
    }
    [alignContentProperty.setNative](alignContent: AlignContent) {
        this.android.setAlignContent(alignContentMap[alignContent]);
    }

    public _updateNativeLayoutParams(child: View): void {
        super._updateNativeLayoutParams(child);

        const lp = <org.nativescript.widgets.FlexboxLayout.LayoutParams>child.nativeView.getLayoutParams();
        lp.order = child.order;
        lp.flexGrow = child.flexGrow;
        lp.flexShrink = child.flexShrink;
        lp.wrapBefore = child.flexWrapBefore;
        lp.alignSelf = alignSelfMap[child.alignSelf];
        child.nativeView.setLayoutParams(lp);
    }

    public _setChildMinWidthNative(child: View): void {
        child._setMinWidthNative(0);
        const lp = child.nativeView.getLayoutParams();
        if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            lp.minWidth = Length.toDevicePixels(child.minWidth, 0);
            child.nativeView.setLayoutParams(lp);
        }
    }

    public _setChildMinHeightNative(child: View): void {
        child._setMinHeightNative(0);
        const lp = child.nativeView.getLayoutParams();
        if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            lp.minHeight = Length.toDevicePixels(child.minHeight, 0);
            child.nativeView.setLayoutParams(lp);
        }
    }
}