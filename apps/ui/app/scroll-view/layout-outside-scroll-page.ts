import { EventData as ObservableEventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { LayoutOutsideScrollViewModel } from './layout-outside-scroll-view-model';

var viewModel = new LayoutOutsideScrollViewModel();

export function pageLoaded(args: ObservableEventData) {
	var page = <Page>args.object;

	page.bindingContext = viewModel;
}
