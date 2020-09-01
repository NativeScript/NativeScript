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
	examples.set('list-view-templates', 'list-view/list-view-page');
	examples.set('images-template', 'list-view/images-template-page');
	examples.set('dynamic-templates', 'list-view/dynamic-templates-page');
	examples.set('bindings', 'list-view/listview-binding-page');
	examples.set('listview-bg-separator-color', 'list-view/listview-bg-separator-color-page');
	examples.set('csslv', 'list-view/csslv-page');
	examples.set('scrolling-and-sizing', 'list-view/scrolling-and-sizing-page');
	examples.set('row-height', 'list-view/row-height-page');
	examples.set('width-percent', 'list-view/width-percent-page');
	examples.set('item-re-layout', 'list-view/item-re-layout-page');
	examples.set('safe-area', 'list-view/safe-area-page');
	examples.set('parents-expression', 'list-view/parents-expression-page');

	return examples;
}
