import { EventData } from "data/observable";
import { Page } from "ui/page";
import * as buttonModule from "ui/button";
import * as colorModule from "color";
import * as platform from "platform";
import * as frame from "ui/frame";
import * as trace from "trace";
import * as observable from "data/observable";
import * as dialogs from "ui/dialogs";
import { WrapLayout } from "ui/layouts/wrap-layout";

var examples: Map<string, string> = new Map<string, string>();
//should be removed
var oldExamples: Map<string, string> = new Map<string, string>();

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");
    let wrapLayout = <WrapLayout>view.getViewById(page, "wrapLayoutWithExamples");

    examples.set("action-bar", "action-bar/main-page");
    examples.set("bindings", "bindings/main-page");
    examples.set("css", "css/main-page");
    examples.set("fonts", "font/main-page");
    examples.set("image-view", "image-view/main-page");
    examples.set("tab-view", "tab-view/main-page");
    examples.set("layouts", "layouts/main-page");
    examples.set("pages-events", "pages/main-page");
    examples.set("webview", "web-view/main-page");
    examples.set("flexbox", "flexbox/flexbox-main-page");

    examples.set("modalview", "modal-view/modal-view");
    examples.set("dialogs", "dialogs/dialogs");
    examples.set("htmlview", "html-view/html-view");
    examples.set("timePicker", "time-picker/time-picker");
    examples.set("animeBG", "animations/background");
    examples.set("transitions", "transitions/page0");
    examples.set("segStyle", "segmented-bar/all");
    examples.set("list-view", "list-view/list-view");
    examples.set("issues", "issues/main-page");
    examples.set("page", "page/main-page");

    //examples.set("listview_binding", "pages/listview_binding");
    //examples.set("textfield", "text-field/text-field");

    let viewModel = new MainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;

     var parent = page.getViewById('parentLayout');
     var searchBar = page.getViewById('textView');

    if (parent.android) {
        parent.android.setFocusableInTouchMode(true);
        parent.android.setFocusable(true);
        searchBar.android.clearFocus();
    }

    refresh();
}
  
// should be removes
export function refresh() {
    oldExamples.set("actStyle", "action-bar/all");
    oldExamples.set("actIcons", "action-bar/system-icons");
    oldExamples.set("actView", "action-bar/action-view");

    oldExamples.set("basics", "bindings/basics");
    oldExamples.set("xmlbasics", "bindings/xmlbasics");

    oldExamples.set("background", "css/background");
    oldExamples.set("formatted", "css/decoration-transform-formattedtext");
    oldExamples.set("csslv", "css/listview");
    oldExamples.set("radius", "css/radius");
    oldExamples.set("styles", "css/styles");
    oldExamples.set("tabmore", "css/tab-view-more");
    oldExamples.set("spacing", "css/letter-spacing");
    oldExamples.set("decoration", "css/text-decoration");
    oldExamples.set("transform", "css/text-transform");
    oldExamples.set("whitespace", "css/white-space");
    oldExamples.set("switch", "css/views");
    oldExamples.set("zindex", "css/zindex");
    oldExamples.set("clipPath", "css/clip-path");
    oldExamples.set("dialogs", "dialogs/dialogs");

    oldExamples.set("fontbtn", "font/button");
    oldExamples.set("fontlbl", "font/label");
    oldExamples.set("fontfield", "font/text-field");
    oldExamples.set("fontview", "font/text-view");

    oldExamples.set("customfonts", "font/custom-fonts");
    oldExamples.set("material", "font/material-icons");
    oldExamples.set("tabfont", "font/tab-view");

    oldExamples.set("htmlview", "html-view/html-view");

    oldExamples.set("roundbtn", "image-view/rounded-buttons");
    oldExamples.set("roundimg", "image-view/rounded-images");

    oldExamples.set("absolute", "layouts/absolute");
    oldExamples.set("dock", "layouts/dock");
    oldExamples.set("grid", "layouts/grid");
    oldExamples.set("myview", "layouts/myview");
    oldExamples.set("stack", "layouts/stack");
    oldExamples.set("wrap", "layouts/wrap");

    oldExamples.set("pabsolute", "layouts-percent/absolute");
    oldExamples.set("pdock", "layouts-percent/dock");
    oldExamples.set("pgrid", "layouts-percent/grid");
    oldExamples.set("pmyview", "layouts-percent/myview");
    oldExamples.set("pstack", "layouts-percent/stack");
    oldExamples.set("pwrap", "layouts-percent/wrap");

    oldExamples.set("modalview", "modal-view/modal-view");
    oldExamples.set("nordic", "nordic/nordic");

    oldExamples.set("padding", "padding/padding");
    oldExamples.set("timePicker", "time-picker/time-picker");
    oldExamples.set("gestures", "pages/gestures");
    oldExamples.set("touch", "pages/touch-event");
    oldExamples.set("pan", "pages/pan-event");
    oldExamples.set("handlers", "pages/handlers");

    oldExamples.set("animeBG", "animations/background");
    oldExamples.set("transitions", "transitions/page0");

    //oldExamples.set("listview_binding", "pages/listview_binding");
    oldExamples.set("console", "pages/console");
    oldExamples.set("i61", "pages/i61");
    oldExamples.set("i73", "pages/i73");
    oldExamples.set("i86", "pages/i86");

    oldExamples.set("segStyle", "segmented-bar/all");

    oldExamples.set("tabColor", "tab-view/color");
    oldExamples.set("tabBG", "tab-view/background");
    oldExamples.set("tabTabsBG", "tab-view/tabsBackground");
    oldExamples.set("tabSelected", "tab-view/selected");
    oldExamples.set("tabStyle", "tab-view/all");

    //oldExamples.set("textfield", "text-field/text-field");

    oldExamples.set("webview", "web-view/web-view");
    oldExamples.set("webtest", "web-view/web-view-test");
}

