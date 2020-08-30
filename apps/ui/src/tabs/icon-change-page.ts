import { Tabs, SelectedIndexChangedEventData } from '@nativescript/core';

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
	const tabsNav = <Tabs>args.object;

	const newItem = tabsNav.tabStrip.items[args.newIndex];
	if (newItem) {
		newItem.iconSource = 'res://icon';
		newItem.title = 'selected';
	}

	const oldItem = tabsNav.tabStrip.items[args.oldIndex];
	if (oldItem) {
		oldItem.iconSource = 'res://testlogo';
		oldItem.title = 'unselected';
	}
}
