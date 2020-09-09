import { ObservableArray } from '@nativescript/core/data/observable-array';
import { TestExample } from './test-example-model';
import { TestPageMainViewModel } from './test-page-main-view-model';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { ListView } from '@nativescript/core/ui/list-view';

export class MainPageViewModel extends TestPageMainViewModel {
	private _exampleName: string;
	private _filteredListOfExamples: ObservableArray<TestExample>;
	public static ALL_EXAMPLES: ObservableArray<TestExample>;
	public static _examplesDictionary: Map<string, TestExample>;

	constructor(buttonsPanel: WrapLayout, examples: Map<string, string>) {
		super(buttonsPanel, examples);
		if (MainPageViewModel.ALL_EXAMPLES === undefined || MainPageViewModel.ALL_EXAMPLES.length === 0) {
			MainPageViewModel.ALL_EXAMPLES = new ObservableArray<TestExample>();
			MainPageViewModel._examplesDictionary = new Map<string, TestExample>();
			this._filteredListOfExamples = new ObservableArray<TestExample>();
			this.loadFilteredListOfExamplesRecursive(this._examples);
			this.getFilteredExamplesContainer().visibility = 'hidden';
		}
		this.filterListView(this.exampleName);
		this.toggleExamplePanels(this.filteredListOfExamples);
	}

	get exampleName(): string {
		return this._exampleName;
	}

	set exampleName(value: string) {
		if (this._exampleName !== value) {
			this._exampleName = value;
			this.filterListView(value);
		}
	}

	get filteredListOfExamples(): ObservableArray<TestExample> {
		return this._filteredListOfExamples;
	}

	set filteredListOfExamples(array: ObservableArray<TestExample>) {
		if (this._filteredListOfExamples !== array) {
			this._filteredListOfExamples = array;
			this.notifyPropertyChange('filteredListOfExamples', array);
			this.toggleExamplePanels(array);
		}
	}

	public static checkIfStringIsNullEmptyOrUndefined(value: string): boolean {
		return value === '' || value === null || value === undefined;
	}

	public static stringContains(value: string, searchString: string): boolean {
		return value.indexOf(searchString) >= 0;
	}

	public loadExampleFromTextField() {
		super.loadExample(this.exampleName);
	}

	public loadExampleFromListView(example) {
		let examplePath = this.filteredListOfExamples.getItem(example.index).path;
		this.exampleName = examplePath;
		if (MainPageViewModel.checkIfStringIsNullEmptyOrUndefined(this.exampleName)) {
			return;
		}

		super.navigateToExample(this.exampleName);
	}

	private filterListView(value: string) {
		if (!MainPageViewModel.checkIfStringIsNullEmptyOrUndefined(value)) {
			let array = MainPageViewModel.ALL_EXAMPLES.filter((testExample, index, array) => {
				return MainPageViewModel.stringContains(testExample.path.toLowerCase(), value.toLowerCase()) || MainPageViewModel.stringContains(testExample.name.toLowerCase(), value.toLowerCase());
			});
			this.filteredListOfExamples = new ObservableArray(array);
		} else {
			this.filteredListOfExamples = null;
		}
	}

	private checkIfExampleAlreadyExists(dictionary: Map<string, TestExample>, value: string): boolean {
		if (dictionary.has(value)) {
			return true;
		}

		return false;
	}

	private toggleExamplePanels(array: ObservableArray<TestExample>) {
		let listView = this.getFilteredExamplesContainer();
		if (array !== null && array !== undefined && array.length > 0) {
			this.buttonsPanel.visibility = 'hidden';
			listView.visibility = 'visible';
		} else {
			this.buttonsPanel.visibility = 'visible';
			listView.visibility = 'hidden';
		}
	}

	private loadFilteredListOfExamplesRecursive(examples: Map<string, string>) {
		examples.forEach((value, key, map) => {
			let requiredExample = value;
			if (MainPageViewModel.stringContains(value, 'main')) {
				try {
					let module = global.loadModule(requiredExample);
					if (module.loadExamples !== undefined) {
						var currentExamples = new Map<string, string>();
						currentExamples = module.loadExamples();
						currentExamples.forEach((v, key, map) => {
							this.loadFilteredListOfExamplesRecursive(currentExamples);
						});
					}
				} catch (error) {
					console.log(error.message);
				}
			} else {
				if (!this.checkIfExampleAlreadyExists(MainPageViewModel._examplesDictionary, value)) {
					const testExample = new TestExample(key, value);
					this.filteredListOfExamples.push(testExample);
					MainPageViewModel.ALL_EXAMPLES.push(testExample);
					MainPageViewModel._examplesDictionary.set(value, testExample);
				}
			}
		});
	}

	private getFilteredExamplesContainer() {
		return <ListView>this.buttonsPanel.page.getViewById('filteredListOfExamplesListView');
	}
}
