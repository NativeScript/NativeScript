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
import { ListView } from "tns-core-modules/ui/list-view";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Observable } from "tns-core-modules/data/observable";

export function pageLoaded(args: EventData) {
    let examples: Map<string, string> = new Map<string, string>();

    let page = <Page>args.object;
    let wrapLayout = page.getViewById<WrapLayout>("wrapLayoutWithExamples");
    examples.set("action-bar", "action-bar/main-page");
    examples.set("bindings", "bindings/main-page");
    examples.set("css", "css/main-page");
    examples.set("image-view", "image-view/main-page");
    examples.set("tab-view", "tab-view/main-page");
    examples.set("layouts", "layouts/main-page");
    examples.set("events", "events/main-page");
    examples.set("webview", "web-view/main-page");
    examples.set("flexbox", "flexbox/flexbox-main-page");

    examples.set("modalview", "modal-view/modal-view");
    examples.set("dialogs", "dialogs/dialogs");
    examples.set("htmlview", "html-view/html-view");
    examples.set("timePicker", "time-picker/time-picker");
    examples.set("segStyle", "segmented-bar/all");
    examples.set("list-view", "list-view/main-page");
    examples.set("issues", "issues/main-page");
    examples.set("page", "page/main-page");

    examples.set("perf", "perf/main-page");
    examples.set("list-picker", "list-picker/main-page");

    examples.set("listview_binding", "pages/listview_binding");
    examples.set("textfield", "text-field/main-page");
    examples.set("button", "button/main-page");
    examples.set("perf", "perf/main-page");

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
    private static APP_NAME: string = "ui-tests-app";
    private _exampleName: string;
    private _colors = ["#ff0000", "#0000cc", "#33cc33", "#33cc33"];
    private _allExamples: ObservableArray<TestExample>;

    public static ALL_EXAMPLES: ObservableArray<TestExample>;

    public basePath: string = "";
    public examples: Map<string, string> = new Map<string, string>();

    constructor(private panel: WrapLayout, private _examples: Map<string, string>) {
        super();
        trace.enable();
        trace.setCategories(trace.categories.Test);
        this.examples = _examples;

        if (MainPageViewModel.ALL_EXAMPLES === undefined || MainPageViewModel.ALL_EXAMPLES.length == 0) {
            MainPageViewModel.ALL_EXAMPLES = new ObservableArray<TestExample>();
            this._allExamples = new ObservableArray<TestExample>();
            this.loadAllExamplesRecursive(this.examples);
            let listView = <ListView>this.panel.page.getViewById("allExamplesListView");
            listView.visibility = "hidden";
        }

        if (this.shouldLoadBtns()) {
            this.sortMap(this.examples);
            this.loadButtons();
        }
    }

    get allExamples(): ObservableArray<TestExample> {
        return this._allExamples;
    }

    set allExamples(array: ObservableArray<TestExample>) {
        if (this._allExamples != array) {
            this._allExamples = array
            this.notifyPropertyChange("allExamples", array);
            this.toggleExamplePanels(array);
        }
    }

    get exampleName(): string {
        return this._exampleName;
    }

    set exampleName(value: string) {
        if (this._exampleName !== value) {
            this._exampleName = value;
            this.notifyPropertyChange("exampleName", value);
            if (value !== "") {
                let array = MainPageViewModel.ALL_EXAMPLES.filter((testExample, index, array) => {
                    return testExample.path.toLowerCase().indexOf(value.toLowerCase()) >= 0 
                           || testExample.name.toLowerCase().indexOf(value.toLowerCase()) >= 0;
                });
                this.allExamples = new ObservableArray(array);
            } else {
                this.allExamples = null;
            }
        }
    }

    public loadExampleFromListView(example) {
        let exmaplePath = this.allExamples.getItem(example.index).path;
        frame.topmost().navigate(MainPageViewModel.APP_NAME + "/" + exmaplePath);
    }

    public loadExample(exampleName: string) {
        console.log("exampleName EXAMPLE: " + exampleName);
        this.selectExample(exampleName);
    }

    public loadExmaple() {
        if (this.exampleName === "" || this.exampleName === null || this.exampleName === undefined) {
            return;
        }
        let selectedExample = this.exampleName.toLocaleLowerCase().trim();
        this.exampleName = selectedExample;
        if (selectedExample.indexOf("/") > 0) {
            try {
                frame.topmost().navigate(MainPageViewModel.APP_NAME + "/" + selectedExample);
            } catch (error) {
                dialogs.alert("Cannot find example: " + selectedExample);
            }
        } else {
            this.selectExample(this.exampleName.toLocaleLowerCase());
        }
    }

    private loadAllExamplesRecursive(examples: Map<string, string>) {
        examples.forEach((value, key, map) => {
            let requiredExample = "~/" + MainPageViewModel.APP_NAME + "/" + value;
            if (value.indexOf("main") > 0) {
                try {
                    let module = require(requiredExample);
                    if (module.loadExamples !== undefined) {
                        var currentExamples = new Map<string, string>();
                        currentExamples = module.loadExamples();
                        currentExamples.forEach((v, key, map) => {
                            this.loadAllExamplesRecursive(currentExamples);
                        });
                    }
                } catch (error) {
                    console.log(error.message);
                }
            } else {
                if (!this.checkIfExampleAlreadyExists(MainPageViewModel.ALL_EXAMPLES, value)) {
                    this._allExamples.push(new TestExample(key, value));
                    MainPageViewModel.ALL_EXAMPLES.push(new TestExample(key, value));
                } else {
                    console.log(value);
                }
            }
        });
    }

    private shouldLoadBtns(): boolean {
        return this.panel.getChildrenCount() <= 0;
    }

    private selectExample(selectedExample: any) {
        console.log(" EXAMPLE: " + selectedExample);

        if (this.examples.has(selectedExample)) {
            frame.topmost().navigate(MainPageViewModel.APP_NAME + "/" + this.basePath + "/" + this.examples.get(selectedExample));
        } else {
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

            btn.style.color = new colorModule.Color(this._colors[count++ % 3]);
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

    private checkIfExampleAlreadyExists(array: ObservableArray<TestExample>, value: string): boolean {
        let result = false;
        array.forEach(element => {
            if (element.path.toLowerCase() === value.toLowerCase()) {
                result = true;
                return;
            }
        });

        return result;
    }

    private toggleExamplePanels(array: ObservableArray<TestExample>) {
        let listView = <ListView>this.panel.page.getViewById("allExamplesListView");
        if (array !== null && array !== undefined && array.length > 0) {
            this.panel.visibility = "hidden";
            listView.visibility = "visible";
        } else {
            this.panel.visibility = "visible";
            listView.visibility = "hidden";
        }
    }
}

export class TestExample extends Observable {
    private _name: string;
    private _path: string;

    constructor(name: string, path: string) {
        super();
        this._name = name;
        this._path = path;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        if (this._name !== value) {
            this._name = value;
            this.notifyPropertyChange('name', value)
        }
    }

    get path(): string {
        return this._path;
    }

    set path(value: string) {
        if (this._path !== value) {
            this._path = value;
            this.notifyPropertyChange('path', value)
        }
    }
}
