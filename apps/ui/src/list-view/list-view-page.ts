import { EventData } from '@nativescript/core/data/observable';
import { ObservableArray } from '@nativescript/core/data/observable-array';
import { View, KeyedTemplate } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page';
import { ViewModel, Item } from './main-view-model';
import { ListView } from '@nativescript/core/ui/list-view';
import { Label } from '@nativescript/core/ui/label';
import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';
import { Color } from '@nativescript/core/color';

export function selectItemTemplate(item: Item, index: number, items: ObservableArray<Item>): string {
	return item.id % 10 === 0 ? 'red' : item.id % 2 === 0 ? 'green' : 'yellow';
}

export function pageLoaded(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new ViewModel();

	let lv4 = page.getViewById<ListView>('lv4');
	lv4.itemTemplateSelector = (item: Item, index: number, items: ObservableArray<Item>) => {
		return index % 10 === 0 ? 'red' : index % 2 === 0 ? 'green' : 'yellow';
	};

	let createLabel = (backgroundColor: Color) => {
		let label = new Label();
		label.bind({
			sourceProperty: null,
			targetProperty: 'text',
			expression: '$value',
		});
		label.style.backgroundColor = backgroundColor;

		return label;
	};

	lv4.itemTemplates = new Array<KeyedTemplate>(
		{
			key: 'red',
			createView: () => createLabel(new Color('red')),
		},
		{
			key: 'green',
			createView: () => createLabel(new Color('green')),
		},
		{
			key: 'yellow',
			createView: () => createLabel(new Color('yellow')),
		}
	);
}

let scrollToBottom = true;
export function onScroll(args: EventData) {
	let page = (<View>args.object).page;
	let gridLayout = page.getViewById<GridLayout>('grid-layout');
	for (let i = 0, length = gridLayout.getChildrenCount(); i < length; i++) {
		let listView = <ListView>gridLayout.getChildAt(i);
		listView.scrollToIndex(scrollToBottom ? listView.items.length - 1 : 0);
	}
	scrollToBottom = !scrollToBottom;
}

export function onScrollToIndex(args: EventData) {
	let page = (<View>args.object).page;
	let gridLayout = page.getViewById<GridLayout>('grid-layout');
	for (let i = 0, length = gridLayout.getChildrenCount(); i < length; i++) {
		let listView = <ListView>gridLayout.getChildAt(i);
		listView.scrollToIndex(50);
	}
}

export function onScrollToIndexAnimated(args: EventData) {
	let page = (<View>args.object).page;
	let gridLayout = page.getViewById<GridLayout>('grid-layout');
	for (let i = 0, length = gridLayout.getChildrenCount(); i < length; i++) {
		let listView = <ListView>gridLayout.getChildAt(i);
		listView.scrollToIndexAnimated(50);
	}
}

export function onScrollReset(args: EventData) {
	let page = (<View>args.object).page;
	let gridLayout = page.getViewById<GridLayout>('grid-layout');
	for (let i = 0, length = gridLayout.getChildrenCount(); i < length; i++) {
		let listView = <ListView>gridLayout.getChildAt(i);
		listView.scrollToIndex(0);
	}
}
