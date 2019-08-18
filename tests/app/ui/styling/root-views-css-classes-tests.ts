import * as helper from "../../ui-helper";
import * as TKUnit from "../../tk-unit";

import { getRootView } from "tns-core-modules/application";
import {
    isAndroid,
    device
} from "tns-core-modules/platform";
import { Button } from "tns-core-modules/ui/button/button";
import { Page } from "tns-core-modules/ui/page";
import {
    ShownModallyData,
    ShowModalOptions,
    topmost,
    View
} from "tns-core-modules/ui/frame";
import {
    _rootModalViews,
    isIOS
} from "tns-core-modules/ui/core/view/view-common";

const ROOT_CSS_CLASS = "ns-root";
const MODAL_CSS_CLASS = "ns-modal";
const PLATFORM_CSS_CLASS = isAndroid ? "ns-android" : "ns-ios";
const DEVICE_TYPE_CSS_CLASS =
    device.deviceType.toLowerCase() === "phone" ? "ns-phone" : "ns-tablet";
const PORTRAIT_ORIENTATION_CSS_CLASS = "ns-portrait";
const LANDSCAPE_ORIENTATION_CSS_CLASS = "ns-landscape";
const UNKNOWN_ORIENTATION_CSS_CLASS = "ns-unknown";

export function test_root_view_css_classes() {
    const rootView = getRootView();
    const rootViewCssClasses = rootView.cssClasses;

    TKUnit.assertTrue(rootViewCssClasses.has(
        ROOT_CSS_CLASS),
        `${ROOT_CSS_CLASS} CSS class is missing`
    );
    TKUnit.assertTrue(rootViewCssClasses.has(
        PLATFORM_CSS_CLASS),
        `${PLATFORM_CSS_CLASS} CSS class is missing`
    );
    TKUnit.assertTrue(rootViewCssClasses.has(
        DEVICE_TYPE_CSS_CLASS),
        `${DEVICE_TYPE_CSS_CLASS} CSS class is missing`
    );
    TKUnit.assertTrue(
        rootViewCssClasses.has(PORTRAIT_ORIENTATION_CSS_CLASS) ||
        rootViewCssClasses.has(LANDSCAPE_ORIENTATION_CSS_CLASS) ||
        rootViewCssClasses.has(UNKNOWN_ORIENTATION_CSS_CLASS),
        "Orientation CSS class is missing"
    );
}

export function test_modal_root_view_css_class() {
    let modalClosed = false;

    const modalCloseCallback = function () {
        modalClosed = true;
    };

    const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
        const page = <Page>args.object;
        page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

        TKUnit.assertTrue(_rootModalViews[0].cssClasses.has(MODAL_CSS_CLASS));
        args.closeCallback();
    };

    const hostNavigatedToEventHandler = function (args) {
        const page = <Page>args.object;
        page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

        const modalPage = new Page();
        modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
        const button = <Button>page.content;
        const options: ShowModalOptions = {
            context: {},
            closeCallback: modalCloseCallback,
            fullscreen: false,
            animated: false
        };
        button.showModal(modalPage, options);
    };

    const hostPageFactory = function (): Page {
        const hostPage = new Page();
        hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

        const button = new Button();
        hostPage.content = button;

        return hostPage;
    };

    helper.navigate(hostPageFactory);
    TKUnit.waitUntilReady(() => modalClosed);
}
