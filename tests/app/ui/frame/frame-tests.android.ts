import frameModule = require("ui/frame");
import TKUnit = require("../../TKUnit");
import { widthProperty, heightProperty } from "ui/styling/style";

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

    TKUnit.assertEqual(currentPageWidth, Math.floor(topFrameWidth / 2), "Current page measuredWidth incorrect");
    TKUnit.assertEqual(currentPageHeight, Math.floor(topFrameHeight / 2), "Current page measuredHeight incorrect");

    //reset values.
    (<any>currentPage.style)._resetValue(heightProperty);
    (<any>currentPage.style)._resetValue(widthProperty);

    TKUnit.assert(isNaN(currentPage.width), "width");
    TKUnit.assert(isNaN(currentPage.height), "height");
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
    let marginTop = topFrameHeight * 0.1;

    let bounds = currentPage._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, Math.floor(marginLeft), "Current page LEFT position incorrect");
    TKUnit.assertEqual(bounds.top, Math.floor(marginTop), "Current page  TOP position incorrect");
    TKUnit.assertEqual(bounds.right, Math.floor(marginLeft + currentPageWidth), "Current page  RIGHT position incorrect");
    TKUnit.assertEqual(bounds.bottom, Math.floor(marginTop + currentPageHeight), "Current page  BOTTOM position incorrect");

    //reset values.
    currentPage.margin = "0";

    TKUnit.assertEqual(currentPage.marginLeft, 0, "marginLeft");
    TKUnit.assertEqual(currentPage.marginTop, 0, "marginTop");
    TKUnit.assertEqual(currentPage.marginRight, 0, "marginRight");
    TKUnit.assertEqual(currentPage.marginBottom, 0, "marginBottom");
}