import { EventData } from '@nativescript/core/data/observable';
import { SubMainPageViewModel } from '../../sub-main-page-view-model';
import { WrapLayout } from '@nativescript/core/ui/layouts/wrap-layout';
import { Page } from '@nativescript/core/ui/page';

export function loadExamples() {
	const examples = new Map<string, string>();
	examples.set('system', 'fonts-tests/fonts-weight/system-page');
	examples.set('sans-serif', 'fonts-tests/fonts-weight/sans-serif-page');
	examples.set('serif', 'fonts-tests/fonts-weight/serif-page');
	examples.set('monospace', 'fonts-tests/fonts-weight/monospace-page');
	examples.set('courier-new', 'fonts-tests/fonts-weight/courier-new-page');
	examples.set('helvetica', 'fonts-tests/fonts-weight/helvetica-page');
	examples.set('custom-fontawesome', 'fonts-tests/fonts-weight/custom-fontawesome-page');
	examples.set('custom-muli', 'fonts-tests/fonts-weight/custom-muli-page');
	examples.set('custom-sofia', 'fonts-tests/fonts-weight/custom-sofia-page');
	examples.set('font-fallback', 'fonts-tests/fonts-weight/font-fallback-page');

	return examples;
}

export function pageLoaded(args: EventData) {
	const page = <Page>args.object;
	const wrapLayout = <WrapLayout>page.getViewById('wrapLayoutWithExamples');
	page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}
