import { Page, Observable, EventData, Label, Color } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	strokeLabel: Label;

	loadedStrokeLabel(args) {
		this.strokeLabel = args.object;
	}

	toggleStrokeStyle() {
		if (this.strokeLabel.style.textStroke) {
			this.strokeLabel.style.color = new Color('black');
			this.strokeLabel.style.textStroke = null;
		} else {
			this.strokeLabel.style.color = new Color('white');
			this.strokeLabel.style.textStroke = {
				color: new Color('black'),
				width: { value: 2, unit: 'px' },
			};
		}
	}
}
