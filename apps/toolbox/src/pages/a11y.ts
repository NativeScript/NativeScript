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
	largeImageSrc = 'https://i.picsum.photos/id/669/5000/5000.jpg?hmac=VlpchW0ODhflKm0SKOYQrc8qysLWbqKmDS1MGT9apAc';

	constructor() {
		super();
	}

	checkedChange(args) {
		const checked = (args.object as Switch).checked;
		console.log(checked);
		this.notifyPropertyChange('switchCheckedText', `${this.labelText} ${checked}`);

		// prettier-ignore
		this.notifyPropertyChange('largeImageSrc', checked ? 
			'https://i.picsum.photos/id/669/5000/5000.jpg?hmac=VlpchW0ODhflKm0SKOYQrc8qysLWbqKmDS1MGT9apAc' : 
			'https://i.picsum.photos/id/684/5000/5000.jpg?hmac=loiXO_OQ-y86XY_hc7p3qJdY39fSd9CuDM0iA_--P4Q');
	}

	openModal() {
		page.showModal('pages/sample-modal', {
			closeCallback(args) {
				console.log('close modal callback', args);
			},
		} as ShowModalOptions);
	}

	openNormal() {
		page.frame.navigate('pages/sample-modal');
	}
}
