/**
 * @module "ui/utils"
 */

import { View } from "./core/view";

export module ios {
    /**
     * Gets actual height of a [UIView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/) widget in device pixels.
     * @param uiView - An instance of UIView.
     */
    export function getActualHeight(uiView: any /* UIView */): number;

    /**
     * Gets the height of the status bar in device pixels.
     * @param viewController when specified it is used to check preferStatusBarHidden property.
     */
    export function getStatusBarHeight(viewController?: any): number;
}
