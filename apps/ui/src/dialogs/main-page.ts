import * as pages from '@nativescript/core/ui/page';
import * as observable from '@nativescript/core/data/observable';
import * as vmModule from './view-model';

var viewModel = vmModule.settingsViewModel;

export function pageLoaded(args: observable.EventData) {
	var page = <pages.Page>args.object;
	page.bindingContext = viewModel;
}
