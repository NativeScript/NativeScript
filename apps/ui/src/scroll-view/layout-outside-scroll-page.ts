import { EventData as ObservableEventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { LayoutOutsideScrollViewModel } from './layout-outside-scroll-view-model';

const viewModel = new LayoutOutsideScrollViewModel();

export function pageLoaded(args: ObservableEventData) {
	const page = <Page>args.object;

	page.bindingContext = viewModel;
}
