/**
 * @module "ui/utils"
 */

import { View } from "./core/view";

/**
 * String value "ns-" used for CSS class prefix.
 */
export const CSS_CLASS_PREFIX: string;

/**
 * String value "ns-modal" used for default CSS class of a modal root view.
 */
export const MODAL_ROOT_VIEW_CSS_CLASS: string;

/**
 * Array of string values used for CSS classes of a root view.
 * Default value - "ns-root".
 * Platform values: "ns-android" and "ns-ios".
 * Device type values: "ns-phone" and "ns-tablet".
 * Orientation values: "ns-portrait", "ns-landscape" and "ns-unknown".
 */
export const ROOT_VIEW_CSS_CLASSES: string[];

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
