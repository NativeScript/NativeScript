import { 
    LayoutBaseCommon, clipToBoundsProperty,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length
} from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {

    get [clipToBoundsProperty.native](): boolean {
        return true;
    }
    set [clipToBoundsProperty.native](value: boolean) {
        // TODO: Use ClipRectangle if API > 16! 

        // We can't implement this without calling setClipChildren(false) on every ancestor up in the visual tree, 
        // which will kill performance. It will also lead to unwanted side effects such as other totally unrelated 
        // views being affected by setting the parents' setClipChildren to false. 
        // The problem in Android is that a ViewGroup either clips ALL of its children or it does not. Unlike iOS, the clipping 
        // cannot be controlled on a per view basis. So clipToBounds=false will have to be somehow achieved with stacking different
        // views on top of one another in an AbsoluteLayout or GridLayout. There is always a workaround when playing with layouts.
        //
        // The following article explains this in detail:
        // http://stackoverflow.com/questions/25044085/when-drawing-outside-the-view-clip-bounds-with-android-how-do-i-prevent-underli
        console.warn(`clipToBounds with value false is not supported on Android. You can use this.android.getParent().setClipChildren(false) as an alternative`);
    }

    //PaddingTop
    get [paddingTopProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingTop(this.nativeView), unit: "px" };
    }
    set [paddingTopProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderTopWidth);
    }

    //PaddingRight
    get [paddingRightProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingRight(this.nativeView), unit: "px" };
    }
    set [paddingRightProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderRightWidth);
    }

    //PaddingBottom
    get [paddingBottomProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingBottom(this.nativeView), unit: "px" };
    }
    set [paddingBottomProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderBottomWidth);
    }

    //PaddingLeft
    get [paddingLeftProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingLeft(this.nativeView), unit: "px" };
    }
    set [paddingLeftProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderLeftWidth);
    }
}