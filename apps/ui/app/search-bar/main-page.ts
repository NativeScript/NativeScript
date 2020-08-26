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
	examples.set('issue-4147', 'search-bar/issue-4147-page');
	examples.set('search-bar', 'search-bar/search-bar-page');
	examples.set('issue-5039', 'search-bar/issue-5039-page');
	examples.set('issue-5655', 'search-bar/issue-5655-page');

	return examples;
}
