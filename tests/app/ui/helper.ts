import view = require("ui/core/view");
import frame = require("ui/frame");
import page = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import TKUnit = require("../TKUnit");
import utils = require("utils/utils");
import types = require("utils/types");
import styling = require("ui/styling");
import platform = require("platform");
import colorModule = require("color");
import formattedStringModule = require("text/formatted-string");
import spanModule = require("text/span");
import enums = require("ui/enums");

var DELTA = 0.1;

export var ASYNC = 0.2;
export var MEMORY_ASYNC = 2;

function clearPage(): void {
    let newPage = getCurrentPage();
    if (!newPage) {
        TKUnit.waitUntilReady(() => getCurrentPage() !== null);
        newPage = getCurrentPage();
    }

    if (!newPage) {
        throw new Error("NO CURRENT PAGE!!!!");
    }

    newPage.style._resetValue(styling.properties.backgroundColorProperty);
    newPage.style._resetValue(styling.properties.colorProperty);
    newPage._resetValue(button.Button.bindingContextProperty);
    newPage._resetValue(button.Button.cssClassProperty);
    newPage._resetValue(button.Button.idProperty);
}

export function do_PageTest(test: (views: Array<view.View>) => void, content: view.View, secondView: view.View, thirdView: view.View) {
    clearPage();
    let newPage = getCurrentPage();
    newPage.content = content;
    test([newPage, content, secondView, thirdView, newPage.actionBar]);
    newPage.content = null;
}

export function do_PageTest_WithButton(test: (views: Array<view.View>) => void) {
    clearPage();
    let newPage = getCurrentPage();
    let btn = new button.Button();
    newPage.content = btn;
    test([newPage, btn, newPage.actionBar]);
    newPage.content = null;
}

export function do_PageTest_WithStackLayout_AndButton(test: (views: Array<view.View>) => void) {
    clearPage();
    let newPage = getCurrentPage();
    let stackLayout = new stackLayoutModule.StackLayout();
    let btn = new button.Button();
    stackLayout.addChild(btn);
    newPage.content = stackLayout;
    test([newPage, stackLayout, btn, newPage.actionBar]);
    newPage.content = null;
}

//export function buildUIAndRunTest(controlToTest, testFunction, pageCss?, testDelay?) {
export function buildUIAndRunTest(controlToTest, testFunction, pageCss?) {
    clearPage();
    let newPage = getCurrentPage();
    newPage.content = controlToTest;

    newPage.css = pageCss;

    testFunction([controlToTest, newPage]);
    newPage.content = null;
    newPage.css = null;
}

export function buildUIWithWeakRefAndInteract<T extends view.View>(createFunc: () => T, interactWithViewFunc?: (view: T) => void, done?) {
    clearPage();
    let newPage = getCurrentPage();
    let sp = new stackLayoutModule.StackLayout();
    let testFinished = false;

    sp.on("loaded", () => {
        let weakRef = new WeakRef(createFunc());
        try {
            sp.addChild(weakRef.get());

            if (interactWithViewFunc) {
                interactWithViewFunc(weakRef.get());
            }

            sp.removeChild(weakRef.get());
            if (newPage.ios) {
                /* tslint:disable:no-unused-expression */
                // Could cause GC on the next call.
                // NOTE: Don't replace this with forceGC();
                new ArrayBuffer(4 * 1024 * 1024);
            }
            utils.GC();

            TKUnit.waitUntilReady(() => { return weakRef.get() ? !(weakRef.get().isLoaded) : true; }, MEMORY_ASYNC);
            TKUnit.assert(!weakRef.get(), weakRef.get() + " leaked!");
            testFinished = true;
        }
        catch (e) {
            done(e);
        }
    });

    newPage.content = sp;

    TKUnit.waitUntilReady(() => testFinished, MEMORY_ASYNC);
    TKUnit.assertTrue(testFinished, "Test did not completed.")
    done(null);
}

export function navigateToModuleAndRunTest(moduleName, context, testFunction) {
    let page = navigateToModule(moduleName, context);
    testFunction(page);
}

