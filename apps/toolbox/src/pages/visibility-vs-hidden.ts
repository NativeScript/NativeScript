import { Observable, EventData, Page, CoreTypes } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new VisibilityVsHiddenModel();
}

export class VisibilityVsHiddenModel extends Observable {
	currentVisibility = CoreTypes.Visibility.visible;
	currentVisibilityType = `Current Visibility: ${this.currentVisibility}`;
	currentVisibilityIndex = 0;
	visibilityOptions = [CoreTypes.Visibility.visible, CoreTypes.Visibility.collapse, CoreTypes.Visibility.hidden];

	currentHidden = false;
	currentHiddenType = `Current Hidden: ${this.currentHidden}`;

	toggleVisibility() {
		this.currentVisibilityIndex++;
		if (this.currentVisibilityIndex === 3) {
			this.currentVisibilityIndex = 0;
		}
		this.set('currentVisibility', this.visibilityOptions[this.currentVisibilityIndex]);
		this.set('currentVisibilityType', `Current Visibility: ${this.visibilityOptions[this.currentVisibilityIndex]}`);
	}

	toggleHidden() {
		this.set('currentHidden', !this.currentHidden);
		this.set('currentHiddenType', `Current Hidden: ${this.currentHidden}`);
	}
}
