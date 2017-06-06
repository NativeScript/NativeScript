import { ObservableArray } from "tns-core-modules/data/observable-array";
import { TestExample } from "./test-example-model";
import { TestPageMainViewModel } from "./test-page-main-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { ListView } from "tns-core-modules/ui/list-view";
import * as frame from "tns-core-modules/ui/frame";
import * as dialogs from "tns-core-modules/ui/dialogs";

export class MainPageViewModel extends TestPageMainViewModel {

    private _exampleName: string;
    private _allExamples: ObservableArray<TestExample>;
    public static ALL_EXAMPLES: ObservableArray<TestExample>;
    public static _examplesDictionary: Map<string, TestExample>;

    constructor(buttonsPanel: WrapLayout, examples: Map<string, string>) {
        super(buttonsPanel, examples);
        if (MainPageViewModel.ALL_EXAMPLES === undefined || MainPageViewModel.ALL_EXAMPLES.length === 0) {
            MainPageViewModel.ALL_EXAMPLES = new ObservableArray<TestExample>();
            MainPageViewModel._examplesDictionary = new Map<string, TestExample>();
            this._allExamples = new ObservableArray<TestExample>();
            this.loadAllExamplesRecursive(this.examples);
            let listView = <ListView>buttonsPanel.page.getViewById("allExamplesListView");
            listView.visibility = "hidden";
        }
        this.filterListView(this.exampleName);
        this.toggleExamplePanels(this.allExamples);
    }

    get exampleName(): string {
        return this._exampleName;
    }

    set exampleName(value: string) {
        if (this._exampleName !== value) {
            this._exampleName = value;
            this.notifyPropertyChange("exampleName", value);
            this.filterListView(value);
        }
    }

    get allExamples(): ObservableArray<TestExample> {
        return this._allExamples;
    }

    set allExamples(array: ObservableArray<TestExample>) {
        if (this._allExamples !== array) {
            this._allExamples = array
            this.notifyPropertyChange("allExamples", array);
            this.toggleExamplePanels(array);
        }
    }

    public loadExampleFromListView(example) {
        let exmaplePath = this.allExamples.getItem(example.index).path;
        frame.topmost().navigate(MainPageViewModel.APP_NAME + "/" + exmaplePath);
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

    private filterListView(value: string) {
        if (value !== "" && value !== undefined) {
            let array = MainPageViewModel.ALL_EXAMPLES.filter((testExample, index, array) => {
                return testExample.path.toLowerCase().indexOf(value.toLowerCase()) >= 0
                    || testExample.name.toLowerCase().indexOf(value.toLowerCase()) >= 0;
            });
            this.allExamples = new ObservableArray(array);
        } else {
            this.allExamples = null;
        }
    }

    private checkIfExampleAlreadyExists(dictionary: Map<string, TestExample>, value: string): boolean {
        if (dictionary.has(value)) {
            return true;
        }

        return false;
    }

    private toggleExamplePanels(array: ObservableArray<TestExample>) {
        let listView = <ListView>this.buttonsPanel.page.getViewById("allExamplesListView");
        if (array !== null && array !== undefined && array.length > 0) {
            this.buttonsPanel.visibility = "hidden";
            listView.visibility = "visible";
        } else {
            this.buttonsPanel.visibility = "visible";
            listView.visibility = "hidden";
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
                if (!this.checkIfExampleAlreadyExists(MainPageViewModel._examplesDictionary, value)) {
                    const testExample = new TestExample(key, value);
                    this._allExamples.push(testExample);
                    MainPageViewModel.ALL_EXAMPLES.push(testExample);
                    MainPageViewModel._examplesDictionary.set(value, testExample)
                }
            }
        });
    }
}