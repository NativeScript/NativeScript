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
	examples.set('2911', 'issues/issue-2911-page');
	examples.set('2674', 'issues/issue-2674-page');
	examples.set('2942', 'issues/issue-2942-page');
	examples.set('3007', 'issues/issue-3007-page');
	examples.set('2661', 'issues/issue-2661-page');
	examples.set('3113', 'issues/issue-3113-page');
	examples.set('3164', 'issues/issue-3164-page');
	examples.set('3175', 'issues/issue-3175-page');
	examples.set('3211', 'issues/issue-3211-page');
	examples.set('1639', 'issues/issue-1639-page');
	examples.set('3714', 'issues/issue-3714-page');
	examples.set('1657-ios', 'issues/issue-1657-ios-page');
	examples.set('tabview-with-scrollview_4022', 'issues/tabview-with-scrollview_4022-page');
	examples.set('3354-ios', 'issues/issue-3354-page');
	examples.set('4450', 'issues/issue-4450-page');
	examples.set('5125', 'issues/issue-5125-page');
	examples.set('5274', 'issues/issue-5274-page');
	examples.set('ng-repo-1599', 'issues/issue-ng-repo-1599-page');
	examples.set('ng-repo-1626', 'issues/issue-ng-repo-1626-page');
	examples.set('6439', 'issues/issue-6439-page');
	examples.set('open-file-6895', 'issues/open-file-6895-page');

	return examples;
}
