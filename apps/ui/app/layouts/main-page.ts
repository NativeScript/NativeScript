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
	examples.set('absolute', 'layouts/absolute-page');
	examples.set('dock', 'layouts/dock-page');
	examples.set('grid', 'layouts/grid-page');
	examples.set('stack', 'layouts/stack-page');
	examples.set('wrap', 'layouts/wrap-page');
	examples.set('pabsolute', 'layouts-percent/absolute-page');
	examples.set('pdock', 'layouts-percent/dock-page');
	examples.set('pgrid', 'layouts-percent/grid-page');
	examples.set('pstack', 'layouts-percent/stack-page');
	examples.set('pwrap', 'layouts-percent/wrap-page');
	examples.set('passThroughParent', 'layouts/passThroughParent-page');
	examples.set('stacklayout-6059', 'layouts/stacklayout-6059-page');
	examples.set('grid-7295', 'layouts/grid-7295-page');
	examples.set('safe-area', 'layouts/safe-area-page');

	return examples;
}
