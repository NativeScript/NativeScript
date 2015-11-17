import TKUnit = require("../TKUnit");
import view = require("ui/core/view");
import builder = require("ui/builder");
import buttonModule = require("ui/button");
import switchModule = require("ui/switch");
import searchBarModule = require("ui/search-bar");
import textFieldModule = require("ui/text-field");
import gridLayoutModule = require("ui/layouts/grid-layout");
import absoluteLayoutModule = require("ui/layouts/absolute-layout");
import types = require("utils/types");
import fs = require("file-system");
import observable = require("data/observable");
import stackLayoutModule = require("ui/layouts/stack-layout");
import {Label} from "ui/label";
import {Page} from "ui/page";
import {Button} from "ui/button";
import {View} from "ui/core/view";
import {TemplateView} from "./template-builder-tests/template-view";
import myCustomControlWithoutXml = require("./mymodule/MyControl");
import listViewModule = require("ui/list-view");
import helper = require("../ui/helper");
import viewModule = require("ui/core/view");
import platform = require("platform");
import gesturesModule = require("ui/gestures");
import segmentedBar = require("ui/segmented-bar");

export function test_load_IsDefined() {
    TKUnit.assert(types.isFunction(builder.load), "ui/builder should have load method!");
};

export function test_parse_IsDefined() {
    TKUnit.assert(types.isFunction(builder.parse), "ui/builder should have parse method!");
};

export function test_load_ShouldNotCrashWithInvalidFileName() {
    var v = builder.load(fs.path.join(__dirname, "mainPage1.xml"));

    TKUnit.assert(types.isUndefined(v), "Expected result: undefined; Actual result: " + v + ";");
};

