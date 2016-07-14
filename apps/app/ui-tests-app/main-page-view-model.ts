import frame = require("ui/frame");
import trace = require("trace");
import observable = require("data/observable");
import dialogs = require("ui/dialogs");

export class MianPageViewModel extends observable.Observable {
    private _exampleName: string;
    private basePath: string = "";

    public examples: Map<string, string> = new Map<string, string>();

    constructor() {
        super();
        trace.enable();
        trace.setCategories(trace.categories.Test);
        this.refresh();
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
        console.log("exampleName EXAMLE: " + exampleName);
        this.selectExample(exampleName);
    }

    public loadExampleFromRun(){
        this.selectExample(this.exampleName);
    }

    private selectExample(selectedExample: any) {
        console.log(" EXAMLE: " + selectedExample);

        if (this.examples.has(selectedExample)) {
            frame.topmost().navigate("ui-tests-app/" + this.basePath + this.examples.get(selectedExample));
        }
        else {
            dialogs.alert("Cannot find example: " + selectedExample);
        }
    }

    private refresh() {
        this.examples.set("actColor", "action-bar/color");
        this.examples.set("actBG", "action-bar/background");
        this.examples.set("actStyle", "action-bar/all");
        this.examples.set("actIcons", "action-bar/system-icons");
        this.examples.set("actView", "action-bar/action-view");

        this.examples.set("basics", "bindings/basics");
        this.examples.set("xmlbasics", "bindings/xmlbasics");

        this.examples.set("background", "css/background");
        this.examples.set("formatted", "css/decoration-transform-formattedtext");
        this.examples.set("csslv", "css/listview");
        this.examples.set("radius", "css/radius");
        this.examples.set("styles", "css/styles");
        this.examples.set("tabmore", "css/tab-view-more");
        this.examples.set("spacing", "css/letter-spacing");
        this.examples.set("decoration", "css/text-decoration");
        this.examples.set("transform", "css/text-transform");
        this.examples.set("whitespace", "css/white-space");
        this.examples.set("switch", "css/views");
        this.examples.set("zindex", "css/zindex");
        this.examples.set("clipPath", "css/clip-path");
        this.examples.set("dialogs", "dialogs/dialogs");

        this.examples.set("fontbtn", "font/button");
        this.examples.set("fontlbl", "font/label");
        this.examples.set("fontfield", "font/text-field");
        this.examples.set("fontview", "font/text-view");

        this.examples.set("customfonts", "font/custom-fonts");
        this.examples.set("material", "font/material-icons");
        this.examples.set("tabfont", "font/tab-view");

        this.examples.set("htmlview", "html-view/html-view");

        this.examples.set("roundbtn", "image-view/rounded-buttons");
        this.examples.set("roundimg", "image-view/rounded-images");

        this.examples.set("absolute", "layouts/absolute");
        this.examples.set("dock", "layouts/dock");
        this.examples.set("grid", "layouts/grid");
        this.examples.set("myview", "layouts/myview");
        this.examples.set("stack", "layouts/stack");
        this.examples.set("wrap", "layouts/wrap");

        this.examples.set("pabsolute", "layouts-percent/absolute");
        this.examples.set("pdock", "layouts-percent/dock");
        this.examples.set("pgrid", "layouts-percent/grid");
        this.examples.set("pmyview", "layouts-percent/myview");
        this.examples.set("pstack", "layouts-percent/stack");
        this.examples.set("pwrap", "layouts-percent/wrap");

        this.examples.set("modalview", "modal-view/modal-view");
        this.examples.set("nordic", "nordic/nordic");

        this.examples.set("padding", "padding/padding");
        this.examples.set("timePicker", "time-picker/time-picker");
        this.examples.set("gestures", "pages/gestures");
        this.examples.set("touch", "pages/touch-event");
        this.examples.set("pan", "pages/pan-event");
        this.examples.set("handlers", "pages/handlers");

        this.examples.set("animeBG", "animations/background");
        this.examples.set("transitions", "transitions/page0");

        //examples.set("listview_binding", "pages/listview_binding");
        this.examples.set("console", "pages/console");
        this.examples.set("i61", "pages/i61");
        this.examples.set("i73", "pages/i73");
        this.examples.set("i86", "pages/i86");

        this.examples.set("segStyle", "segmented-bar/all");

        this.examples.set("tabColor", "tab-view/color");
        this.examples.set("tabBG", "tab-view/background");
        this.examples.set("tabTabsBG", "tab-view/tabsBackground");
        this.examples.set("tabSelected", "tab-view/selected");
        this.examples.set("tabStyle", "tab-view/all");

        //examples.set("textfield", "text-field/text-field");

        this.examples.set("webview", "web-view/web-view");
        this.examples.set("webtest", "web-view/web-view-test");
    }
}

