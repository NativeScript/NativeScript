import { EventData, Page, Tabs, SelectedIndexChangedEventData } from '@nativescript/core';

export function goToFirst(args: EventData) {
	console.log('---> goToFirst');
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabsNav');
	tabsNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	console.log('---> goToSecond');
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabsNav');
	tabsNav.selectedIndex = 1;
}

export function goToThird(args: EventData) {
	console.log('---> goToThird');
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabsNav');
	tabsNav.selectedIndex = 2;
}

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
	console.log('---> onSelectedIndexChanged', args.eventName);
	console.log('---> oldIndex', args.oldIndex);
	console.log('---> newIndex', args.newIndex);
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
