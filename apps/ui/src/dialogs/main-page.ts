import * as pages from '@nativescript/core/ui/page';
import * as observable from '@nativescript/core/data/observable';
import * as vmModule from './view-model';

const viewModel = vmModule.settingsViewModel;

export function pageLoaded(args: observable.EventData) {
	const page = <pages.Page>args.object;
	page.bindingContext = viewModel;
}
