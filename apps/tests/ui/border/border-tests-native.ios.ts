import borderModule = require("ui/border");

export function getNativeBorderWidth(border: borderModule.Border): number {
    return (<UIView>border.ios).layer.borderWidth;
}

export function getNativeCornerRadius(border: borderModule.Border): number {
    return (<UIView>border.ios).layer.cornerRadius;
}

export function checkNativeBorderColor(border: borderModule.Border): boolean {
    return border.borderColor && (<UIView>border.ios).layer.borderColor === border.borderColor.ios.CGColor;
}

export function checkNativeBackgroundColor(border: borderModule.Border): boolean {
    return border.backgroundColor && (<UIView>border.ios).backgroundColor.isEqual(border.backgroundColor.ios);
}

export function checkNativeBackgroundImage(border: borderModule.Border): boolean {
    return (<UIView>border.ios).backgroundColor !== undefined;
}