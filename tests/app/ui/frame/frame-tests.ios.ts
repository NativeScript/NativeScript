import * as frameModule from "ui/frame";
import * as TKUnit from "../../TKUnit";
import * as uiUtils from "ui/utils";
import { PercentLength, unsetValue } from "ui/core/view";

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
    percent_margin_set_to_page_support(false);
}

export function test_percent_margin_set_to_page_support_with_backgroundSpanUnderStatusBar() {
    percent_margin_set_to_page_support(true);
}

function percent_margin_set_to_page_support(backgroundSpanUnderStatusBar: boolean) {
    const topFrame = frameModule.topmost();
    const currentPage = topFrame.currentPage;

    const topFrameWidth = topFrame.getMeasuredWidth();
    const topFrameHeight = topFrame.getMeasuredHeight();
    const statusBar = backgroundSpanUnderStatusBar ? 0 : uiUtils.ios.getStatusBarHeight();

    currentPage.margin = "10%";
    currentPage.backgroundSpanUnderStatusBar = backgroundSpanUnderStatusBar;

    TKUnit.waitUntilReady(() => {
        return currentPage.isLayoutValid;
    }, 1);

    const currentPageWidth = currentPage.getMeasuredWidth();
    const currentPageHeight = currentPage.getMeasuredHeight();
    const marginWidth = Math.round(topFrameWidth * 0.1);
    const marginHeight = Math.round((topFrameHeight - statusBar) * 0.1);

    // expected page size
    TKUnit.assertEqual(currentPageWidth, topFrameWidth - 2 * marginWidth, "Page measure width");
    TKUnit.assertEqual(currentPageHeight, topFrameHeight - 2 * marginHeight - statusBar, "Page measure height");

    // expected page bounds
    const bounds = currentPage._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, Math.round(marginWidth), "Current page LEFT position incorrect");
    TKUnit.assertEqual(bounds.top, Math.round(marginHeight + statusBar), "Current page TOP position incorrect");
    TKUnit.assertEqual(bounds.right, Math.round(marginWidth + currentPageWidth), "Current page RIGHT position incorrect");
    TKUnit.assertEqual(bounds.bottom, Math.round(marginHeight + statusBar + currentPageHeight), "Current page BOTTOM position incorrect");

    //reset values.
    currentPage.margin = "0";
    TKUnit.waitUntilReady(() => {
        return currentPage.isLayoutValid;
    }, 1);

    TKUnit.assertTrue(PercentLength.equals(currentPage.marginLeft, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginTop, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginRight, 0));
    TKUnit.assertTrue(PercentLength.equals(currentPage.marginBottom, 0));
}
