import { Observable } from '@nativescript/core/data/observable';
import { Button } from '@nativescript/core/ui/button';
import { Color } from '@nativescript/core/color';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { alert } from '@nativescript/core/ui/dialogs';
import * as frame from '@nativescript/core/ui/frame';
import * as platform from '@nativescript/core/platform';

export class TestPageMainViewModel extends Observable {
	private _colors = ['#0000cc', '#33cc33', '#0000cc'];

	public basePath: string = '';

	constructor(protected buttonsPanel: WrapLayout, protected _examples: Map<string, string>) {
		super();
		if (this.shouldLoadBtns()) {
			this.sortMap(this._examples);
			this.loadButtons();
		}
	}

	protected selectExample(selectedExample: any) {
		console.log(' EXAMPLE: ' + selectedExample);
		if (this._examples.has(selectedExample)) {
			this.navigateToExample(this._examples.get(selectedExample));
		} else if (selectedExample && selectedExample.indexOf('/') > 0) {
			this.navigateToExample(selectedExample);
		}
	}

	protected navigateToExample(exampleFullPath: string) {
		try {
			frame.topmost().navigate(exampleFullPath);
		} catch (error) {
			console.log('EXAMPLE LOAD FAILED:' + error);
			alert('Error loading example: ' + exampleFullPath + ' \nerror: ' + error && error.message);
		}
	}

	protected loadExample(exampleName: string) {
		console.log('exampleName EXAMPLE: ' + exampleName);
		this.selectExample(exampleName);
	}

	private shouldLoadBtns(): boolean {
		return this.buttonsPanel.getChildrenCount() <= 0;
	}

	private loadButtons() {
		var count = 0;

		this._examples.forEach((element, key) => {
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

			btn.style.color = new Color('white');
			btn.style.backgroundColor = new Color(this._colors[count++ % 3]);
			btn.style.borderRadius = 5;
			btn.on(
				Button.tapEvent,
				function (eventData) {
					let text = btn.text;
					this.loadExample(text);
				},
				this
			);

			btn.text = key;
			btn.automationText = key;
			this.buttonsPanel.addChild(btn);
		});
	}

	private sortMap(map: Map<string, string>) {
		let arrayOfKeys = new Array<string>();
		map.forEach((value, key, map) => {
			arrayOfKeys.push(key);
		});

		arrayOfKeys.sort((a, b) => {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}

			return a.localeCompare(b);
		});

		let sortedExamples = new Map<string, string>();
		arrayOfKeys.forEach((k) => {
			sortedExamples.set(k, this._examples.get(k));
		});

		this._examples.clear();
		this._examples = sortedExamples;
	}
}
