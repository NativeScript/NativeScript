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
	examples.set('gestures', 'events/gestures-page');
	examples.set('touch', 'events/touch-event-page');
	examples.set('pan', 'events/pan-event-page');
	examples.set('swipe-passtrough', 'events/swipe-event-passtrough-page');
	examples.set('handlers', 'events/handlers-page');
	examples.set('console', 'events/console-page');
	examples.set('i61', 'events/i61-page');
	examples.set('i73', 'events/i73-page');
	examples.set('i86', 'events/i86-page');
	examples.set('layout changed', 'events/layout-changed-event-page');

	return examples;
}
