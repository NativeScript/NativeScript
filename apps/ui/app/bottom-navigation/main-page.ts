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
	examples.set('bottom-navigation', 'bottom-navigation/bottom-navigation-page');
	examples.set('issue-5470', 'bottom-navigation/issue-5470-page');
	examples.set('background-color', 'bottom-navigation/background-color-page');
	examples.set('color', 'bottom-navigation/color-page');
	examples.set('events', 'bottom-navigation/events-page');
	examples.set('font', 'bottom-navigation/font-page');
	examples.set('text-transform', 'bottom-navigation/text-transform-page');
	examples.set('icon-title-placement', 'bottom-navigation/icon-title-placement-page');
	examples.set('icon-change', 'bottom-navigation/icon-change-page');
	examples.set('binding', 'bottom-navigation/binding-page');
	examples.set('font-icons', 'bottom-navigation/font-icons-page');
	examples.set('fancy-fonts', 'bottom-navigation/fancy-fonts-page');
	examples.set('css-text-transform', 'bottom-navigation/bottom-navigation-css-page');
	examples.set('custom-tabstrip', 'bottom-navigation/custom-tabstrip-page');
	examples.set('reselect', 'bottom-navigation/reselect-page');
	examples.set('item-color', 'bottom-navigation/item-color-page');
	examples.set('dynamic-color-change', 'bottom-navigation/dynamic-color-change-page');

	return examples;
}
