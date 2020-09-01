import { View } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page';
import { BottomNavigation } from '@nativescript/core/ui/bottom-navigation';

export function onButtonTap(args) {
	const page = <Page>(<View>args.object).page;
	const bottomNavigation = <BottomNavigation>page.getViewById('bottomNavigation');

	switch (bottomNavigation.tabStrip.className) {
		case 'tabsClass0':
			bottomNavigation.tabStrip.className = 'tabsClass1';
			break;
		case 'tabsClass1':
			bottomNavigation.tabStrip.className = 'tabsClass2';
			break;
		case 'tabsClass2':
			bottomNavigation.tabStrip.className = 'tabsClass0';
			break;
	}
}

export function onChangeIconSourceTap(args) {
	const page = <Page>(<View>args.object).page;
	const bottomNavigation = <BottomNavigation>page.getViewById('bottomNavigation');

	const tabStripItem0 = bottomNavigation.tabStrip.items[0];
	const tabStripItem1 = bottomNavigation.tabStrip.items[1];
	const tabStripItem2 = bottomNavigation.tabStrip.items[2];

	const iconSource0 = tabStripItem0.iconSource;

	tabStripItem0.iconSource = tabStripItem1.iconSource;

	tabStripItem1.iconClass = 'font-awesome font-size';
	tabStripItem1.iconSource = tabStripItem2.iconSource;

	tabStripItem2.iconClass = 'font-awesome font-size';
	tabStripItem2.iconSource = iconSource0;
}
