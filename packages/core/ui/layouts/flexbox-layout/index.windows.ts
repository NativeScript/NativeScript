export * from './flexbox-layout-common';

import {
    FlexboxLayoutBase,
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent, AlignSelf,
    flexDirectionProperty, flexWrapProperty, justifyContentProperty,
    alignItemsProperty, alignContentProperty,
    orderProperty, Order,
    flexGrowProperty, FlexGrow,
    flexShrinkProperty, FlexShrink,
    flexWrapBeforeProperty, FlexWrapBefore,
    alignSelfProperty,
    columnGapProperty, rowGapProperty,
} from './flexbox-layout-common';
import { View } from '../../core/view';
import { CoreTypes } from '../../../core-types';

type WidgetFlexboxLayout = NativeScript.Widgets.FlexboxLayout;

const flexDirectionMap: Record<FlexDirection, number> = {
    [FlexDirection.ROW]: 0,
    [FlexDirection.ROW_REVERSE]: 1,
    [FlexDirection.COLUMN]: 2,
    [FlexDirection.COLUMN_REVERSE]: 3,
};

const flexWrapMap: Record<FlexWrap, number> = {
    [FlexWrap.NOWRAP]: 0,
    [FlexWrap.WRAP]: 1,
    [FlexWrap.WRAP_REVERSE]: 2,
};

const justifyContentMap: Record<JustifyContent, number> = {
    [JustifyContent.FLEX_START]: 0,
    [JustifyContent.FLEX_END]: 1,
    [JustifyContent.CENTER]: 2,
    [JustifyContent.SPACE_BETWEEN]: 3,
    [JustifyContent.SPACE_AROUND]: 4,
    [JustifyContent.SPACE_EVENLY]: 5,
};

const alignItemsMap: Record<AlignItems, number> = {
    [AlignItems.FLEX_START]: 0,
    [AlignItems.FLEX_END]: 1,
    [AlignItems.CENTER]: 2,
    [AlignItems.BASELINE]: 3,
    [AlignItems.STRETCH]: 4,
};

const alignContentMap: Record<AlignContent, number> = {
    [AlignContent.FLEX_START]: 0,
    [AlignContent.FLEX_END]: 1,
    [AlignContent.CENTER]: 2,
    [AlignContent.SPACE_BETWEEN]: 3,
    [AlignContent.SPACE_AROUND]: 4,
    [AlignContent.STRETCH]: 5,
    [AlignContent.SPACE_EVENLY]: 6,
};

const alignSelfMap: Record<AlignSelf, number> = {
    [AlignSelf.AUTO]: -1,
    [AlignSelf.FLEX_START]: 0,
    [AlignSelf.FLEX_END]: 1,
    [AlignSelf.CENTER]: 2,
    [AlignSelf.BASELINE]: 3,
    [AlignSelf.STRETCH]: 4,
};

const FlexboxWidget = NativeScript.Widgets.FlexboxLayout;

function makeNativeSetter<T>(setter: (native: Microsoft.UI.Xaml.UIElement, value: T) => void) {
    return function (this: View, value: T) {
        const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
        if (nativeView) {
            setter(nativeView, value);
        }
    };
}

(View.prototype as any)[orderProperty.setNative] = makeNativeSetter<Order>((native, value) => {
    FlexboxWidget.SetOrder(native, value);
});
(View.prototype as any)[flexGrowProperty.setNative] = makeNativeSetter<FlexGrow>((native, value) => {
    FlexboxWidget.SetFlexGrow(native, value);
});
(View.prototype as any)[flexShrinkProperty.setNative] = makeNativeSetter<FlexShrink>((native, value) => {
    FlexboxWidget.SetFlexShrink(native, value);
});
(View.prototype as any)[flexWrapBeforeProperty.setNative] = makeNativeSetter<FlexWrapBefore>((native, value) => {
    FlexboxWidget.SetWrapBefore(native, value);
});
(View.prototype as any)[alignSelfProperty.setNative] = makeNativeSetter<AlignSelf>((native, value) => {
    FlexboxWidget.SetAlignSelf(native, alignSelfMap[value]);
});

export class FlexboxLayout extends FlexboxLayoutBase {
    nativeViewProtected!: WidgetFlexboxLayout;

