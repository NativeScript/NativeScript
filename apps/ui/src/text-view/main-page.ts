import { EventData, WrapLayout, Page } from '@nativescript/core';
import { SubMainPageViewModel } from '../sub-main-page-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('text-view-border', 'text-view/text-view-border-page');
	examples.set('text-view-hint-color', 'text-view/text-view-hint-color-page');
	examples.set('hint-text-color', 'text-view/hint-text-color-page');
	examples.set('scrolling-and-sizing', 'text-view/scrolling-and-sizing-page');

	return examples;
}
