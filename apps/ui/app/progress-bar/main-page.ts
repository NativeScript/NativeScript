import { EventData } from '@nativescript/core/data/observable';
import { SubMainPageViewModel } from '../sub-main-page-view-model';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { Page } from '@nativescript/core/ui/page';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('activity-indicator', 'progress-bar/activity-indicator-page');
	examples.set('progress-bar', 'progress-bar/progress-page');

	return examples;
}
