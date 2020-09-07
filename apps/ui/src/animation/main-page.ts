import { SubMainPageViewModel } from '../sub-main-page-view-model';
import { EventData, WrapLayout, Page, ActionBar } from '@nativescript/core';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('animation-curves', 'animation/animation-curves-page');
	examples.set('animation-army-100', 'animation/animation-army-100-page');
	examples.set('height-basic', 'animation/height-basic-page');
	examples.set('layout-stack-height', 'animation/layout-stack-height-page');
	examples.set('effect-summary-details', 'animation/effect-summary-details-page');

	return examples;
}
