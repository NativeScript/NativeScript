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
	examples.set('full-screen-n-n', 'nested-frames/full-screen-n-n-page');
	examples.set('full-screen-n-y', 'nested-frames/full-screen-n-y-page');
	examples.set('full-screen-n-y-flat', 'nested-frames/full-screen-n-y-flat-page');
	examples.set('full-screen-y-n', 'nested-frames/full-screen-y-n-page');
	examples.set('full-screen-y-n-flat', 'nested-frames/full-screen-y-n-flat-page');
	examples.set('full-screen-y-y', 'nested-frames/full-screen-y-y-page');
	examples.set('full-screen-y-y-flat', 'nested-frames/full-screen-y-y-flat-page');
	examples.set('mid-screen-n-n', 'nested-frames/mid-screen-n-n-page');
	examples.set('mid-screen-n-y', 'nested-frames/mid-screen-n-y-page');
	examples.set('mid-screen-n-y-flat', 'nested-frames/mid-screen-n-y-flat-page');
	examples.set('mid-screen-y-n', 'nested-frames/mid-screen-y-n-page');
	examples.set('mid-screen-y-n-flat', 'nested-frames/mid-screen-y-n-flat-page');
	examples.set('mid-screen-y-y', 'nested-frames/mid-screen-y-y-page');
	examples.set('mid-screen-y-y-flat', 'nested-frames/mid-screen-y-y-flat-page');
	examples.set('tab-y-y', 'nested-frames/tab-y-y-page');
	examples.set('tab-y-y-flat', 'nested-frames/tab-y-y-flat-page');
	examples.set('tab-n-y', 'nested-frames/tab-n-y-page');
	examples.set('tab-n-y-flat', 'nested-frames/tab-n-y-flat-page');
	examples.set('tab-y-n', 'nested-frames/tab-y-n-page');
	examples.set('tab-y-n-flat', 'nested-frames/tab-y-n-flat-page');
	examples.set('tab-n-n', 'nested-frames/tab-n-n-page');

	return examples;
}
