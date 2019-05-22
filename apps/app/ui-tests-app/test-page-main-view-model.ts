import { Observable } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button";
import { Color } from "tns-core-modules/color";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { alert } from "tns-core-modules/ui/dialogs";
import * as frame from "tns-core-modules/ui/frame";
import * as platform from "tns-core-modules/platform";

export class TestPageMainViewModel extends Observable {
    private _colors = ["#0000cc", "#33cc33", "#0000cc"];

    public static APP_NAME: string = "ui-tests-app";
    public basePath: string = "";
    public examples: Map<string, string> = new Map<string, string>();

    constructor(protected buttonsPanel: WrapLayout, private _examples: Map<string, string>) {
        super();
        this.examples = _examples;
        if (this.shouldLoadBtns()) {
            this.sortMap(this.examples);
            this.loadButtons();
        }
    }

    protected selectExample(selectedExample: any) {
        console.log(" EXAMPLE: " + selectedExample);
        if (this.examples.has(selectedExample)) {
            this.navigateToExample(this.examples.get(selectedExample));
        } else if (selectedExample.indexOf("/") > 0) {
            this.navigateToExample(selectedExample);
        }
    }

    protected navigateToExample(exampleFullPath: string) {
        try {
            frame.topmost().navigate(TestPageMainViewModel.APP_NAME + "/" + exampleFullPath);
        } catch (error) {
            console.log("EXAMPLE LOAD FAILED:" + error);
            alert("Cannot find example: " + exampleFullPath);

        }
    }

    protected loadExample(exampleName: string) {
        console.log("exampleName EXAMPLE: " + exampleName);
        this.selectExample(exampleName);
    }

    private shouldLoadBtns(): boolean {
        return this.buttonsPanel.getChildrenCount() <= 0;
    }

    private loadButtons() {
        var count = 0;

        this.examples.forEach((element, key) => {
            var btn = new Button();
            if (platform.isAndroid) {
                btn.style.height = 25;
                btn.style.fontSize = 10;
                btn.style.padding = 0;
            } else {
                btn.style.padding = 5;
            }
            btn.style.marginRight = 5;
            btn.style.marginBottom = 5;

            btn.style.color = new Color("white");
            btn.style.backgroundColor = new Color(this._colors[count++ % 3]);
            btn.style.borderRadius = 5;
            btn.on(Button.tapEvent, function (eventData) {
                let text = btn.text;
                this.loadExample(text);
            }, this);

            btn.text = key;
            this.buttonsPanel.addChild(btn)
        });
    }

    private sortMap(map: Map<string, string>) {
        let arrayOfKeys = new Array<string>();
        map.forEach((value, key, map) => {
            arrayOfKeys.push(key);
        })

        arrayOfKeys.sort((a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
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
