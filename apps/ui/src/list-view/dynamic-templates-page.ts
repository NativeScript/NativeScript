import { Page } from '@nativescript/core/ui/page';
import { ViewModel } from './main-view-model';

export function pageLoaded(args) {
	const page = <Page>args.object;
	const viewModel = new ViewModel();

	page.bindingContext = {
		items: viewModel.items,
	};
}

exports.onItemTap = function (args) {
	const list = args.object;
	const index = args.index;
	const listArray = list.page.bindingContext['items'];
	const currentItem = listArray.getItem(index);

	currentItem.age = currentItem.age + 1;
	listArray.setItem(index, currentItem);
};
