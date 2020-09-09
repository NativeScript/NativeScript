import * as helper from '../ui-helper';
import * as TKUnit from '../tk-unit';

import * as app from '@nativescript/core/application';
import * as frame from '@nativescript/core/ui/frame';
import { Color } from '@nativescript/core/color';
import { Builder } from '@nativescript/core/ui/builder';
import { Page } from '@nativescript/core/ui/page';
import { Frame } from '@nativescript/core/ui/frame';

const LIVESYNC_FOLDER = 'livesync/';

const appCssFileName = `${LIVESYNC_FOLDER}application-page.css`;
const appNewCssFileName = `${LIVESYNC_FOLDER}app-new-page.css`;
// `.scss` module registers in webpack as `.css`
// https://github.com/NativeScript/NativeScript/blob/5.4.2/@nativescript/core/globals/globals.ts#L32-L33
const appNewScssFileNameAsCss = `${LIVESYNC_FOLDER}app-new-scss-page.css`;
const appNewScssFileName = `${LIVESYNC_FOLDER}app-new-scss-page.scss`;

const buttonCssModuleName = `${LIVESYNC_FOLDER}button-css-page`;
const buttonScssModuleName = `${LIVESYNC_FOLDER}button-scss-page`;
const buttonCssFileName = `${LIVESYNC_FOLDER}button-css-page.css`;
const buttonScssFileName = `${LIVESYNC_FOLDER}button-scss-page.scss`;

const buttonPageModuleName = `${LIVESYNC_FOLDER}livesync-button-page`;
const buttonHtmlPageFileName = `${LIVESYNC_FOLDER}livesync-button-page.html`;
const buttonXmlPageFileName = `${LIVESYNC_FOLDER}livesync-button-page.xml`;
const buttonJsPageFileName = `${LIVESYNC_FOLDER}livesync-button-page.js`;
const buttonTsPageFileName = `${LIVESYNC_FOLDER}livesync-button-page.ts`;
const buttonScssPageFileName = `${LIVESYNC_FOLDER}livesync-button-page.scss`;
const labelPageModuleName = `${LIVESYNC_FOLDER}livesync-label-page`;

const modalViewPageModuleName = `${LIVESYNC_FOLDER}livesync-modal-view-page`;
const modalViewXmlPageFileName = `${LIVESYNC_FOLDER}livesync-modal-view-page.xml`;
const modalViewJsPageFileName = `${LIVESYNC_FOLDER}livesync-modal-view-page.js`;
const modalViewTsPageFileName = `${LIVESYNC_FOLDER}livesync-modal-view-page.ts`;
const modalViewScssPageFileName = `${LIVESYNC_FOLDER}livesync-modal-view-page.scss`;
const modalViewCssFileName = `${LIVESYNC_FOLDER}livesync-modal-view-page.css`;

const green = new Color('green');

export function setUp() {
	const labelPage = <Page>Builder.createViewFromEntry({ moduleName: labelPageModuleName });
	helper.navigate(() => labelPage);
}

export function tearDown() {
	app.setCssFileName(appCssFileName);
}

export function test_onLiveSync_ModuleContext_AppStyle_AppNewCss() {
	_test_onLiveSync_ModuleContext_AppStyle(appNewCssFileName, appNewCssFileName);
}

export function test_onLiveSync_ModuleContext_AppStyle_AppNewScss() {
	_test_onLiveSync_ModuleContext_AppStyle(appNewScssFileNameAsCss, appNewScssFileName);
}

export function test_onLiveSync_ModuleContext_Undefined() {
	_test_onLiveSync_ModuleContext({ type: undefined, path: undefined });
}

export function test_onLiveSync_ModuleContext_PathUndefined() {
	_test_onLiveSync_ModuleContext({ type: 'script', path: undefined });
}

export function test_onLiveSync_ModuleContext_Script_JsFile() {
	_test_onLiveSync_ModuleReplace({ type: 'script', path: buttonJsPageFileName });
}

export function test_onLiveSync_ModuleContext_Script_TsFile() {
	_test_onLiveSync_ModuleReplace({ type: 'script', path: buttonTsPageFileName });
}

export function test_onLiveSync_ModuleContext_Style_CssFile() {
	_test_onLiveSync_ModuleContext_TypeStyle(buttonCssModuleName, buttonCssFileName);
}

export function test_onLiveSync_ModuleContext_Style_ScssFile() {
	_test_onLiveSync_ModuleContext_TypeStyle(buttonScssModuleName, buttonScssFileName);
}

export function test_onLiveSync_ModuleContext_Markup_HtmlFile() {
	_test_onLiveSync_ModuleReplace({ type: 'markup', path: buttonHtmlPageFileName });
}

