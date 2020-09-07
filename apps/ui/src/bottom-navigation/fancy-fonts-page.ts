import { EventData, Page, BottomNavigation } from '@nativescript/core';

export const selectTab = (args: EventData) => {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNavigation');

	const index = (<any>args.object).tag;
	bottomNav.selectedIndex = index;
};
