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
	examples.set('tabColor', 'tab-view/color-page');
	examples.set('tabBG', 'tab-view/background-page');
	examples.set('tabTabsBG', 'tab-view/tabsBackground-page');
	examples.set('tabSelected', 'tab-view/selected-page');
	examples.set('tabStyle', 'tab-view/all-page');
	examples.set('tabmore', 'tab-view/tab-view-more-page');
	examples.set('tabViewCss', 'tab-view/tab-view-css-page');
	examples.set('tab-view-icons', 'tab-view/tab-view-icon-page');
	examples.set('tab-view-icons-local', 'tab-view/tab-view-icon-local-page');
	examples.set('tab-view-icon-change', 'tab-view/tab-view-icon-change-page');
	examples.set('text-transform', 'tab-view/text-transform-page');
	examples.set('tab-view-bottom-position', 'tab-view/tab-view-bottom-position-page');
	examples.set('issue-5470', 'tab-view/issue-5470-page');
	examples.set('tab-view-tab-text-font-size', 'tab-view/tab-view-tab-text-font-size-page');
	examples.set('tab-view-android-swipe', 'tab-view/tab-view-android-swipe-page');
	examples.set('tab-view-icon-title-placement', 'tab-view/icon-title-placement-page');
	examples.set('tab-text-color', 'tab-view/tab-text-color-page');

	return examples;
}
