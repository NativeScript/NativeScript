declare module "ui/utils" {
    import view = require("ui/core/view");
    module ios {
        /**
         * Gets actual height of a [UIView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/) widget.
         * @param uiView - An instance of UIView.
         */
        export function getActualHeight(uiView: any /* UIView */): number;

        export function _layoutRootView(rootView: view.View, parentBounds: any /* CGRect */): void;

        export function getStatusBarHeight(): number;
    }
}
