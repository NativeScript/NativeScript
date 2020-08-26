import * as observable from '@nativescript/core/data/observable';
import * as pageModule from '@nativescript/core/ui/page';

function loadViewModel() {
	viewModel.set('testProperty', 'Alabala');
}

var viewModel = new observable.Observable();

loadViewModel();

export function pageLoaded(args: observable.EventData) {
	var page = <pageModule.Page>args.object;
	page.bindingContext = viewModel;
}
