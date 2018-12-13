import * as app from "tns-core-modules/application/application";
import * as frame from "tns-core-modules/ui/frame";
import * as helper from "../ui/helper";
import * as TKUnit from "../TKUnit";
import { Button } from "tns-core-modules/ui/button/button";
import { Color } from "tns-core-modules/color";
import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label/label";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";

const appCssFileName = "./app/application.css";
const appNewCssFileName = "./app/app-new.css";
const appNewScssFileName = "./app/app-new.scss";
const appJsFileName = "./app/app.js";
const appTsFileName = "./app/app.ts";
const mainPageCssFileName = "./app/main-page.css";
const mainPageHtmlFileName = "./app/main-page.html";
const mainPageXmlFileName = "./app/main-page.xml";

const green = new Color("green");

const mainPageFactory = function (): Page {
    const page = new Page();
    const stack = new StackLayout();
    const label = new Label();
    label.id = "label";
    label.text = "label";
    stack.addChild(label);
    page.content = stack;
    return page;
}

const pageFactory = function (): Page {
    const page = new Page();
    const stack = new StackLayout();
    const button = new Button();
    button.id = "button";
    button.text = "button";
    stack.addChild(button);
    page.content = stack;
    return page;
}

export function test_onLiveSync_HmrContext_AppStyle_AppNewCss() {
    _test_onLiveSync_HmrContext_AppStyle(appNewCssFileName);
}

export function test_onLiveSync_HmrContext_AppStyle_AppNewScss() {
    _test_onLiveSync_HmrContext_AppStyle(appNewScssFileName);
}

export function test_onLiveSync_HmrContext_ContextUndefined() {
    _test_onLiveSync_HmrContext({ type: undefined, module: undefined });
}

export function test_onLiveSync_HmrContext_ModuleUndefined() {
    _test_onLiveSync_HmrContext({ type: "script", module: undefined });
}

export function test_onLiveSync_HmrContext_Script_AppJs() {
    _test_onLiveSync_HmrContext({ type: "script", module: appJsFileName });
}

export function test_onLiveSync_HmrContext_Script_AppTs() {
    _test_onLiveSync_HmrContext({ type: "script", module: appTsFileName });
}

export function test_onLiveSync_HmrContext_Style_MainPageCss() {
    _test_onLiveSync_HmrContext({ type: "style", module: mainPageCssFileName });
}

export function test_onLiveSync_HmrContext_Markup_MainPageHtml() {
    _test_onLiveSync_HmrContext({ type: "markup", module: mainPageHtmlFileName });
}

export function test_onLiveSync_HmrContext_Markup_MainPageXml() {
    _test_onLiveSync_HmrContext({ type: "markup", module: mainPageXmlFileName });
}

export function setUpModule() {
    helper.navigate(mainPageFactory);
}

export function tearDown() {
    app.setCssFileName(appCssFileName);
}

function _test_onLiveSync_HmrContext_AppStyle(styleFileName: string) {
    const pageBeforeNavigation = helper.getCurrentPage();

    helper.navigateWithHistory(pageFactory);
    app.setCssFileName(styleFileName);

    const pageBeforeLiveSync = helper.getCurrentPage();
    global.__onLiveSync({ type: "style", module: styleFileName });

    const pageAfterLiveSync = helper.getCurrentPage();
    TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById("button").style.color.toString() === green.toString());

    TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), "App styles NOT applied - livesync navigation executed!");
    TKUnit.assertEqual(pageAfterLiveSync, pageBeforeLiveSync, "Pages are different - livesync navigation executed!");
    TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version NOT applied!");

    helper.goBack();

    const pageAfterNavigationBack = helper.getCurrentPage();
    TKUnit.assertEqual(pageAfterNavigationBack.getViewById("label").style.color, green, "App styles NOT applied on back navigation!");
    TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, "Pages are different - livesync navigation executed!");
    TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");
}

function _test_onLiveSync_HmrContext(context: { type, module }) {
    helper.navigateWithHistory(pageFactory);
    global.__onLiveSync({ type: context.type, module: context.module });

    TKUnit.waitUntilReady(() => !!frame.topmost());
    const topmostFrame = frame.topmost();
    TKUnit.waitUntilReady(() => topmostFrame.currentPage && topmostFrame.currentPage.isLoaded && !topmostFrame.canGoBack());
    TKUnit.assertTrue(topmostFrame.currentPage.getViewById("label").isLoaded);
}