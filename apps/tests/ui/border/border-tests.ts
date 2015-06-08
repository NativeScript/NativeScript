import buttonModule = require("ui/button");
import colorModule = require("color");
import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import borderTestsNative = require("./border-tests-native");
import pageModule = require("ui/page");

// <snippet module="ui/border" title="Border">
// # Border
// Using borders requires the "ui/border" module.
// ``` JavaScript
import borderModule = require("ui/border");
// ```

// ### Declaring a Border.
//```XML
//  <Page>
//      <Border cornerRadius="10" borderWidth="1" borderColor="#FF0000">
//          <Button text="OK"/>
//      </Border>
//  </Page>
//```
// </snippet>

function _createBorder(): borderModule.Border {
    // <snippet module="ui/border" title="Border">
    // ### Creating a Border programmatically
    // ``` JavaScript
    var button = new buttonModule.Button();
    button.text = "OK";

    var border = new borderModule.Border();
    border.cornerRadius = 10;
    border.borderWidth = 2;
    border.borderColor = new colorModule.Color("#FF0000");
    border.backgroundColor = new colorModule.Color("#FFFF00");

    border.content = button;
    // ```
    // </snippet>

    return border;
}

export var testBorderWidth = function () {
    helper.buildUIAndRunTest(_createBorder(), function (views: Array<viewModule.View>) {
        var border = <borderModule.Border>views[0];
        var expectedValue = border.borderWidth;
        var actualValue = borderTestsNative.getNativeBorderWidth(border);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testCornerRadius = function () {
    helper.buildUIAndRunTest(_createBorder(), function (views: Array<viewModule.View>) {
        var border = <borderModule.Border>views[0];
        var expectedValue = border.cornerRadius;
        var actualValue = borderTestsNative.getNativeCornerRadius(border);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBorderColor = function () {
    helper.buildUIAndRunTest(_createBorder(), function (views: Array<viewModule.View>) {
        var border = <borderModule.Border>views[0];
        TKUnit.assert(borderTestsNative.checkNativeBorderColor(border), "BorderColor not applied correctly!");
    });
}

export var testBackgroundColor = function () {
    helper.buildUIAndRunTest(_createBorder(), function (views: Array<viewModule.View>) {
        var border = <borderModule.Border>views[0];
        TKUnit.assert(borderTestsNative.checkNativeBackgroundColor(border), "BackgroundColor not applied correctly!");
    });
}

export var testBackgroundImage = function () {
    var border = _createBorder();

    helper.buildUIAndRunTest(border, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        page.css = "Border { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC;') }";

        TKUnit.assert(borderTestsNative.checkNativeBackgroundImage(border), "Style background-image not loaded correctly from data URI.");
    });
}