export class MainPageViewModel extends observable.Observable {
    private _exampleName: string;
    private basePath: string = "";
    private colors = ["#ff0000", "#0000cc", "#33cc33", "#33cc33"];

    public examples: Map<string, string> = new Map<string, string>();

    constructor(private panel: WrapLayout, private _examples: Map<string, string>) {
        super();
        trace.enable();
        trace.setCategories(trace.categories.Test);
        this.examples = _examples;

        if (this.shouldLoadBtns()) {
            this.loadButtons();
        }
    }

    get exampleName(): string {
        return this._exampleName;
    }

    set exampleName(value: string) {
        if (this._exampleName !== value) {
            this._exampleName = value;
            this.notifyPropertyChange("exampleName", value)
        }
    }

    public loadExample(exampleName: any) {
        console.log("exampleName EXAMPLE: " + exampleName);
        this.selectExample(exampleName);
    }

    public loadOldExmaples() {
        if (oldExamples.has(this.exampleName)) {
            frame.topmost().navigate("ui-tests-app/" + this.basePath + oldExamples.get(this.exampleName));
        }
        else {
            dialogs.alert("Cannot find example: " + this.exampleName);
        }
    }

    private shouldLoadBtns(): boolean {
        return this.panel.getChildrenCount() <= 0;
    }

    private selectExample(selectedExample: any) {
        console.log(" EXAMPLE: " + selectedExample);

        if (this.examples.has(selectedExample)) {
            frame.topmost().navigate("ui-tests-app/" + this.basePath + this.examples.get(selectedExample));
        }
        else {
            dialogs.alert("Cannot find example: " + selectedExample);
        }
    }

    private loadButtons() {
        var count = 0;

        this.examples.forEach((element, key) => {
            var btn = new buttonModule.Button();

            if (platform.isAndroid) {
                btn.style.height = 25;
                btn.style.fontSize = 10;
                btn.style.margin = "0";
                btn.style.padding = "0";
            } else {
                btn.style.padding = "5";
            }

            btn.style.color = new colorModule.Color(this.colors[count++ % 3]);
            btn.on(buttonModule.Button.tapEvent, function(eventData) {
                let text = btn.text;
                this.loadExample(text);
            }, this);

            btn.text = key;
            this.panel.addChild(btn)
        });
    }
}