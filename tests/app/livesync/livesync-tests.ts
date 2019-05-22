import * as helper from "../ui/helper";
import * as TKUnit from "../TKUnit";

import * as app from "tns-core-modules/application/application";
import * as frame from "tns-core-modules/ui/frame";

import { Color } from "tns-core-modules/color";
import { isAndroid } from "tns-core-modules/platform";
import { createViewFromEntry } from "tns-core-modules/ui/builder";
import { Page } from "tns-core-modules/ui/page";
import { Frame } from "tns-core-modules/ui/frame";

const appCssFileName = "./app/application.css";
const appNewCssFileName = "./app/app-new.css";
const appNewScssFileName = "./app/app-new.scss";
const buttonCssFileName = "./app/button-page.css";

const buttonPageModuleName = "livesync/livesync-button-page";
const buttonHtmlPageFileName = "./livesync/livesync-button-page.html";
const buttonXmlPageFileName = "./livesync/livesync-button-page.xml";
const buttonJsPageFileName = "./livesync/livesync-button-page.js";
const buttonTsPageFileName = "./livesync/livesync-button-page.ts";
const labelPageModuleName = "livesync/livesync-label-page";

const green = new Color("green");

export function test_onLiveSync_ModuleContext_AppStyle_AppNewCss() {
    _test_onLiveSync_ModuleContext_AppStyle(appNewCssFileName);
}

export function test_onLiveSync_ModuleContext_AppStyle_AppNewScss() {
    _test_onLiveSync_ModuleContext_AppStyle(appNewScssFileName);
}

export function test_onLiveSync_ModuleContext_ContextUndefined() {
    _test_onLiveSync_ModuleContext({ type: undefined, path: undefined });
}

export function test_onLiveSync_ModuleContext_ModuleUndefined() {
    _test_onLiveSync_ModuleContext({ type: "script", path: undefined });
}

export function test_onLiveSync_ModuleContext_Script_JsFile() {
    _test_onLiveSync_ModuleReplace({ type: "script", path: buttonJsPageFileName });
}

export function test_onLiveSync_ModuleContext_Script_TsFile() {
    _test_onLiveSync_ModuleReplace({ type: "script", path: buttonTsPageFileName });
}

export function test_onLiveSync_ModuleContext_Style_CssFile() {
    _test_onLiveSync_ModuleContext_TypeStyle({ type: "style", path: buttonCssFileName });
}

export function test_onLiveSync_ModuleContext_Markup_HtmlFile() {
    _test_onLiveSync_ModuleReplace({ type: "markup", path: buttonHtmlPageFileName });
}

export function test_onLiveSync_ModuleContext_Markup_XmlFile() {
    _test_onLiveSync_ModuleReplace({ type: "markup", path: buttonXmlPageFileName });
}

export function setUp() {
    const labelPage = <Page>createViewFromEntry(({ moduleName: labelPageModuleName }));
    helper.navigate(() => labelPage);
}

export function tearDown() {
    app.setCssFileName(appCssFileName);
}

function _test_onLiveSync_ModuleContext_AppStyle(styleFileName: string) {
    const pageBeforeNavigation = helper.getCurrentPage();
    const buttonPage = <Page>createViewFromEntry(({ moduleName: buttonPageModuleName }));
    helper.navigateWithHistory(() => buttonPage);

    app.setCssFileName(styleFileName);
    const pageBeforeLiveSync = helper.getCurrentPage();
    global.__onLiveSync({ type: "style", path: styleFileName });

    const pageAfterLiveSync = helper.getCurrentPage();
    TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById("button").style.color.toString() === green.toString());
    TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), "Can NOT go back!");
    TKUnit.assertEqual(pageAfterLiveSync, pageBeforeLiveSync, "Pages are different!");
    TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");

    helper.goBack();
    const pageAfterNavigationBack = helper.getCurrentPage();
    TKUnit.assertEqual(pageAfterNavigationBack.getViewById("label").style.color, green, "App styles NOT applied on back navigation!");
    TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, "Pages are different");
    TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");
}

function _test_onLiveSync_ModuleContext(context: { type, path }) {
    const buttonPage = <Page>createViewFromEntry(({ moduleName: buttonPageModuleName }));
    helper.navigateWithHistory(() => buttonPage);
    global.__onLiveSync({ type: context.type, path: context.path });

    TKUnit.waitUntilReady(() => !!frame.topmost());
    const topmostFrame = frame.topmost();
    TKUnit.waitUntilReady(() => topmostFrame.currentPage && topmostFrame.currentPage.isLoaded && !topmostFrame.canGoBack());
    TKUnit.assertTrue(topmostFrame.currentPage.getViewById("label").isLoaded);
}

function _test_onLiveSync_ModuleReplace(context: { type, path }) {
    const pageBeforeNavigation = helper.getCurrentPage();
    const buttonPage = <Page>createViewFromEntry(({ moduleName: buttonPageModuleName }));
    helper.navigateWithHistory(() => buttonPage);

    global.__onLiveSync({ type: context.type, path: context.path });
    const topmostFrame = frame.topmost();
    waitUntilLivesyncComplete(topmostFrame);
    TKUnit.assertTrue(topmostFrame.currentPage.getViewById("button").isLoaded, "Button page is NOT loaded!");
    TKUnit.assertEqual(topmostFrame.backStack.length, 1, "Backstack is clean!");
    TKUnit.assertTrue(topmostFrame.canGoBack(), "Can NOT go back!");

    helper.goBack();
    const pageAfterBackNavigation = helper.getCurrentPage();
    TKUnit.assertTrue(topmostFrame.currentPage.getViewById("label").isLoaded, "Label page is NOT loaded!");
    TKUnit.assertEqual(topmostFrame.backStack.length, 0, "Backstack is NOT clean!");
    TKUnit.assertEqual(pageBeforeNavigation, pageAfterBackNavigation, "Pages are different!");
}

function _test_onLiveSync_ModuleContext_TypeStyle(context: { type, path }) {
    const pageBeforeNavigation = helper.getCurrentPage();
    const buttonPage = <Page>createViewFromEntry(({ moduleName: buttonPageModuleName }));
    helper.navigateWithHistory(() => buttonPage);

    const pageBeforeLiveSync = helper.getCurrentPage();
    pageBeforeLiveSync._moduleName = "button-page";

    global.__onLiveSync({ type: context.type, path: context.path });
    const topmostFrame = frame.topmost();
    waitUntilLivesyncComplete(topmostFrame);

    const pageAfterLiveSync = helper.getCurrentPage();
    TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById("button").style.color.toString() === green.toString());
    TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), "Can NOT go back!");
    TKUnit.assertEqual(topmostFrame.backStack.length, 1, "Backstack is clean!");
    TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");

    helper.goBack();
    const pageAfterNavigationBack = helper.getCurrentPage();
    TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, "Pages are different!");
    TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), "Latest selectors version is NOT applied!");
}

function waitUntilLivesyncComplete(frame: Frame) {
    TKUnit.waitUntilReady(() => frame._executingEntry === null);
}
