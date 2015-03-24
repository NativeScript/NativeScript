// <snippet module="ui/frame" title="frame">
// # Frame
// To perform navigation, you will need a reference to the topmost frame of the application.
// ``` JavaScript
import frameModule = require("ui/frame");
var topmost = frameModule.topmost();
// ```
// </snippet>
import labelModule = require("ui/label");
import pagesModule = require("ui/page");

export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="ui/frame" title="frame">
    // ### Navigating to a Module
    // ``` JavaScript
    topmost.navigate("details-page");
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly1 = function () {
    // <snippet module="ui/frame" title="frame">
    // ### Navigating with a Factory Function
    // ``` JavaScript
    var factoryFunc = function () {
        var label = new labelModule.Label();
        label.text = "Hello, world!";
        var page = new pagesModule.Page();
        page.content = label;
        return page;
    };
    topmost.navigate(factoryFunc);    
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly2 = function () {
    // <snippet module="ui/frame" title="frame">
    // ### Navigating with NavigationEntry
    // ``` JavaScript
    var navigationEntry = {
        moduleName: "details-page",
        context: { info: "something you want to pass to your page" },
        animated: false
    };
    topmost.navigate(navigationEntry);
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly3 = function () {
    // <snippet module="ui/frame" title="frame">
    // ### Navigating Back
    // ``` JavaScript
    topmost.goBack();
    // ```
    // </snippet>
}
