import borderModule = require("ui/border");

export function getNativeBorderWidth(border: borderModule.Border): number {
    var bkg = <any>(<android.view.View>border.android).getBackground();

    return bkg ? bkg.borderWidth : -1;
}

export function getNativeCornerRadius(border: borderModule.Border): number {
    var bkg = <any>(<android.view.View>border.android).getBackground();

    return bkg ? bkg.cornerRadius : -1;
}

export function checkNativeBorderColor(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.View>border.android).getBackground();

    return border.borderColor && bkg && bkg.borderColor === border.borderColor.android;
}

export function checkNativeBackgroundColor(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.View>border.android).getBackground();

    return border.backgroundColor && bkg && bkg.backgroundColor === border.backgroundColor.android;
}

export function checkNativeBackgroundImage(border: borderModule.Border): boolean {
    var bkg = <any>(<android.view.View>border.android).getBackground();

    return bkg && bkg.bitmap !== undefined;
}