// >> frame-require
import frameModule = require("ui/frame");
var topmost = frameModule.topmost();
// << frame-require

import platform = require("platform");
import labelModule = require("ui/label");
import pagesModule = require("ui/page");
import testModule = require("../../ui-test");
import TKUnit = require("../../TKUnit");
import {widthProperty, heightProperty} from "ui/styling/style"

var uiUtils;
if (platform.isIOS) {
     uiUtils = require("ui/utils");
}

export class FrameTest extends testModule.UITest<frameModule.Frame> {

    public create(): frameModule.Frame {
        return new frameModule.Frame();
    }
    
    public test_percent_width_and_height_set_to_page_support() {
        let topFrame = frameModule.topmost();

        let currentPage = topFrame.currentPage;
        
        (<any>currentPage).width = "50%";
        (<any>currentPage).height = "50%";

        this.waitUntilTestElementLayoutIsValid();

        let topFrameWidth = topFrame.getMeasuredWidth();
        let topFrameHeight = topFrame.getMeasuredHeight();

        let currentPageWidth = currentPage.getMeasuredWidth();
        let currentPageHeight = currentPage.getMeasuredHeight()

        TKUnit.assertEqual(currentPageWidth, Math.round(topFrameWidth / 2), "Current page MeasuredWidth incorrect");
        TKUnit.assertEqual(currentPageHeight, Math.round(topFrameHeight / 2), "Current page MeasuredHeight incorrect");

        //reset values.
        (<any>currentPage.style)._resetValue(heightProperty);
        (<any>currentPage.style)._resetValue(widthProperty);

        TKUnit.assert(isNaN(currentPage.width), "width");
        TKUnit.assert(isNaN(currentPage.height), "height");
    }

    public test_percent_margin_set_to_page_support() {
        let topFrame = frameModule.topmost();

        let currentPage = topFrame.currentPage;

        currentPage.margin = "10%";

        this.waitUntilTestElementLayoutIsValid();

        let topFrameWidth = topFrame.getMeasuredWidth();
        let topFrameHeight = topFrame.getMeasuredHeight();

        let currentPageWidth = currentPage.getMeasuredWidth();
        let currentPageHeight = currentPage.getMeasuredHeight()

        let marginLeft = topFrameWidth * 0.1;
        let marginTop;
        if (uiUtils) {
            marginTop = topFrameHeight * 0.1 + uiUtils.ios.getStatusBarHeight();
        } else {
             marginTop = topFrameHeight * 0.1;
       }

        let bounds = currentPage._getCurrentLayoutBounds();
        TKUnit.assertEqual(bounds.left, Math.round(marginLeft), "Current page LEFT position incorrect");
        TKUnit.assertEqual(bounds.top, Math.round(marginTop), "Current page  TOP position incorrect");
        TKUnit.assertEqual(bounds.right, Math.round(marginLeft + currentPageWidth), "Current page  RIGHT position incorrect");
        TKUnit.assertEqual(bounds.bottom, Math.round(marginTop + currentPageHeight), "Current page  BOTTOM position incorrect");

        //reset values.
        currentPage.margin = "0";

        TKUnit.assertEqual(currentPage.marginLeft, 0, "marginLeft");
        TKUnit.assertEqual(currentPage.marginTop, 0, "marginTop");
        TKUnit.assertEqual(currentPage.marginRight, 0, "marginRight");
        TKUnit.assertEqual(currentPage.marginBottom, 0, "marginBottom");
    }
}

export var ignore_test_DummyTestForSnippetOnly0 = function () {
    // >> frame-navigating
    topmost.navigate("details-page");
    // << frame-navigating
}

export var ignore_test_DummyTestForSnippetOnly1 = function () {
    // >> frame-factory-func
    var factoryFunc = function () {
        var label = new labelModule.Label();
        label.text = "Hello, world!";
        var page = new pagesModule.Page();
        page.content = label;
        return page;
    };
    topmost.navigate(factoryFunc);    
    // <<frame-factory-func
}

export var ignore_test_DummyTestForSnippetOnly2 = function () {
    // >> frame-naventry
    var navigationEntry = {
        moduleName: "details-page",
        context: { info: "something you want to pass to your page" },
        animated: false
    };
    topmost.navigate(navigationEntry);
    // << frame-naventry
}

export var ignore_test_DummyTestForSnippetOnly3 = function () {
    // >> frame-back
    topmost.goBack();
    // << frame-back
}

export function createTestCase(): FrameTest {
    return new FrameTest();
}
