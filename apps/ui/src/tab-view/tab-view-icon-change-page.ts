import { TabView, SelectedIndexChangedEventData } from '@nativescript/core/ui/tab-view';

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
	const tabView = args.object as TabView;

	const newItem = tabView.items[args.newIndex];
	if (newItem) {
		newItem.iconSource = 'res://icon';
	}

	const oldItem = tabView.items[args.oldIndex];
	if (oldItem) {
		oldItem.iconSource = 'res://testlogo';
	}
}
