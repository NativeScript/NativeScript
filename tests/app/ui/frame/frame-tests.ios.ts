import * as frameModule from "ui/frame";
import * as TKUnit from "../../TKUnit";
import { PercentLength, unsetValue } from "ui/core/view";

var uiUtils = require("ui/utils");

export function test_percent_width_and_height_set_to_page_support() {
    let topFrame = frameModule.topmost();
    let currentPage = topFrame.currentPage;

    (<any>currentPage).width = "50%";
    (<any>currentPage).height = "50%";

    TKUnit.waitUntilReady(() => {
        return currentPage.isLayoutValid;
    }, 1);

    let topFrameWidth = topFrame.getMeasuredWidth();
    let topFrameHeight = topFrame.getMeasuredHeight();

    let currentPageWidth = currentPage.getMeasuredWidth();
    let currentPageHeight = currentPage.getMeasuredHeight();

    TKUnit.assertEqual(currentPageWidth, Math.round(topFrameWidth / 2), "Current page measuredWidth incorrect");
    TKUnit.assertEqual(currentPageHeight, Math.round(topFrameHeight / 2), "Current page measuredHeight incorrect");

    //reset values.
    currentPage.height = unsetValue;
    currentPage.width = unsetValue;

    TKUnit.assertTrue(PercentLength.equals(currentPage.width, "auto"));
    TKUnit.assertTrue(PercentLength.equals(currentPage.height, "auto"));
}

export function test_percent_margin_set_to_page_support() {
    let topFrame = frameModule.topmost();
    let currentPage = topFrame.currentPage;
    currentPage.margin = "10%";

    TKUnit.waitUntilReady(() => {
        return currentPage.isLayoutValid;
    }, 1);

    let topFrameWidth = topFrame.getMeasuredWidth();
    let topFrameHeight = topFrame.getMeasuredHeight();

    let currentPageWidth = currentPage.getMeasuredWidth();
    let currentPageHeight = currentPage.getMeasuredHeight()

    let marginLeft = topFrameWidth * 0.1;
    let marginTop = topFrameHeight * 0.1 + uiUtils.ios.getStatusBarHeight();

    let bounds = currentPage._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, Math.round(marginLeft), "Current page LEFT position incorrect");
    TKUnit.assertEqual(bounds.top, Math.round(marginTop), "Current page  TOP position incorrect");
    TKUnit.assertEqual(bounds.right, Math.round(marginLeft + currentPageWidth), "Current page  RIGHT position incorrect");
    TKUnit.assertEqual(bounds.bottom, Math.round(marginTop + currentPageHeight), "Current page  BOTTOM position incorrect");

    //reset values.
    currentPage.margin = "0";

    TKUnit.assertTrue(PercentLength.equals(currentPage.marginLeft, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginTop, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginRight, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginBottom, 0));
}
