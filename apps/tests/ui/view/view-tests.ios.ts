import commonTests = require("./view-tests-common");
import view = require("ui/core/view");
import grid = require("ui/layouts/grid-layout");
import color = require("color");
import helper = require("../helper");
import TKUnit = require("../../TKUnit");
import button = require("ui/button");

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

export function testBackgroundInternalChangedOnceOnResize() {

    let root = helper.getCurrentPage();
    let layout = new grid.GridLayout();
    layout.className = "myClass";
    layout.backgroundColor = new color.Color(255, 255, 0, 0);

    root.css = ".myClass { background-image: url('~/tests/logo.png') }";
    root.content = layout;

    let sizeChangedCount = 0;
    function trackCount() {
        let result = sizeChangedCount;
        sizeChangedCount = 0;
        return result;
    }

    var base = (<any>layout.style)._applyStyleProperty;
    (<any>layout.style)._applyStyleProperty = function (property) {
        base.apply(layout.style, arguments);
        if (property.name === "_backgroundInternal") {
            ++sizeChangedCount;
        }
    }

    layout.requestLayout();
    layout.layout(0, 0, 200, 200);

    TKUnit.assertEqual(trackCount(), 1, "Expected background to be re-applied at most once when the view is layed-out on 0 0 200 200.");

    layout.requestLayout();
    layout.layout(50, 50, 250, 250);

    TKUnit.assertEqual(trackCount(), 0, "Expected background to NOT change when view is layed-out from 0 0 200 200 to 50 50 250 250.");

    layout.requestLayout();
    layout.layout(0, 0, 250, 250);

    TKUnit.assertEqual(trackCount(), 1, "Expected background to be re-applied at most once when the view is layed-out from 50 50 250 250 to 0 0 250 250.");
}

export function test_automation_text_set_to_native() {
    var newButton = new button.Button();
    newButton.automationText = "Button1";
    TKUnit.assertEqual((<UIView>newButton.ios).accessibilityIdentifier, "Button1", "accessibilityIdentifier not set to native view.");
}