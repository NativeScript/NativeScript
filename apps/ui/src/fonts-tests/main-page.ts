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
	examples.set('fontbtn', 'fonts-tests/button-page');
	examples.set('fontlbl', 'fonts-tests/label-page');
	examples.set('fontfield', 'fonts-tests/text-field-page');
	examples.set('fontview', 'fonts-tests/text-view-page');
	examples.set('nordic', 'fonts-tests/nordic/nordic-page');
	examples.set('customfonts', 'fonts-tests/custom-fonts-page');
	examples.set('all-fonts', 'fonts-tests/all-fonts-page');
	examples.set('awesome-3654', 'fonts-tests/font-awesome/issue-3654-page');
	examples.set('fonts-weight', 'fonts-tests/fonts-weight/main-page');

	return examples;
}
