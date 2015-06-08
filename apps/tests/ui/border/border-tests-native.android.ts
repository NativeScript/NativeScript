import borderModule = require("ui/border");
import utils = require("utils/utils");

var density = utils.layout.getDisplayDensity();

export function getNativeBorderWidth(border: borderModule.Border): number {
    var bkg = <any>(<android.view.ViewGroup>border.android).getBackground();

    return bkg && bkg.getStroke ? bkg.getStroke() / density : -1;
}

export function getNativeCornerRadius(border: borderModule.Border): number {
    var bkg = <any>(<android.view.ViewGroup>border.android).getBackground();

    return bkg && bkg.getCornerRadius ? bkg.getCornerRadius() / density : -1;
}

export function checkNativeBorderColor(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.ViewGroup>border.android).getBackground();

    return border.borderColor && bkg && bkg.getBorderColor && bkg.getBorderColor() === border.borderColor.android;
}

export function checkNativeBackgroundColor(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.ViewGroup>border.android).getBackground();

    return border.backgroundColor && bkg && bkg.getBackgroundColor && bkg.getBackgroundColor() === border.backgroundColor.android;
}

export function checkNativeBackgroundImage(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.ViewGroup>border.android).getBackground();

    return bkg && bkg.getBitmap && bkg.getBitmap() !== undefined;
}