export function test_load_ShouldNotCrashWithoutExports() {
    var v = builder.load(fs.path.join(__dirname, "mainPage.xml"));

    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_loadWithOptionsNoXML() {
    var v = builder.load({
        path: "~/xml-declaration/mymodule",
        name: "MyControl",
        exports: exports
    });

    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_loadWithOptionsNoXML_CSSIsApplied() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = new Page();

        newPage.content = builder.load({
            path: "~/xml-declaration/mymodule",
            name: "MyControl",
            exports: exports,
            page: newPage
        });

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    try {
        helper.assertViewBackgroundColor(newPage.content, "#FF0000");
    }
    finally {
        helper.goBack();
    }
};

export function test_loadInheritedPageAndResolveFromChild() {
    var basePath = "xml-declaration/";
    helper.navigateToModuleAndRunTest(basePath + "inherited-page", null, (page) => {
        let contentLabel = <Label>page.content;
        TKUnit.assertEqual("Inherited and loaded", contentLabel.text);

        let discoveredPage = contentLabel.page;
        TKUnit.assert(page === discoveredPage);

        let discoveredAncestorByBaseType = viewModule.getAncestor(contentLabel, Page);
        TKUnit.assert(page === discoveredAncestorByBaseType);

        let discoveredAncestorByInheritedTypeName = viewModule.getAncestor(contentLabel, "InheritedPage");
        TKUnit.assert(page === discoveredAncestorByInheritedTypeName);
    });
}

export function test_loadWithOptionsWithXML() {
    var v = builder.load({
        path: "~/xml-declaration/mymodulewithxml",
        name: "MyControl",
        exports: exports
    });
    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_loadWithOptionsWithXML_CSSIsApplied() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = new Page();

        newPage.content = builder.load({
            path: "~/xml-declaration/mymodulewithxml",
            name: "MyControl",
            exports: exports,
            page: newPage
        });

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    try {
        helper.assertViewBackgroundColor(newPage.content, "#008000");
    }
    finally {
        helper.goBack();
    }
};

export function test_loadWithOptionsFromTNS() {
    var v = builder.load({
        path: "ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
};

export function test_loadWithOptionsFromTNSPath() {
    var v = builder.load({
        path: "tns_modules/ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
};

export function test_parse_ShouldNotCrashWithoutExports() {
    var file = fs.File.fromPath(fs.path.join(__dirname, "mainPage.xml"));
    var text = file.readTextSync();

    var v: view.View = builder.parse(text);
    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_parse_ShouldResolveExportsFromCodeFile() {
    var page = builder.parse("<Page codeFile='~/xml-declaration/custom-code-file' loaded='loaded'></Page>");
    page._emit("loaded");

    TKUnit.assert((<any>page).customCodeLoaded, "Parse should resolve exports from custom code file.");
}

export function test_parse_ShouldThrowErrorWhenInvalidCodeFileIsSpecified() {
    var e: Error;
    try {
        builder.parse("<Page codeFile='~/xml-declaration/some-code-file' loaded='pageLoaded'></Page>");
    } catch (ex) {
        e = ex;
    }

    TKUnit.assert(e, "Expected result: Error; Actual result: " + e);
};

export function test_parse_ShouldResolveExportsFromCodeFileForTemplates() {
    var p = <Page>builder.parse('<Page codeFile="~/xml-declaration/custom-code-file" xmlns:customControls="xml-declaration/mymodulewithxml"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><customControls:MyControl loaded="loaded" /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [1]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view
        });
        p.bindingContext = obj;

        TKUnit.wait(0.2);

        TKUnit.assert((<any>ctrl).customCodeLoaded, "Parse should resolve exports for templates from custom code file.");
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parse_css_is_applied_by_type_to_lower_case_dashed_components() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>builder.parse("<page cssFile='~/xml-declaration/custom-css-file.css'><stack-layout /></page>");
        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    try {
        helper.assertViewBackgroundColor(newPage.content, "#008000");
    }
    finally {
        helper.goBack();
    }
};

export function test_parse_ShouldApplyCssFromCssFile() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>builder.parse("<Page cssFile='~/xml-declaration/custom-css-file.css'><Label class='MyClass' /></Page>");
        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    try {
        helper.assertViewBackgroundColor(newPage.content, "#008000");
    }
    finally {
        helper.goBack();
    }
};

export function test_parse_ShouldResolveExportsFromCodeFileAndApplyCssFile() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>builder.parse("<Page codeFile='~/xml-declaration/custom-code-file' cssFile='~/xml-declaration/custom-css-file.css' loaded='loaded'><Label class='MyClass' /></Page>");
        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    TKUnit.assert((<any>newPage).customCodeLoaded, "Parse should resolve exports from custom code file.");
    try {
        helper.assertViewBackgroundColor(newPage.content, "#008000");
    }
    finally {
        helper.goBack();
    }
};

export function test_parse_ShouldFindEventHandlersInExports() {
    var loaded;
    var page = builder.parse("<Page loaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assert(loaded, "Parse should find event handlers in exports.");
};

export function test_parse_ShouldFindEventHandlersWithOnInExports() {
    var loaded;
    var page = builder.parse("<Page onloaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assert(loaded, "Parse should find event handlers in exports.");
};

export function test_parse_ShouldSetGridAttachedProperties() {
    var p = <Page>builder.parse("<Page><GridLayout><Label row='1' col='2' rowSpan='3' colSpan='4' /></GridLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var col = gridLayoutModule.GridLayout.getColumn(child);
    TKUnit.assert(col === 2, "Expected result for grid column: 2; Actual result: " + col + ";");

    var row = gridLayoutModule.GridLayout.getRow(child);
    TKUnit.assert(row === 1, "Expected result for grid row: 1; Actual result: " + row + ";");

    var colSpan = gridLayoutModule.GridLayout.getColumnSpan(child);
    TKUnit.assert(colSpan === 4, "Expected result for grid column span: 4; Actual result: " + colSpan + ";");

    var rowSpan = gridLayoutModule.GridLayout.getRowSpan(child);
    TKUnit.assert(rowSpan === 3, "Expected result for grid row span: 3; Actual result: " + rowSpan + ";");
};

export function test_parse_ShouldSetCanvasAttachedProperties() {
    var p = <Page>builder.parse("<Page><AbsoluteLayout><Label left='1' top='2' right='3' bottom='4' /></AbsoluteLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var left = absoluteLayoutModule.AbsoluteLayout.getLeft(child);
    TKUnit.assert(left === 1, "Expected result for canvas left: 1; Actual result: " + left + ";");

    var top = absoluteLayoutModule.AbsoluteLayout.getTop(child);
    TKUnit.assert(top === 2, "Expected result for canvas top: 2; Actual result: " + top + ";");
};

export function test_parse_ShouldParseNumberProperties() {
    var p = <Page>builder.parse("<Page width='100' />");

    TKUnit.assert(p.width === 100, "Expected result: 100; Actual result: " + p.width + "; type: " + typeof (p.width));
};

export function test_parse_ShouldParseBooleanProperties() {
    var p = <Page>builder.parse("<Page><Switch checked='true' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCase() {
    var p = <Page>builder.parse("<Page><Switch checked='False' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCaseInverted() {
    var p = <Page>builder.parse("<Page><TextField editable='False' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    TKUnit.assert(tf.editable === false, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
};

export function test_parse_ShouldParsePlatformSpecificProperties() {
    var p = <Page>builder.parse("<Page><TextField ios:editable='False' android:editable='True' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(tf.editable === false, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    } else {
        TKUnit.assert(tf.editable === true, "Expected result: true; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    }
};

export function test_parse_ShouldParsePlatformSpecificComponents() {
    var p = <Page>builder.parse("<Page><ios><TextField /></ios><android><Label /></android></Page>");
    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(p.content instanceof textFieldModule.TextField, "Expected result: TextField; Actual result: " + p.content);
    }
    else {
        TKUnit.assert(p.content instanceof Label, "Expected result: Label; Actual result: " + p.content);
    }
};

export function test_parse_ThrowErrorWhenNestingPlatforms() {
    var e: Error;
    try {
        builder.parse("<Page><ios><TextField /><android><Label /></android></ios></Page>");
    } catch (ex) {
        e = ex;
    }

    TKUnit.assert(e, "Expected result: Error; Actual result: " + e);
};

export function test_parse_ShouldParseBindings() {
    var p = <Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    p.bindingContext = { myProp: true };
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBindingsWithObservable() {
    var p = <Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === true, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));

    obj.set("myProp", false);

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBindingsToEvents() {
    var p = <Page>builder.parse("<Page><Button tap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
};

export function test_parse_ShouldParseBindingsToEventsWithOn() {
    var p = <Page>builder.parse("<Page><Button ontap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
};

export function test_parse_ShouldParseBindingsToGestures() {
    var p = <Page>builder.parse("<Page><Label tap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
};

export function test_parse_ShouldParseBindingsToGesturesWithOn() {
    var p = <Page>builder.parse("<Page><Label ontap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
};

export function test_parse_ShouldParseSubProperties() {
    var p = <Page>builder.parse("<Page><Switch style.visibility='collapsed' checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.visibility === "collapsed", "Expected result: collapsed; Actual result: " + sw.visibility + "; type: " + typeof (sw.visibility));
};

export function test_parse_ShouldParseBindingToSpecialProperty() {
    var classProp = "MyClass";
    var p = <Page>builder.parse("<Page><Label class='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", classProp);
    p.bindingContext = obj;

    TKUnit.assertEqual(p.content.className, classProp);
    TKUnit.assertEqual(p.content._cssClasses.length, 1);
};

export function test_parse_ShouldParseBindingsWithCommaInsideSingleQuote() {
    var expected = "Hi,test"
    var bindingString = "{{ 'Hi,' + myProp }}";
    var p = <Page>builder.parse('<Page><Label text="' + bindingString + '" /></Page>');
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
};

export function test_parse_ShouldParseBindingsWithCommaInsideDoubleQuote() {
    var expected = "Hi,test"
    var bindingString = '{{ "Hi," + myProp }}';
    var p = <Page>builder.parse("<Page><Label text='" + bindingString + "' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
};

export function test_parse_CanBindBackgroundImage() {
    var p = <Page>builder.parse("<Page><StackLayout backgroundImage='{{ myProp }}' /></Page>");
    var expected = "~/logo.png"
    var obj = new observable.Observable();
    obj.set("myProp", expected);
    p.bindingContext = obj;
    var sw = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(sw.backgroundImage === expected, "Expected result: " + expected + "; Actual result: " + sw.backgroundImage);
};

export function test_parse_ShouldParseLowerCaseDashedComponentDeclaration() {
    var p = <Page>builder.parse('<page><stack-layout><label text="Label" /><segmented-bar><segmented-bar.items><segmented-bar-item title="test" /></segmented-bar.items></segmented-bar></stack-layout></page>');
    var ctrl = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(ctrl instanceof stackLayoutModule.StackLayout, "Expected result: StackLayout!; Actual result: " + ctrl);
    TKUnit.assert(ctrl.getChildAt(0) instanceof Label, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
    TKUnit.assert(ctrl.getChildAt(1) instanceof segmentedBar.SegmentedBar, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
};

export function test_parse_ShouldParseCustomComponentWithoutXml() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodule"><customControls:MyControl /></Page>');
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof myCustomControlWithoutXml.MyControl, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModules() {
    var p = <Page>builder.parse('<Page xmlns' + ':customControls="tns_modules/ui/label"><customControls:Label /></Page>');
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModulesWhenNotSpecified() {
    var p = <Page>builder.parse('<Page xmlns' + ':customControls="ui/label"><customControls:Label /></Page>');
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWithXml() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assert(lbl.text === "mymodulewithxml", "Expected result: 'mymodulewithxml'; Actual result: " + lbl);
};

export function test_parse_ShouldParseCustomComponentWithXml_WithAttributes() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl visibility="collapsed" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapsed", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWithXml_WithCustomAttributes() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:MyControl myProperty="myValue" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assertEqual(lbl.text, "I'm all about taht XML, no JS", "label.text");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithAttributes() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js visibility="collapsed" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapsed", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithCustomAttributes() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodulewithxml"><customControls:my-control-no-js myProperty="myValue" /></Page>');
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_parse_ShouldParseCustomComponentWithoutXmlInListViewTemplate() {
    var p = <Page>builder.parse('<Page xmlns:customControls="xml-declaration/mymodule"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><customControls:MyControl /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [1]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view
        });
        p.bindingContext = obj;

        TKUnit.wait(0.2);

        TKUnit.assert(ctrl instanceof myCustomControlWithoutXml.MyControl, "Expected result: custom control is defined!; Actual result: " + ctrl);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parse_ShouldParseNestedListViewInListViewTemplate() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><ListView items="{{ subItems }}" /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [{ subItems: [1] }]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view
        });
        p.bindingContext = obj;

        TKUnit.wait(0.2);

        TKUnit.assert(ctrl instanceof listViewModule.ListView, "Expected result: ListView!; Actual result: " + ctrl);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parse_ShouldEvaluateEventBindingExpressionInListViewTemplate() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd"><ListView items="{{ items }}" itemLoading="{{ itemLoading }}"><ListView.itemTemplate><SegmentedBar items="{{ $parents[\'ListView\'].items }}" selectedIndexChanged="{{ $parents[\'ListView\'].changed }}" /></ListView.itemTemplate></ListView></Page>');

    function testAction(views: Array<viewModule.View>) {
        var ctrl: segmentedBar.SegmentedBar;
        var changed;

        var obj = new observable.Observable();
        obj.set("items", [1, 2, 3]);

        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = <segmentedBar.SegmentedBar>args.view
        });

        obj.set("changed", function (args: observable.EventData) {
            changed = true;
        });

        p.bindingContext = obj;

        TKUnit.wait(0.2);

        ctrl.selectedIndex = 1;

        TKUnit.assert(changed, "Expected result: true!; Actual result: " + changed);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parse_NestedRepeaters() {
    var pageXML =
        "<Page xmlns='http://schemas.nativescript.org/tns.xsd'>" +
        "  <TabView>" +
        "    <TabView.items>" +
        "      <TabViewItem title='List'>" +
        "        <TabViewItem.view>" +
        "          <Repeater items='{{ $value }}'>" +
        "            <Repeater.itemTemplate>" +
        "              <StackLayout>" +
        "                <Repeater items='{{ $value }}'>" +
        "                  <Repeater.itemTemplate>" +
        "                    <Label text='{{ $value }}'/>" +
        "                  </Repeater.itemTemplate>" +
        "                </Repeater>" +
        "              </StackLayout>" +
        "            </Repeater.itemTemplate>" +
        "          </Repeater>" +
        "        </TabViewItem.view>" +
        "      </TabViewItem>" +
        "    </TabView.items>" +
        "  </TabView>" +
        "</Page>";
    var p = <Page>builder.parse(pageXML);

    function testAction(views: Array<viewModule.View>) {
        p.bindingContext = [["0", "1"], ["2", "3"]];
        TKUnit.wait(0.2);

        var lbls = new Array<Label>();
        view.eachDescendant(p, (v) => {
            if (v instanceof Label) {
                lbls.push(v);
            }
            return true;
        });

        TKUnit.assertEqual(lbls.length, 4, "labels count");
        lbls.forEach((lbl, index, arr) => {
            TKUnit.assertEqual(lbl.text.toString(), index.toString(), "label text");
        });
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parseSpansDirectlyOnLabel() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatedTo="pageNavigated"><StackLayout><Label id="testLabel"><Span text="We are" fontSize="10"/><Span text="Awesome" fontAttributes="Bold"/></Label></StackLayout></Page>');
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testLabel = <Label>page.getViewById("testLabel");
        TKUnit.assertEqual(testLabel.formattedText + "", "We areAwesome", "Formatted string should be set");
    }

    helper.navigate(function () { return p; });
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parseSpansDirectlyOnButton() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatedTo="pageNavigated"><StackLayout><Button id="testButton"><Span text="We are" fontSize="10"/><Span text="Awesome" fontAttributes="Bold"/></Button></StackLayout></Page>');
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "We areAwesome", "Formatted string should be set");
    }

    helper.navigate(function () { return p; });
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parseFormattedStringWithoutFormattedText() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatedTo="pageNavigated"><StackLayout><Button id="testButton"><FormattedString><FormattedString.spans><Span text="author"/><Span text=" num_comments"/></FormattedString.spans></FormattedString></Button></StackLayout></Page>');
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "Formatted string should be set");
    }

    helper.navigate(function () { return p; });
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parseFormattedStringFullSyntax() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatedTo="pageNavigated"><StackLayout><Button id="testButton"><Button.formattedText><FormattedString><FormattedString.spans><Span text="author"/><Span text=" num_comments"/></FormattedString.spans></FormattedString></Button.formattedText></Button></StackLayout></Page>');
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "Formatted string should be set");
    }

    helper.navigate(function () { return p; });
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_parseSpansDirectlyToFormattedString() {
    var p = <Page>builder.parse('<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatedTo="pageNavigated"><StackLayout><Button id="testButton"><FormattedString><Span text="author"/><Span text=" num_comments"/></FormattedString></Button></StackLayout></Page>');
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "Formatted string should be set");
    }

    helper.navigate(function () { return p; });
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
}

export function test_searchbar_donotcrash_whentext_isempty() {
    var p = <Page>builder.parse('<Page><SearchBar text="" hint="Search" /></Page>');
    var sb = <searchBarModule.SearchBar>p.content;

    TKUnit.assertEqual(sb.text, "");
};

export function test_searchbar_donotcrash_whentext_isspace() {
    var p = <Page>builder.parse('<Page><SearchBar text=" " hint="Search" /></Page>');
    var sb = <searchBarModule.SearchBar>p.content;

    TKUnit.assertEqual(sb.text, " ");
};

export function test_parse_template_property() {
    var page = <Page>builder.load(fs.path.join(__dirname, "template-builder-tests/simple-template-test.xml"));
    TKUnit.assert(page, "Expected root page.");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected TemplateView.");
    TKUnit.assert(templateView.template, "Expected the template of the TemplateView to be defined");
    
    TKUnit.assertEqual(templateView.getChildrenCount(), 0, "Expected TemplateView initially to have no children.");
    templateView.parseTemplate();
    TKUnit.assertEqual(templateView.getChildrenCount(), 1, "Expected TemplateView initially to have 1 child.");
    var button = <Button>templateView.getChildAt(0);
    TKUnit.assert(button, "Expected the TemplateView's template to create a button child.");
    TKUnit.assertEqual(button.text, "Click!", "Expected child Button to have text 'Click!'");
}

export function test_ParserError() {
    var basePath = "xml-declaration/";
	var expectedErrorStart =
		"Building UI from XML. @file:///app/" + basePath + "errors/non-existing-element.xml:11:5\n" +
 		" ↳Module 'ui/unicorn' not found for element 'Unicorn'.\n";
	if (global.android) {
		expectedErrorStart += "   ↳Module \"ui/unicorn\" not found";
	} else {
		expectedErrorStart += "   ↳Failed to find module 'ui/unicorn'";
	}

	var message;
	try {
		builder.load(__dirname + "/errors/non-existing-element.xml");
	} catch(e) {
		message = e.message;
	}
	TKUnit.assertEqual(message.substr(0, expectedErrorStart.length), expectedErrorStart, "Expected load to throw, and the message to start with specific string");
}
