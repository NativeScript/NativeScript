import { EventData, WrapLayout, Page } from '@nativescript/core';
import { SubMainPageViewModel } from '../sub-main-page-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('segStyle', 'segmented-bar/all-page');
	examples.set('clean', 'segmented-bar/clean-page');
	examples.set('android-enabled', 'segmented-bar/android-enabled-page');

	return examples;
}
