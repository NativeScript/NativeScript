// >> frame-require
import frameModule = require("ui/frame");
var topmost = frameModule.topmost();
// << frame-require

import labelModule = require("ui/label");
import pagesModule = require("ui/page");

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