import * as commonTests from "./view-tests-common";
import * as view from "ui/core/view";
import * as grid from "ui/layouts/grid-layout";
import * as color from "color";
import * as helper from "../helper";
import * as TKUnit from "../../TKUnit";
import * as button from "ui/button";

global.moduleMerge(commonTests, exports);

class MyGrid extends grid.GridLayout {
    public backgroundSetterCount: number = 0;

    get [view.backgroundInternalProperty.native](): any {
        return null;
    }
    set [view.backgroundInternalProperty.native](value: any) {
        this.backgroundSetterCount ++;
    }

}

export function getUniformNativeBorderWidth(v: view.View): number {
    return (<UIView>v.ios).layer.borderWidth;
}

export function checkUniformNativeBorderColor(v: view.View): boolean {
    if (v.borderColor instanceof color.Color){
        return (<UIView>v.ios).layer.borderColor === (<color.Color>v.borderColor).ios.CGColor;
    }

    return undefined;
}

export function getUniformNativeCornerRadius(v: view.View): number {
    return (<UIView>v.ios).layer.cornerRadius;
}

export function checkNativeBackgroundColor(v: view.View): boolean {
    if (v.ios instanceof UILabel) {
        var cgColor1 = (<UILabel>v.ios).layer.backgroundColor;
        var cgColor2 = (<UIColor>v.backgroundColor.ios).CGColor;
        return v.backgroundColor && !!CGColorEqualToColor(cgColor1, cgColor2);
    }

    return v.backgroundColor && (<UIView>v.ios).backgroundColor.isEqual(v.backgroundColor.ios);
}

export function checkNativeBackgroundImage(v: view.View): boolean {
    return (<UIView>v.ios).backgroundColor !== undefined;
}

export function testBackgroundInternalChangedOnceOnResize() {

    let root = helper.getCurrentPage();
    let layout = new MyGrid();
    layout.className = "myClass";
    layout.backgroundColor = new color.Color(255, 255, 0, 0);

    root.css = ".myClass { background-image: url('~/tests/logo.png') }";
    root.content = layout;

    function trackCount() {
        let result = layout.backgroundSetterCount;
        layout.backgroundSetterCount = 0;
        return result;
    }

    trackCount();
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
    TKUnit.assertEqual((<UIView>newButton.ios).accessibilityLabel, "Button1", "accessibilityIdentifier not set to native view.");
}
