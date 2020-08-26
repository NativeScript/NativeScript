import { EventData, Frame, Page, TabStripItemEventData, SelectedIndexChangedEventData, Tabs, TabStrip } from '@nativescript/core';

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

export function onItemTap(args: TabStripItemEventData) {
	console.log('---> onItemTap', args.eventName);
	console.log('---> onItemTap', args.index);
	console.log('---> onItemTap', args.object);

	const tabStrip = <TabStrip>args.object;
	const page = <Page>tabStrip.page;
	const frame = <Frame>page.getViewById('frame');
	const tabs = <Tabs>page.getViewById('tabsNav');

	console.log('---> onItemTap selectedIndex', tabs.selectedIndex);
	if (tabs.selectedIndex === args.index && frame.canGoBack()) {
		frame.goBack();
	}
}

export function onFirstTabStripItemTap(args: EventData) {
	console.log('---> onFirstTabStripItemTap', args.eventName);
	// console.log("---> onFirstTabStripItemTap", args.eventName);
	// console.log("---> onFirstTabStripItemTap", args.object);
	// const tabStripItem = <TabStripItem>args.object;

	// const page = tabStripItem.page;
	// const frame = <Frame>page.getViewById("frame");
	// const tabs = <Tabs>page.getViewById("tabsNav");
	// console.log("---> tabs.selectedIndex", tabs.selectedIndex);

	// if (tabs.selectedIndex === 0 && frame.canGoBack()) {
	//   frame.goBack();
	// }
}

export function onSecondTabStripItemTap(args: EventData) {
	console.log('---> onSecondTabStripItemTap', args.eventName);
}

export function onThirdTabStripItemTap(args: EventData) {
	console.log('---> onThirdTabStripItemTap', args.eventName);
}
