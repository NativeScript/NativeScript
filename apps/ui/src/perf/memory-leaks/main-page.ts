import { EventData } from '@nativescript/core/data/observable';
import { TestPageMainViewModel } from '../../test-page-main-view-model';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { Page } from '@nativescript/core/ui/page';
import { isAndroid } from '@nativescript/core/platform';

export function pageLoaded(args: EventData) {
	let page = <Page>args.object;
	let view = require('@nativescript/core/ui/core/view');

	let wrapLayout = view.getViewById(page, 'wrapLayoutWithExamples');

	let examples: Map<string, string> = new Map<string, string>();
	if (isAndroid) {
		examples.set('background-image', 'perf/memory-leaks/background-image-page');
	}
	let viewModel = new SubMainPageViewModel(wrapLayout, examples);
	page.bindingContext = viewModel;
}

export class SubMainPageViewModel extends TestPageMainViewModel {
	constructor(container: WrapLayout, examples: Map<string, string>) {
		super(container, examples);
	}
}