export function test_onLiveSync_ModuleContext_Markup_XmlFile() {
	_test_onLiveSync_ModuleReplace({ type: 'markup', path: buttonXmlPageFileName });
}

export function test_onLiveSync_ModuleContext_MarkupXml_ScriptTs_Files() {
	_test_onLiveSync_ModuleReplace_Multiple([
		{ type: 'script', path: buttonTsPageFileName },
		{ type: 'markup', path: buttonXmlPageFileName },
	]);
}

export function test_onLiveSync_ModuleContext_MarkupXml_ScriptTs_StyleScss_Files() {
	_test_onLiveSync_ModuleReplace_Multiple([
		{ type: 'script', path: buttonTsPageFileName },
		{ type: 'markup', path: buttonXmlPageFileName },
		{ type: 'style', path: buttonScssPageFileName },
	]);
}

export function test_onLiveSync_ModuleContext_MarkupHtml_ScriptTs_Files() {
	_test_onLiveSync_ModuleReplace_Multiple([
		{ type: 'script', path: buttonTsPageFileName },
		{ type: 'markup', path: buttonHtmlPageFileName },
	]);
}

export function test_onLiveSync_ModuleContext_MarkupHtml_ScriptTs_StyleScss_Files() {
	_test_onLiveSync_ModuleReplace_Multiple([
		{ type: 'script', path: buttonTsPageFileName },
		{ type: 'markup', path: buttonHtmlPageFileName },
		{ type: 'style', path: buttonScssPageFileName },
	]);
}

export function test_onLiveSync_ModalViewClosed_MarkupXml() {
	_test_onLiveSync_ModalViewClosed({ type: 'markup', path: modalViewXmlPageFileName });
}

export function test_onLiveSync_ModalViewClosed_ScriptTs() {
	_test_onLiveSync_ModalViewClosed({ type: 'script', path: modalViewTsPageFileName });
}

export function test_onLiveSync_ModalViewClosed_ScriptJs() {
	_test_onLiveSync_ModalViewClosed({ type: 'script', path: modalViewJsPageFileName });
}

export function test_onLiveSync_ModalViewClosed_StyleCss() {
	_test_onLiveSync_ModalViewClosed({ type: 'style', path: modalViewCssFileName });
}

export function test_onLiveSync_ModalViewClosed_StyleScss() {
	_test_onLiveSync_ModalViewClosed({ type: 'style', path: modalViewScssPageFileName });
}

function _test_onLiveSync_ModuleContext_AppStyle(appStyleFileName: string, livesyncStyleFileName: string) {
	const pageBeforeNavigation = helper.getCurrentPage();
	const buttonPage = <Page>Builder.createViewFromEntry({ moduleName: buttonPageModuleName });
	helper.navigateWithHistory(() => buttonPage);

	app.setCssFileName(appStyleFileName);
	const pageBeforeLiveSync = helper.getCurrentPage();
	livesync({ type: 'style', path: livesyncStyleFileName });

	const pageAfterLiveSync = helper.getCurrentPage();
	TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById('button').style.color.toString() === green.toString());
	TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), 'Can NOT go back!');
	TKUnit.assertEqual(pageAfterLiveSync, pageBeforeLiveSync, 'Pages are different!');
	TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), 'Latest selectors version is NOT applied!');

	helper.goBack();
	const pageAfterNavigationBack = helper.getCurrentPage();
	TKUnit.assertEqual(pageAfterNavigationBack.getViewById('label').style.color, green, 'App styles NOT applied on back navigation!');
	TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, 'Pages are different');
	TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), 'Latest selectors version is NOT applied!');
}

function _test_onLiveSync_ModuleContext(context: ModuleContext) {
	const buttonPage = <Page>Builder.createViewFromEntry({ moduleName: buttonPageModuleName });
	helper.navigateWithHistory(() => buttonPage);
	livesync({ type: context.type, path: context.path });

	TKUnit.waitUntilReady(() => !!Frame.topmost());
	const topmostFrame = Frame.topmost();
	TKUnit.waitUntilReady(() => topmostFrame.currentPage && topmostFrame.currentPage.isLoaded && !topmostFrame.canGoBack());
	TKUnit.assertTrue(topmostFrame.currentPage.getViewById('label').isLoaded);
}

