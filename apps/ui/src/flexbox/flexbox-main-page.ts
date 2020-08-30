import { EventData } from '@nativescript/core/data/observable';
import { SubMainPageViewModel } from '../sub-main-page-view-model';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { Page } from '@nativescript/core/ui/page';

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayout');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('flexboxall', 'flexbox/flexbox-page');
	examples.set('flexboxcss', 'flexbox/flexbox-css-page');
	examples.set('flexboxdemo', 'flexbox/flexbox-demo-page');
	examples.set('flexrepeat', 'flexbox/flexbox-repeater-page');
	examples.set('flex-perf', 'flexbox/flexbox-perf-comparison-page');
	examples.set('flexbox-4143', 'flexbox/flexbox-4143-page');
	examples.set('flexbox-4834', 'flexbox/flexbox-4834-page');

	return examples;
}
