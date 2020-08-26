import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { BottomNavigation } from '@nativescript/core/ui/bottom-navigation';

export function goToFirst(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');

	bottomNav.selectedIndex = 0;
}

export function goToSecond(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');

	bottomNav.selectedIndex = 1;
}

export function goToThird(args: EventData) {
	const page = <Page>(<any>args.object).page;
	const bottomNav = <BottomNavigation>page.getViewById('bottomNav');

	bottomNav.selectedIndex = 2;
}
