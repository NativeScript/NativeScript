import { EventData, WrapLayout, Page } from '@nativescript/core';
import { SubMainPageViewModel } from '../sub-main-page-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('secured-text-field', 'text-field/secured-text-field-4135-page');
	examples.set('max-length', 'text-field/max-length-page');
	examples.set('text-field-border', 'text-field/text-field-border-page');
	examples.set('focus-blur-events', 'text-field/focus-blur-events-page');

	return examples;
}
