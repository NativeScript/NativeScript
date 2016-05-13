import frame = require("ui/frame");
import pages = require("ui/page");
import trace = require("trace");
import observable = require("data/observable");
import dialogs = require("ui/dialogs");

trace.enable();
trace.setCategories(trace.categories.Test);

var basePath = "";
var VM = new observable.Observable();
var examples = new Map<string, string>();

export function pageLoaded(args) {
    var page = <pages.Page>args.object;
    page.bindingContext = VM;
    VM.set("selected", "");
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
examples.set("actIcons", "action-bar/system-icons");
examples.set("actView", "action-bar/action-view");

examples.set("basics", "bindings/basics");
examples.set("xmlbasics", "bindings/xmlbasics");

examples.set("background", "css/background");
examples.set("formatted", "css/decoration-transform-formattedtext");
examples.set("csslv", "css/listview");
examples.set("radius", "css/radius");
examples.set("styles", "css/styles");
examples.set("tabmore", "css/tab-view-more");
examples.set("spacing", "css/letter-spacing");
examples.set("decoration", "css/text-decoration");
examples.set("transform", "css/text-transform");
examples.set("whitespace", "css/white-space");
examples.set("switch", "css/views");
examples.set("zindex", "css/zindex");

examples.set("dialogs", "dialogs/dialogs");

examples.set("fontbtn", "font/button");
examples.set("fontlbl", "font/label");
examples.set("fontfield", "font/text-field");
examples.set("fontview", "font/text-view");

examples.set("customfonts", "font/custom-fonts");
examples.set("material", "font/material-icons");
examples.set("tabfont", "font/tab-view");

examples.set("htmlview", "html-view/html-view");

examples.set("roundbtn", "image-view/rounded-buttons");
examples.set("roundimg", "image-view/rounded-images");

examples.set("absolute", "layouts/absolute");
examples.set("dock", "layouts/dock");
examples.set("grid", "layouts/grid");
examples.set("myview", "layouts/myview");
examples.set("stack", "layouts/stack");
examples.set("wrap", "layouts/wrap");

examples.set("pabsolute", "layouts-percent/absolute");
examples.set("pdock", "layouts-percent/dock");
examples.set("pgrid", "layouts-percent/grid");
examples.set("pmyview", "layouts-percent/myview");
examples.set("pstack", "layouts-percent/stack");
examples.set("pwrap", "layouts-percent/wrap");

examples.set("modalview", "modal-view/modal-view");
examples.set("nordic", "nordic/nordic");

examples.set("padding", "padding/padding");

examples.set("gestures", "pages/gestures");
examples.set("touch", "pages/touch-event");
examples.set("handlers", "pages/handlers");

examples.set("animeBG", "animations/background");
examples.set("transitions", "transitions/page0");

//examples.set("listview_binding", "pages/listview_binding");
examples.set("console", "pages/console");
examples.set("i61", "pages/i61");
examples.set("i73", "pages/i73");
examples.set("i86", "pages/i86");

examples.set("segStyle", "segmented-bar/all");

examples.set("tabColor", "tab-view/color");
examples.set("tabBG", "tab-view/background");
examples.set("tabTabsBG", "tab-view/tabsBackground");
examples.set("tabSelected", "tab-view/selected");
examples.set("tabStyle", "tab-view/all");

//examples.set("textfield", "text-field/text-field");

examples.set("webview", "web-view/web-view");
examples.set("webtest", "web-view/web-view-test");
