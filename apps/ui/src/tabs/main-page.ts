import { EventData, WrapLayout, Page } from '@nativescript/core';

import { SubMainPageViewModel } from '../sub-main-page-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('tabs', 'tabs/tabs-page');
	examples.set('issue-5470', 'tabs/issue-5470-page');
	examples.set('background-color', 'tabs/background-color-page');
	examples.set('color', 'tabs/color-page');
	examples.set('events', 'tabs/events-page');
	examples.set('font', 'tabs/font-page');
	examples.set('text-transform', 'tabs/text-transform-page');
	examples.set('highlight-color', 'tabs/highlight-color-page');
	examples.set('icon-title-placement', 'tabs/icon-title-placement-page');
	examples.set('icon-change', 'tabs/icon-change-page');
	examples.set('swipe-disabled', 'tabs/swipe-disabled-page');
	examples.set('strip-item', 'tabs/tab-strip-item-page');
	examples.set('strip-items', 'tabs/tab-strip-items-page');
	examples.set('reselect', 'tabs/reselect-page');
	examples.set('tabs-position', 'tabs/tabs-position-page');
	examples.set('tabs-binding', 'tabs/tabs-binding-page');
	examples.set('font-icons', 'tabs/font-icons-page');
	examples.set('nested-layout', 'tabs/nested-layout-page');
	examples.set('nested-bottom-navigation', 'tabs/nested-bottom-navigation-page');
	examples.set('custom-tabstrip', 'tabs/custom-tabstrip-page');
	examples.set('frame-in-tabs', 'tabs/frame-in-tabs');
	examples.set('item-color', 'tabs/item-color-page');
	examples.set('dynamic-color-change', 'tabs/dynamic-color-change-page');

	return examples;
}
