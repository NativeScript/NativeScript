import { Page } from '@nativescript/core/ui/page';
import { ViewModel } from './main-view-model';

export function pageLoaded(args) {
	let page = <Page>args.object;
	const viewModel = new ViewModel();

	page.bindingContext = {
		items: viewModel.items,
	};
}

exports.onItemTap = function (args) {
	const list = args.object;
	let index = args.index;
	let listArray = list.page.bindingContext['items'];
	let currentItem = listArray.getItem(index);

	currentItem.age = currentItem.age + 1;
	listArray.setItem(index, currentItem);
};
