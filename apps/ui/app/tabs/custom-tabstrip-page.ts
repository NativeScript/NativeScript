import { EventData, Page, Tabs } from '@nativescript/core';

export function goToFirst(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <Tabs>page.getViewById('tabsNav');

	bottomNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <Tabs>page.getViewById('tabsNav');

	bottomNav.selectedIndex = 1;
}

export function goToThird(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <Tabs>page.getViewById('tabsNav');

	bottomNav.selectedIndex = 2;
}
