import button = require("ui/button");
import frame = require("ui/frame");
import gridModule = require("ui/layouts/grid-layout");
import pages = require("ui/page");
import text = require("ui/text-view");
import fs = require("file-system");
import trace = require("trace");
import observable = require("data/observable");
import view = require("ui/core/view");
import dialogs = require("ui/dialogs");

trace.enable();
trace.setCategories(trace.categories.Test);

var basePath = "";
var VM = new observable.Observable();
var examples = new Map<string, string>();

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = VM;

}

export function selectExample() {
    var ex: string = VM.get("selected");
    if (examples.has(ex)) {
        frame.topmost().navigate(basePath + examples.get(ex));
    }
    else {
        dialogs.alert("Cannot find example: " + ex);
    }
}

examples.set("actColor", "action-bar/color");
examples.set("actBG", "action-bar/background");
examples.set("actStyle", "action-bar/all");

examples.set("basics", "bindings/basics");
examples.set("xmlbasics", "bindings/xmlbasics");

examples.set("background", "css/background");
examples.set("radius", "css/radius");
examples.set("styles", "css/styles");

examples.set("dialogs", "dialogs/dialogs");

examples.set("fontbtn", "font/button");
examples.set("fontlbl", "font/label");
examples.set("fontfield", "font/text-field");
examples.set("fontview", "font/text-view");

examples.set("htmlview", "html-view/html-view");

examples.set("roundbtn", "image-view/rounded-buttons");
examples.set("roundimg", "image-view/rounded-images");

examples.set("absolute", "layouts/absolute");
examples.set("dock", "layouts/dock");
examples.set("grid", "layouts/grid");
examples.set("myview", "layouts/myview");
examples.set("stack", "layouts/stack");
examples.set("wrap", "layouts/wrap");

examples.set("modalview", "modal-view/modalview");

examples.set("nordic", "nordic/nordic");

examples.set("background", "pages/background");
examples.set("console", "pages/console");
examples.set("gestures", "pages/gestures");
examples.set("handlers", "pages/handlers");
examples.set("i61", "pages/i61");
examples.set("i73", "pages/i73");
examples.set("i86", "pages/i86");
examples.set("listview_binding", "pages/listview_binding");

examples.set("switch", "pages/switchandprogress"); // TODO: Update this test page.

examples.set("segmentedStyle", "segmented-bar/all");

examples.set("tabColor", "tab-view/color");
examples.set("tabBG", "tab-view/background");
examples.set("tabTabsBG", "tab-view/tabsBackground");
examples.set("tabSelected", "tab-view/selected");
examples.set("tabStyle", "tab-view/all");

examples.set("textfield", "text-field/text-field");

examples.set("webview", "web-view/web-view");
examples.set("webtest", "web-view/web-vew-test");

//VM.set("selected", "tabAll");