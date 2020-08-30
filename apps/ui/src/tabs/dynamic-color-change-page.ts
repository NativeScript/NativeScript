import { View, Page, Tabs } from '@nativescript/core';

export function onButtonTap(args) {
	const page = <Page>(<View>args.object).page;
	const tabs = <Tabs>page.getViewById('tabs');

	switch (tabs.tabStrip.className) {
		case 'tabsClass0':
			tabs.tabStrip.className = 'tabsClass1';
			break;
		case 'tabsClass1':
			tabs.tabStrip.className = 'tabsClass2';
			break;
		case 'tabsClass2':
			tabs.tabStrip.className = 'tabsClass0';
			break;
	}
}

export function onChangeIconSourceTap(args) {
	const page = <Page>(<View>args.object).page;
	const tabs = <Tabs>page.getViewById('tabs');

	const tabStripItem0 = tabs.tabStrip.items[0];
	const tabStripItem1 = tabs.tabStrip.items[1];
	const tabStripItem2 = tabs.tabStrip.items[2];

	const iconSource0 = tabStripItem0.iconSource;

	tabStripItem0.iconSource = tabStripItem1.iconSource;

	tabStripItem1.iconClass = 'font-awesome font-size';
	tabStripItem1.iconSource = tabStripItem2.iconSource;

	tabStripItem2.iconClass = 'font-awesome font-size';
	tabStripItem2.iconSource = iconSource0;
}
