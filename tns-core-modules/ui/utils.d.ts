declare module "ui/utils" {
    import { View } from "ui/core/view";
    module ios {
        /**
         * Gets actual height of a [UIView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/) widget.
         * @param uiView - An instance of UIView.
         */
        export function getActualHeight(uiView: any /* UIView */): number;

        export function _layoutRootView(rootView: View, parentBounds: any /* CGRect */): void;

        export function getStatusBarHeight(): number;
    }
}
