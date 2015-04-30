import view = require("ui/core/view");
import frame = require("ui/frame");
import page = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import button = require("ui/button");
import TKUnit = require("../TKUnit");
import utils = require("utils/utils");
import types = require("utils/types");
import styling = require("ui/styling");

var DELTA = 0.1;

export var ASYNC = 0.2;

export function do_PageTest(test: (views: Array<view.View>) => void, content: view.View, secondView: view.View, thirdView: view.View) {
    var newPage: page.Page;
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = content;
        return newPage;
    };

    navigate(pageFactory);

    try {
        test([newPage, content, secondView, thirdView]);
    }
    finally {
        goBack();
    }
}

export function do_PageTest_WithButton(test: (views: Array<view.View>) => void) {
    var newPage: page.Page;
    var btn: button.Button;
    var pageFactory = function(): page.Page {
        newPage = new page.Page();
        btn = new button.Button();
        newPage.content = btn;
        return newPage;
    };

    navigate(pageFactory);

    try {
        test([newPage, btn]);
    }
    finally {
        goBack();
    }
}

export function do_PageTest_WithStackLayout_AndButton(test: (views: Array<view.View>) => void) {
    var newPage: page.Page;
    var stackLayout;
    var btn;
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        stackLayout = new stackLayoutModule.StackLayout();
        btn = new button.Button();

        stackLayout.addChild(btn);
        newPage.content = stackLayout;
        return newPage;
    };

    navigate(pageFactory);

    try {
        test([newPage, stackLayout, btn]);
    }
    finally {
        goBack();
    }
}

export function do_PageTest_WithStackLayout_AndButton_NavigatedBack(test: (views: Array<view.View>) => void,
    assert: (views: Array<view.View>) => void) {
    
    var newPage: page.Page;
    var stackLayout;
    var btn;
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        stackLayout = new stackLayoutModule.StackLayout();
        btn = new button.Button();
        stackLayout.addChild(btn);
        newPage.content = stackLayout;
        return newPage;
    };

    navigate(pageFactory);

    try {
        test([newPage, stackLayout, btn]);
    }
    finally {
        goBack();
    }

    try {
        assert([newPage, stackLayout, btn]);
    }
    finally {
        // wait to ensure asynchronous navigation
        TKUnit.wait(ASYNC);
    }
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

//export function buildUIAndRunTest(controlToTest, testFunction, pageCss?, testDelay?) {
export function buildUIAndRunTest(controlToTest, testFunction, pageCss?) {
    var newPage: page.Page;
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = controlToTest;
        if (pageCss) {
            newPage.css = pageCss;
        }
        return newPage;
    };

    navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    try {
        testFunction([controlToTest, newPage]);
    }
    finally {
        goBack();
    }
}

export function navigateToModuleAndRunTest(moduleName, testFunction) {
    navigateToModule(moduleName);
    try {
        testFunction(frame.topmost().currentPage);
    }
    finally {
        goBack();
    }
}

export function buildUIWithWeakRefAndInteract<T extends view.View>(createFunc: () => T, interactWithViewFunc?: (view: T) => void) {
    var newPage: page.Page;
    var testFinished = false;
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        var sp = new stackLayoutModule.StackLayout();
        newPage.content = sp;
        var loaded = false;

        newPage.on("loaded", () => {
            loaded = true;
            var weakRef = new WeakRef(createFunc());

            sp.addChild(weakRef.get());

            if (interactWithViewFunc) {
                interactWithViewFunc(weakRef.get());
            }

            sp.removeChild(weakRef.get());
            if (newPage.ios) {
                // Could cause GC on the next call.
                new ArrayBuffer(4 * 1024 * 1024);
            }
            utils.GC();

            TKUnit.assert(!weakRef.get(), weakRef.get() + " leaked!");
            testFinished = true;
        });

        return newPage;
    };

    try {
        navigate(pageFactory);
        TKUnit.waitUntilReady(() => { return testFinished; });
    }
    finally {
        goBack();
    }
}

export function navigate(pageFactory: () => page.Page) {
    var currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory, animated: false });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });
}

export function navigateToModule(moduleName: string) {
    var currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ moduleName: moduleName, animated: false });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });
    TKUnit.assert(frame.topmost().currentPage.isLoaded, "Current page should be loaded!");
}

export function goBack(): void {
    var currentPage = frame.topmost().currentPage;
    frame.topmost().goBack();
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });
    TKUnit.assert(frame.topmost().currentPage.isLoaded, "Current page should be loaded!");
    TKUnit.assert(!currentPage.isLoaded, "Previous page should be unloaded!");
}

export function assertAreClose(actual: number, expected: number, message: string): void {
    var density = utils.layout.getDisplayDensity();
    var delta = Math.floor(density) !== density ? 1.1 : DELTA;

    TKUnit.assertAreClose(actual, expected, delta, message);
}