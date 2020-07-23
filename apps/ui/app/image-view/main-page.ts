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
	examples.set('roundbtn', 'image-view/rounded-buttons-page');
	examples.set('roundimg', 'image-view/rounded-images-page');
	examples.set('mode-matrix', 'image-view/mode-matrix-page');
	examples.set('stretch-modes', 'image-view/stretch-modes-page');
	examples.set('missing-image', 'image-view/missing-image-page');
	examples.set('image-asset', 'image-view/image-asset/image-asset-page');
	examples.set('font-icons', 'image-view/font-icons-page');

	return examples;
}
