import commonTests = require("./view-tests-common");
import view = require("ui/core/view");

global.moduleMerge(commonTests, exports);

export function getNativeBorderWidth(v: view.View): number {
    return (<UIView>v.ios).layer.borderWidth;
}

export function getNativeCornerRadius(v: view.View): number {
    return (<UIView>v.ios).layer.cornerRadius;
}

export function checkNativeBorderColor(v: view.View): boolean {
    return v.borderColor && (<UIView>v.ios).layer.borderColor === v.borderColor.ios.CGColor;
}

export function checkNativeBackgroundColor(v: view.View): boolean {
    if (v.ios instanceof UILabel) {
        var cgColor1 = (<UILabel>v.ios).layer.backgroundColor;
        var cgColor2 = (<UIColor>v.backgroundColor.ios).CGColor;
        return v.backgroundColor && CGColorEqualToColor(cgColor1, cgColor2);
    }

    return v.backgroundColor && (<UIView>v.ios).backgroundColor.isEqual(v.backgroundColor.ios);
}

export function checkNativeBackgroundImage(v: view.View): boolean {
    return (<UIView>v.ios).backgroundColor !== undefined;
}