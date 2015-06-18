import commonTests = require("./view-tests-common");
import view = require("ui/core/view");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(commonTests, exports);

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
    return v.backgroundColor && (<UIView>v.ios).backgroundColor.isEqual(v.backgroundColor.ios);
}

export function checkNativeBackgroundImage(v: view.View): boolean {
    return (<UIView>v.ios).backgroundColor !== undefined;
}