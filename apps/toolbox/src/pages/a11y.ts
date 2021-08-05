import { Observable, EventData, Page, Switch, AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, ShowModalOptions } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new AccessibilityModel();
	page.onAccessibilityPerformEscape = () => {
		console.log('onAccessibilityPerformEscape');
		return true;
	};
}

export class AccessibilityModel extends Observable {
	labelText = 'Label change on Switch:';
	switchCheckedText = this.labelText;
	accessibilityLiveRegions = AccessibilityLiveRegion;
	accessibilityRole = AccessibilityRole;
	accessibilityState = AccessibilityState;

	constructor() {
		super();
	}

	checkedChange(args) {
		const checked = (args.object as Switch).checked;
		console.log(checked);
		this.set('switchCheckedText', `${this.labelText} ${checked}`);
	}

	openModal() {
		page.showModal('pages/sample-modal');
	}
}
