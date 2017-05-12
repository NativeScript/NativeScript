import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import * as buttonModule from "tns-core-modules/ui/button";
import * as colorModule from "tns-core-modules/color";
import * as platform from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
import * as trace from "tns-core-modules/trace";
import * as observable from "tns-core-modules/data/observable";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";

export function pageLoaded(args: EventData) {
    let examples: Map<string, string> = new Map<string, string>();

    let page = <Page>args.object;
    let wrapLayout = page.getViewById<WrapLayout>("wrapLayoutWithExamples");
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
    examples.set("list-view", "list-view/main-page");
    examples.set("issues", "issues/main-page");
    examples.set("page", "page/main-page");

    examples.set("perf", "perf/main-page");
    examples.set("list-picker", "list-picker/main-page");

    examples.set("listview_binding", "pages/listview_binding");
    examples.set("textfield", "text-field/text-field");

    let viewModel = new MainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;

    var parent = page.getViewById('parentLayout');
    var searchBar = page.getViewById('textView');

    if (parent.android) {
        parent.android.setFocusableInTouchMode(true);
        parent.android.setFocusable(true);
        searchBar.android.clearFocus();
    }
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
            this.sortMap(this.examples);
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

    public loadExample(exampleName: string) {
        console.log("exampleName EXAMPLE: " + exampleName);
        this.selectExample(exampleName);
    }

    public loadExmaple() {
        let selectedExample = this.exampleName.toLocaleLowerCase().trim();
        if (selectedExample.indexOf("/") > 0) {
            frame.topmost().navigate("ui-tests-app/" + selectedExample);
        } else {
            this.selectExample(this.exampleName.toLocaleLowerCase());
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
            btn.on(buttonModule.Button.tapEvent, function (eventData) {
                let text = btn.text;
                this.loadExample(text);
            }, this);

            btn.text = key;
            this.panel.addChild(btn)
        });
    }

    private sortMap(map: Map<string, string>) {
        let arrayOfKeys = new Array<string>();
        map.forEach((value, key, map) => {
            arrayOfKeys.push(key);
        })

        arrayOfKeys.sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return a.localeCompare(b);
        })

        let sortedExamples = new Map<string, string>();
        arrayOfKeys.forEach((k) => {
            sortedExamples.set(k, this.examples.get(k));
        })

        this.examples.clear();
        this.examples = sortedExamples;
    }
}