function _test_onLiveSync_ModuleReplace(context: ModuleContext) {
	const pageBeforeNavigation = helper.getCurrentPage();
	const buttonPage = <Page>Builder.createViewFromEntry({ moduleName: buttonPageModuleName });
	helper.navigateWithHistory(() => buttonPage);

	livesync({ type: context.type, path: context.path });
	const topmostFrame = Frame.topmost();
	waitUntilLivesyncComplete(topmostFrame);
	TKUnit.assertTrue(topmostFrame.currentPage.getViewById('button').isLoaded, 'Button page is NOT loaded!');
	TKUnit.assertEqual(topmostFrame.backStack.length, 1, 'Backstack is clean!');
	TKUnit.assertTrue(topmostFrame.canGoBack(), 'Can NOT go back!');

	helper.goBack();
	const pageAfterBackNavigation = helper.getCurrentPage();
	TKUnit.assertTrue(topmostFrame.currentPage.getViewById('label').isLoaded, 'Label page is NOT loaded!');
	TKUnit.assertEqual(topmostFrame.backStack.length, 0, 'Backstack is NOT clean!');
	TKUnit.assertEqual(pageBeforeNavigation, pageAfterBackNavigation, 'Pages are different!');
}

function _test_onLiveSync_ModuleContext_TypeStyle(styleModuleName: string, livesyncStyleFileName: string) {
	const pageBeforeNavigation = helper.getCurrentPage();
	const buttonPage = <Page>Builder.createViewFromEntry({ moduleName: buttonPageModuleName });
	helper.navigateWithHistory(() => buttonPage);

	const pageBeforeLiveSync = helper.getCurrentPage();
	pageBeforeLiveSync._moduleName = styleModuleName;

	livesync({ type: 'style', path: livesyncStyleFileName });
	const topmostFrame = Frame.topmost();
	waitUntilLivesyncComplete(topmostFrame);

	const pageAfterLiveSync = helper.getCurrentPage();
	TKUnit.waitUntilReady(() => pageAfterLiveSync.getViewById('button').style.color.toString() === green.toString());
	TKUnit.assertTrue(pageAfterLiveSync.frame.canGoBack(), 'Can NOT go back!');
	TKUnit.assertEqual(topmostFrame.backStack.length, 1, 'Backstack is clean!');
	TKUnit.assertTrue(pageAfterLiveSync._cssState.isSelectorsLatestVersionApplied(), 'Latest selectors version is NOT applied!');

	helper.goBack();
	const pageAfterNavigationBack = helper.getCurrentPage();
	TKUnit.assertEqual(pageBeforeNavigation, pageAfterNavigationBack, 'Pages are different!');
	TKUnit.assertTrue(pageAfterNavigationBack._cssState.isSelectorsLatestVersionApplied(), 'Latest selectors version is NOT applied!');
}

function _test_onLiveSync_ModuleReplace_Multiple(context: ModuleContext[]) {
	const pageBeforeNavigation = helper.getCurrentPage();
	const buttonPage = <Page>Builder.createViewFromEntry({ moduleName: buttonPageModuleName });
	helper.navigateWithHistory(() => buttonPage);

	context.forEach((item) => {
		livesync(item);
	});

	const topmostFrame = Frame.topmost();
	waitUntilLivesyncComplete(topmostFrame);
	TKUnit.assertTrue(topmostFrame.currentPage.getViewById('button').isLoaded, 'Button page is NOT loaded!');
	TKUnit.assertEqual(topmostFrame.backStack.length, 1, 'Backstack is clean!');
	TKUnit.assertTrue(topmostFrame.canGoBack(), 'Can NOT go back!');

	helper.goBack();
	const pageAfterBackNavigation = helper.getCurrentPage();
	TKUnit.assertTrue(topmostFrame.currentPage.getViewById('label').isLoaded, 'Label page is NOT loaded!');
	TKUnit.assertEqual(topmostFrame.backStack.length, 0, 'Backstack is NOT clean!');
	TKUnit.assertEqual(pageBeforeNavigation, pageAfterBackNavigation, 'Pages are different!');
}

function _test_onLiveSync_ModalViewClosed(context: ModuleContext) {
	const modalViewPage = <Page>Builder.createViewFromEntry({ moduleName: modalViewPageModuleName });
	helper.navigateWithHistory(() => modalViewPage);
	livesync({ type: context.type, path: context.path });

	TKUnit.waitUntilReady(() => !!Frame.topmost());
	const topmostFrame = Frame.topmost();
	TKUnit.waitUntilReady(() => topmostFrame.currentPage && topmostFrame.currentPage.isLoaded && topmostFrame.canGoBack());

	TKUnit.assertTrue(topmostFrame._getRootModalViews().length === 0);
}

function livesync(context: ModuleContext) {
	const ls = (<any>global).__coreModulesLiveSync || global.__onLiveSync;
	ls(context);
}

function waitUntilLivesyncComplete(frame: Frame) {
	TKUnit.waitUntilReady(() => frame.navigationQueueIsEmpty());
}
