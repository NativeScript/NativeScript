import { SubMainPageViewModel } from '../sub-main-page-view-model';
import { EventData, Page, WrapLayout } from '@nativescript/core';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('btn-wrap-text-alignment-4266', 'button/btn-wrap-text-alignment-4266-page');
	examples.set('button-border', 'button/button-border-page');
	examples.set('background', 'button/background-page');
	examples.set('border-playground', 'button/border-playground-page');
	examples.set('issue-4287', 'button/issue-4287-page');
	examples.set('issue-4385', 'button/issue-4385-page');
	examples.set('highlight-4740', 'button/highlight-4740/highlight-4740-page');
	examples.set('tappable-span', 'button/tappable-span-page');

	return examples;
}
