import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import observable = require("data/observable");
import color = require("color");
import platform = require("platform");

import {ProxyViewContainer} from "ui/proxy-view-container";
import {View, Button, LayoutBase, StackLayout, GridLayout} from "ui";

export function test_add_children_to_attached_proxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    function testAction(views: Array<viewModule.View>) {
        outer.addChild(createBtn("1"));
        outer.addChild(proxy);
        proxy.addChild(createBtn("2"));
        proxy.addChild(createBtn("3"));
        proxy.addChild(createBtn("4"));

        outer.addChild(createBtn("5"));

        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_children_immediately_registered_in_parent_grid_layout() {
    var outer = new GridLayout();
    var proxy = new ProxyViewContainer();

    function testAction(views: Array<viewModule.View>) {
        outer.addChild(proxy);
        proxy.addChild(createBtn("1"));

        assertNativeChildren(outer, ["1"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_children_registered_in_parent_grid_layout_on_attach() {
    var outer = new GridLayout();
    var proxy = new ProxyViewContainer();

    function testAction(views: Array<viewModule.View>) {
        proxy.addChild(createBtn("1"));
        outer.addChild(proxy);

        assertNativeChildren(outer, ["1"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_add_children_to_detached_proxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    function testAction(views: Array<viewModule.View>) {
        outer.addChild(createBtn("1"));

        proxy.addChild(createBtn("2"));
        proxy.addChild(createBtn("3"));
        proxy.addChild(createBtn("4"));
        outer.addChild(proxy);

        outer.addChild(createBtn("5"));

        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_remove_proxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    outer.addChild(createBtn("1"));

    outer.addChild(proxy);
    proxy.addChild(createBtn("2"));
    proxy.addChild(createBtn("3"));
    proxy.addChild(createBtn("4"));

    outer.addChild(createBtn("5"));

    function testAction(views: Array<viewModule.View>) {
        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
        outer.removeChild(proxy);
        assertNativeChildren(outer, ["1", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_remove_child_of_attached_proxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    outer.addChild(createBtn("1"));

    outer.addChild(proxy);
    proxy.addChild(createBtn("2"));
    var testBtn = createBtn("3")
    proxy.addChild(testBtn);
    proxy.addChild(createBtn("4"));

    outer.addChild(createBtn("5"));

    function testAction(views: Array<viewModule.View>) {
        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
        proxy.removeChild(testBtn);
        assertNativeChildren(outer, ["1", "2", "4", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_insert_inside_porxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    outer.addChild(createBtn("1"));

    outer.addChild(proxy);
    proxy.addChild(createBtn("2"));
    proxy.addChild(createBtn("4"));

    outer.addChild(createBtn("5"));

    function testAction(views: Array<viewModule.View>) {
        assertNativeChildren(outer, ["1", "2", "4", "5"]);
        proxy.insertChild(createBtn("3"), 1);
        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_insert_after_porxy() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    outer.addChild(createBtn("1"));

    outer.addChild(proxy);
    proxy.addChild(createBtn("2"));
    proxy.addChild(createBtn("3"));
    proxy.addChild(createBtn("4"));

    function testAction(views: Array<viewModule.View>) {
        assertNativeChildren(outer, ["1", "2", "3", "4"]);
        outer.insertChild(createBtn("5"), 2);
        assertNativeChildren(outer, ["1", "2", "3", "4", "5"]);
    };

    helper.buildUIAndRunTest(outer, testAction);
}

export function test_proxy_does_not_stop_request_layout_bubble() {
    var outer = new StackLayout();
    var proxy = new ProxyViewContainer();

    outer.addChild(createBtn("1"));
    outer.addChild(proxy);
    var btn = createBtn("2");
    proxy.addChild(btn);

    function testAction(views: Array<viewModule.View>) {
        assertNativeChildren(outer, ["1", "2"]);
        waitUntilElementLayoutIsValid(outer);
        TKUnit.assert(outer.isLayoutValid, "outer container isLayoutValid should be true");
        btn.requestLayout();
        TKUnit.assertFalse(outer.isLayoutValid, "outer container isLayoutValid should be invalidated here");
    };

    helper.buildUIAndRunTest(outer, testAction);
}

function waitUntilElementLayoutIsValid(view: View, timeoutSec?: number): void {
    TKUnit.waitUntilReady(() => {
        return view.isLayoutValid;
    }, timeoutSec || 1);
}

function createBtn(text: string): Button {
    var b = new Button();
    b.text = text;
    return b;
}

function assertNativeChildren(layout: LayoutBase, arr: Array<string>) {
    if (layout.android) {
        let android: org.nativescript.widgets.LayoutBase = layout.android;
        TKUnit.assertEqual(android.getChildCount(), arr.length, "Native children");
        for (let i = 0; i < arr.length; i++) {
            let nativeBtn = <android.widget.Button>android.getChildAt(i);
            TKUnit.assertEqual(nativeBtn.getText(), arr[i]);
        }
    } else if (layout.ios) {
        let ios: UIView = layout.ios;
        TKUnit.assertEqual(ios.subviews.count, arr.length, "Native children");
        for (let i = 0; i < arr.length; i++) {
            let nativeBtn = <UIButton>ios.subviews[i];
            TKUnit.assertEqual(nativeBtn.titleLabel.text, arr[i]);
        }
    } else {
        TKUnit.assert(false, "No native view to assert");
    }
}
