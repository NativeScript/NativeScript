import { EventData, Frame, Page, TabStripItemEventData, SelectedIndexChangedEventData, BottomNavigation, TabStrip } from '@nativescript/core';

export function goToFirst(args: EventData) {
	console.log('---> goToFirst');
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');
	bottomNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	console.log('---> goToSecond');
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');
	bottomNav.selectedIndex = 1;
}

export function goToThird(args: EventData) {
	console.log('---> goToThird');
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');
	bottomNav.selectedIndex = 2;
}

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
	console.log('---> onSelectedIndexChanged', args.eventName);
	console.log('---> oldIndex', args.oldIndex);
	console.log('---> newIndex', args.newIndex);
}

export function onItemTap(args: TabStripItemEventData) {
	console.log('---> onItemTap', args.eventName);
	console.log('---> onItemTap', args.index);
	console.log('---> onItemTap', args.object);

	const tabStrip = <TabStrip>args.object;
	const page = <Page>tabStrip.page;
	const frame = <Frame>page.getViewById('frame');
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');

	console.log('---> onItemTap selectedIndex', bottomNav.selectedIndex);
	if (bottomNav.selectedIndex === args.index && frame.canGoBack()) {
		frame.goBack();
	}
}

export function onFirstTabStripItemTap(args: EventData) {
	console.log('---> onFirstTabStripItemTap', args.eventName);
}

export function onSecondTabStripItemTap(args: EventData) {
	console.log('---> onSecondTabStripItemTap', args.eventName);
}

export function onThirdTabStripItemTap(args: EventData) {
	console.log('---> onThirdTabStripItemTap', args.eventName);
}
