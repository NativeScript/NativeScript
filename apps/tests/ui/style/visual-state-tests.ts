import TKUnit = require("../../TKUnit");
import view = require("ui/core/view");
import page = require("ui/page");
import vsConstants = require("ui/styling/visual-state-constants");
import types = require("utils/types");
import helper = require("../helper");

export var test_VisualStates_Parsed = function () {
    var test = function (views: Array<view.View>) {
        var page = <page.Page>views[0];
        page.css = "button:hovered { color: red; background-color: orange } button:pressed { color: white; background-color: black }";

        var states = page._getStyleScope().getVisualStates(views[1]);
        TKUnit.assert(types.isDefined(states));

        var counter = 0,
            hoveredFound = false,
            pressedFound = false;

        for (var p in states) {
            counter++;
            if (p === vsConstants.Hovered) {
                hoveredFound = true;
            } else if (p === vsConstants.Pressed) {
                pressedFound = true;
            }
        }

        TKUnit.assert(counter === 2);
        TKUnit.assert(hoveredFound);
        TKUnit.assert(pressedFound);
    }

    helper.do_PageTest_WithButton(test);
}

export var test_goToVisualState = function () {
    var test = function (views: Array<view.View>) {
        (<page.Page>views[0]).css = "button:hovered { color: red; background-color: orange } button:pressed { color: white; background-color: black }";

        var btn = views[1];

        btn._goToVisualState("hovered");

        TKUnit.assert(btn.visualState === "hovered");
        TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === "red");
        TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === "orange");

        btn._goToVisualState("pressed");

        TKUnit.assert(btn.visualState === "pressed");
        TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === "white");
        TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === "black");
    }

    helper.do_PageTest_WithButton(test);
}

export var test_goToVisualState_NoState_ShouldResetStyledProperties = function () {
    var test = function (views: Array<view.View>) {
        (<page.Page>views[0]).css = "button:hovered { color: red; background-color: orange }";

        var btn = views[1];

        btn._goToVisualState("hovered");

        TKUnit.assert(btn.visualState === "hovered");
        TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === "red");
        TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === "orange");

        btn._goToVisualState("pressed");

        // since there are no modifiers for the "Pressed" state, the "Normal" state is returned.
        TKUnit.assert(btn.visualState === "normal");

        // properties are reset (set to undefined)
        TKUnit.assert(types.isUndefined(btn.style.color));
        TKUnit.assert(types.isUndefined(btn.style.backgroundColor));
    }

    helper.do_PageTest_WithButton(test);
}

export var test_goToVisualState_NoState_ShouldGoToNormal = function () {
    var test = function (views: Array<view.View>) {
        (<page.Page>views[0]).css = "button { color: orange; background-color: black } button:hovered { color: red; background-color: orange }";

        var btn = views[1];

        btn._goToVisualState("hovered");

        TKUnit.assert(btn.visualState === "hovered");
        TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === "red");
        TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === "orange");

        btn._goToVisualState("pressed");

        // since there are no modifiers for the "Pressed" state, the "Normal" state is returned.
        TKUnit.assert(btn.visualState === "normal");

        // the actual state is "normal" and properties are reverted to these settings (if any)
        TKUnit.assert(types.isDefined(btn.style.color) && btn.style.color.name === "orange");
        TKUnit.assert(types.isDefined(btn.style.backgroundColor) && btn.style.backgroundColor.name === "black");
    }

    helper.do_PageTest_WithButton(test);
} 
