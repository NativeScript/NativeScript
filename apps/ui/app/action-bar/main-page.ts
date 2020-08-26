import { EventData, Frame, Button, ActionBar, WrapLayout, Page } from '@nativescript/core';
import { SubMainPageViewModel } from '../sub-main-page-view-model';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('actColor', 'action-bar/color-page');
	examples.set('actBG', 'action-bar/background-page');
	examples.set('actStyle', 'action-bar/all-page');
	examples.set('actIcons', 'action-bar/system-icons-page');
	examples.set('actLocalIcons', 'action-bar/local-icons-page');
	examples.set('actResIcons', 'action-bar/icons-page');
	examples.set('actView', 'action-bar/action-view-page');
	examples.set('actionItemPosition', 'action-bar/action-item-position-page');
	examples.set('actBGCss', 'action-bar/background-css-page');
	examples.set('actTransparentBgCss', 'action-bar/transparent-bg-css-page');
	examples.set('modalHiddenActBar', 'action-bar/modal-test-hidden-action-bar-page');
	examples.set('modalShownActBar', 'action-bar/modal-test-with-action-bar-page');
	examples.set('font-icons', 'action-bar/font-icons-page');
	examples.set('flat', 'action-bar/flat-page');
	examples.set('flat-tab', 'action-bar/flat-tab-page');
	examples.set('flat-tab-opaque-bar', 'action-bar/flat-tab-opaque-bar-page');
	examples.set('flat-layout', 'action-bar/flat-layout-page');
	examples.set('flat-scrollview', 'action-bar/flat-scrollview-page');

	return examples;
}
