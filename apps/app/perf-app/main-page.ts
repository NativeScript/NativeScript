import { EventData, Observable } from "tns-core-modules/data/observable";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";
import * as buttonModule from "tns-core-modules/ui/button";
import * as colorModule from "tns-core-modules/color";
import * as platform from "tns-core-modules/platform";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as frame from "tns-core-modules/ui/frame";

export function pageLoaded(args: EventData) {
    let page = <Page>args.object;
    let view = require("ui/core/view");

    let wrapLayout = view.getViewById(page, "wrapLayoutWithExamples");

    let examples: Map<string, string> = new Map<string, string>();
    examples.set("properties", "properties/main-page");
    examples.set("flexbox", "flexbox/main-page");
    examples.set("recycling", "recycling/main-page");

    let viewModel = new MainPageViewModel(wrapLayout, examples);
    page.bindingContext = viewModel;
}

export class MainPageViewModel extends Observable {
    private _exampleName: string;
    private basePath: string = "";
    private colors = ["#ff0000", "#0000cc", "#33cc33", "#33cc33"];

    public examples: Map<string, string> = new Map<string, string>();

    constructor(private panel: WrapLayout, private _examples: Map<string, string>) {
        super();
        // trace.enable();
        // trace.setCategories(trace.categories.Test);
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

    private shouldLoadBtns(): boolean {
        return this.panel.getChildrenCount() <= 0;
    }

    private selectExample(selectedExample: any) {
        console.log(" EXAMPLE: " + selectedExample);

        if (this.examples.has(selectedExample)) {
            frame.topmost().navigate("perf-app/" + this.basePath + this.examples.get(selectedExample));
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