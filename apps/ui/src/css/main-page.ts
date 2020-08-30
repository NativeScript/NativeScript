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
	examples.set('formatted', 'css/decoration-transform-formattedtext-page');
	examples.set('radius', 'css/radius-page');
	examples.set('spacing', 'css/letter-spacing-page');
	examples.set('line-height', 'css/line-height-page');
	examples.set('decoration', 'css/text-decoration-page');
	examples.set('transform', 'css/text-transform-page');
	examples.set('whitespace', 'css/white-space-page');
	examples.set('progress-switch', 'css/progress-switch-page');
	examples.set('zindex', 'css/zindex-page');
	examples.set('clipPath', 'css/clip-path-page');
	examples.set('clipPathInset', 'css/clip-path-inset-page');
	examples.set('padding', 'css/padding-page');
	examples.set('pixels', 'css/pixels-page');
	examples.set('label-background-image', 'css/label-background-image-page');
	examples.set('transform-decoration-color', 'css/transform-decoration-color-page');
	examples.set('layout-border', 'css/layout-border-page');
	examples.set('label-border', 'css/label-border-page');
	examples.set('text-view-border', 'css/text-view-border-page');
	examples.set('image-border', 'css/image-border-page');
	examples.set('gradient-border', 'css/gradient-border-page');
	examples.set('layouts-border-overlap', 'css/layouts-border-overlap-page');
	examples.set('measure-tests', 'css/measure-tests-page');
	examples.set('all-uniform-border', 'css/all-uniform-border-page');
	examples.set('all-non-uniform-border', 'css/all-non-uniform-border-page');
	examples.set('margins-paddings-with-percentage', 'css/margins-paddings-with-percentage-page');
	examples.set('padding-and-border', 'css/padding-and-border-page');
	examples.set('combinators', 'css/combinators-page');
	examples.set('elevation', 'css/elevation-page');
	examples.set('styled-formatted-text', 'css/styled-formatted-text-page');
	examples.set('non-uniform-radius', 'css/non-uniform-radius-page');
	examples.set('missing-background-image', 'css/missing-background-image-page');
	examples.set('background-shorthand', 'css/background-shorthand-page');
	examples.set('background-image-linear-gradient', 'css/background-image-linear-gradient-page');
	examples.set('background-image', 'css/background-image-page');
	examples.set('styles', 'css/styles-page');

	return examples;
}
