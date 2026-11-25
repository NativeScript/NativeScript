import * as observable from '@nativescript/core/data/observable';
import * as pageModule from '@nativescript/core/ui/page';

function loadViewModel() {
	viewModel.set('testProperty', 'Alabala');
}

const viewModel = new observable.Observable();

loadViewModel();

export function pageLoaded(args: observable.EventData) {
	const page = <pageModule.Page>args.object;
	page.bindingContext = viewModel;
}
