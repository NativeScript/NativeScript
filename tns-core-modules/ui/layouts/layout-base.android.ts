import {
    LayoutBaseCommon, isPassThroughParentEnabledProperty,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length
} from "./layout-base-common";

import { clipToBoundsProperty } from "../styling/style-properties";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon { 

    [isPassThroughParentEnabledProperty.setNative](value: boolean) {
        (<any>this.nativeViewProtected).setPassThroughParent(value);
    }

    [paddingTopProperty.getDefault](): Length {
        return { value: this._defaultPaddingTop, unit: "px" };
    }
    [paddingTopProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this._defaultPaddingRight, unit: "px" };
    }
    [paddingRightProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this._defaultPaddingBottom, unit: "px" };
    }
    [paddingBottomProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this._defaultPaddingLeft, unit: "px" };
    }
    [paddingLeftProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
    }

    [clipToBoundsProperty.setNative](value: boolean) {
        if (this.nativeViewProtected instanceof android.view.ViewGroup) {
            const viewGroup = this.nativeViewProtected as android.view.ViewGroup;

            viewGroup.setClipChildren(value);
            if (!value && viewGroup.getParent() instanceof android.view.ViewGroup) {
                (viewGroup.getParent() as android.view.ViewGroup).setClipChildren(value);
            }
        }
    }

}