    public createNativeView(): WidgetFlexboxLayout {
        return new FlexboxWidget() as WidgetFlexboxLayout;
    }

    public onLoaded(): void {
        super.onLoaded();
        // Re-invalidate after entering the visual tree so the C++ MeasureOverride runs
        // with the actual available size rather than the provisional zero-size pass that
        // happens while the native view is still detached from _pageHost.
        try { (this.nativeViewProtected as any)?.InvalidateMeasure(); } catch (_e) {}
    }

    [flexDirectionProperty.getDefault](): FlexDirection {
        return flexDirectionProperty.defaultValue;
    }
    [flexDirectionProperty.setNative](flexDirection: FlexDirection) {
        this.nativeViewProtected.FlexDirection = flexDirectionMap[flexDirection];
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [flexWrapProperty.getDefault](): FlexWrap {
        return flexWrapProperty.defaultValue;
    }
    [flexWrapProperty.setNative](flexWrap: FlexWrap) {
        this.nativeViewProtected.FlexWrap = flexWrapMap[flexWrap];
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [justifyContentProperty.getDefault](): JustifyContent {
        return justifyContentProperty.defaultValue;
    }
    [justifyContentProperty.setNative](justifyContent: JustifyContent) {
        this.nativeViewProtected.JustifyContent = justifyContentMap[justifyContent];
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [alignItemsProperty.getDefault](): AlignItems {
        return alignItemsProperty.defaultValue;
    }
    [alignItemsProperty.setNative](alignItems: AlignItems) {
        this.nativeViewProtected.AlignItems = alignItemsMap[alignItems];
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [alignContentProperty.getDefault](): AlignContent {
        return alignContentProperty.defaultValue;
    }
    [alignContentProperty.setNative](alignContent: AlignContent) {
        this.nativeViewProtected.AlignContent = alignContentMap[alignContent];
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [columnGapProperty.getDefault](): number {
        return 0;
    }
    [columnGapProperty.setNative](value: number) {
        this.nativeViewProtected.ColumnGap = isNaN(value) || value < 0 ? 0 : value;
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    [rowGapProperty.getDefault](): number {
        return 0;
    }
    [rowGapProperty.setNative](value: number) {
        this.nativeViewProtected.RowGap = isNaN(value) || value < 0 ? 0 : value;
        try { (this.nativeViewProtected as any).InvalidateMeasure(); } catch (_e) {}
    }

    public _updateNativeLayoutParams(child: View): void {
        super._updateNativeLayoutParams(child);

        this._setChildMinWidthNative(child, child.minWidth);
        this._setChildMinHeightNative(child, child.minHeight);

        const nativeView = child.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
        if (!nativeView) {
            return;
        }

        const style = child.style;
        FlexboxWidget.SetOrder(nativeView, style.order);
        FlexboxWidget.SetFlexGrow(nativeView, style.flexGrow);
        FlexboxWidget.SetFlexShrink(nativeView, style.flexShrink);
        FlexboxWidget.SetWrapBefore(nativeView, style.flexWrapBefore);
        FlexboxWidget.SetAlignSelf(nativeView, alignSelfMap[style.alignSelf]);

        // Sync flex-basis-percent so MeasureOverride sets item.MainSize = container * pct.
        // widthProperty.setNative also does this on every CSS update, so this covers the case
        // where the child is pre-styled before being added to the layout.
        const w = style.width as any;
        if (w && typeof w === 'object' && w.unit === '%' && w.value > 0) {
            FlexboxWidget.SetFlexBasisPercent(nativeView, w.value * 100);
        } else {
            FlexboxWidget.SetFlexBasisPercent(nativeView, -1);
        }
    }

    public _setChildMinWidthNative(_child: View, _value: CoreTypes.LengthType): void {
        // No-op: the C++ FlexboxLayout panel respects FrameworkElement.MinWidth, which is already
        // set by minWidthProperty.setNative. _setMinWidthNative is not implemented on Windows.
    }

    public _setChildMinHeightNative(_child: View, _value: CoreTypes.LengthType): void {
        // No-op: same reason as _setChildMinWidthNative above.
    }
}
