import { EventData, Page, Tabs } from '@nativescript/core';

export function goToFirst(args: EventData) {
	console.log('---> goToFirst');
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabs');
	tabsNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	console.log('---> goToSecond');
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabs');
	tabsNav.selectedIndex = 1;
}