export function navigate(pageFactory: () => page.Page, navigationContext?: any): page.Page {
    let entry: frame.NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: true };
    return navigateWithEntry(entry);
}

export function navigateWithHistory(pageFactory: () => page.Page, navigationContext?: any): page.Page {
    let entry: frame.NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: false };
    return navigateWithEntry(entry);
}

export function navigateToModule(moduleName: string, context?: any): page.Page {
    let entry: frame.NavigationEntry = { moduleName: moduleName, context: context, animated: false, clearHistory: true };
    return navigateWithEntry(entry);
}

export function getCurrentPage(): page.Page {
    return frame.topmost().currentPage;
}

export function getClearCurrentPage(): page.Page {
    let page = frame.topmost().currentPage;
    page.style._resetValue(styling.properties.backgroundColorProperty);
    page.style._resetValue(styling.properties.colorProperty);
    page._resetValue(button.Button.bindingContextProperty);
    page._resetValue(button.Button.cssClassProperty);
    page._resetValue(button.Button.idProperty);
    return page;
}

export function waitUntilNavigatedFrom(oldPage: page.Page) {
    TKUnit.waitUntilReady(() => getCurrentPage() && getCurrentPage() !== oldPage);
}

export function navigateWithEntry(entry: frame.NavigationEntry): page.Page {
    let page = frame.resolvePageFromEntry(entry);
    entry.moduleName = null;
    entry.create = function () {
        return page;
    }

    let currentPage = getCurrentPage();
    frame.topmost().navigate(entry);
    waitUntilNavigatedFrom(currentPage);
    return page;
}

export function goBack() {
    let currentPage = getCurrentPage();
    frame.topmost().goBack();
    waitUntilNavigatedFrom(currentPage);
}

export function assertAreClose(actual: number, expected: number, message: string): void {
    var density = utils.layout.getDisplayDensity();
    var delta = Math.floor(density) !== density ? 1.1 : DELTA;

    TKUnit.assertAreClose(actual, expected, delta, message);
}

export function assertViewColor(testView: view.View, hexColor: string, valueSource?: number) {
    TKUnit.assert(testView.style.color, "Color property not applied correctly. Style value is not defined.");
    TKUnit.assertEqual(testView.style.color.hex, hexColor, "color property");

    if (types.isDefined(valueSource)) {
        TKUnit.assertEqual(testView.style._getValueSource(styling.properties.colorProperty), valueSource, "valueSource");
    }
}

export function assertViewBackgroundColor(testView: view.View, hexColor: string) {
    TKUnit.assert(testView.style.backgroundColor, "Background color property not applied correctly. Style value is not defined.");
    TKUnit.assertEqual(testView.style.backgroundColor.hex, hexColor, "backgroundColor property");
}

export function forceGC() {
    if (platform.device.os === platform.platformNames.ios) {
        /* tslint:disable:no-unused-expression */
        // Could cause GC on the next call.
        new ArrayBuffer(4 * 1024 * 1024);
        TKUnit.wait(ASYNC);
    }

    utils.GC();
}

export function _generateFormattedString(): formattedStringModule.FormattedString{
    let formattedString = new formattedStringModule.FormattedString();
    let span: spanModule.Span;

    span = new spanModule.Span();
    span.fontFamily = "serif";
    span.fontSize = 10;
    span.fontAttributes = enums.FontAttributes.Bold;
    span.foregroundColor = new colorModule.Color("red");
    span.backgroundColor = new colorModule.Color("blue");
    span.underline = 0;
    span.strikethrough = 1;
    span.text = "Formatted";
    formattedString.spans.push(span);
    
    span = new spanModule.Span();
    span.fontFamily = "sans-serif";
    span.fontSize = 20;
    span.fontAttributes = enums.FontAttributes.Italic;
    span.foregroundColor = new colorModule.Color("green");
    span.backgroundColor = new colorModule.Color("yellow");
    span.underline = 1;
    span.strikethrough = 0;
    span.text = "Text";
    formattedString.spans.push(span);

    return formattedString;
}