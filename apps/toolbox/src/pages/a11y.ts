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
	largeImageSrc = 'https://picsum.photos/seed/VlpchW0ODhflKm0SKOYQrc8qysLWbqKmDS1MGT9apAc/5000/5000';

	constructor() {
		super();
	}

	checkedChange(args) {
		const checked = (args.object as Switch).checked;
		console.log(checked);
		this.notifyPropertyChange('switchCheckedText', `${this.labelText} ${checked}`);

		// prettier-ignore
		this.notifyPropertyChange('largeImageSrc', checked ? 
			'https://picsum.photos/seed/VlpchW0ODhflKm0SKOYQrc8qysLWbqKmDS1MGT9apAc/5000/5000' : 
			'https://picsum.photos/seed/loiXO_OQ-y86XY_hc7p3qJdY39fSd9CuDM0iA_--P4Q/5000/5000');
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
