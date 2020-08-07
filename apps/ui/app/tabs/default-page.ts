import { EventData, Page, Tabs } from '@nativescript/core';

export function goToFirst(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabsNav');

	tabsNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const tabsNav = <Tabs>page.getViewById('tabsNav');

	tabsNav.selectedIndex = 1;
}
