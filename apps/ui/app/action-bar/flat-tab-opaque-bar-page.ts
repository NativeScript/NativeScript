import { EventData } from '@nativescript/core/data/observable';
import { TabView } from '@nativescript/core/ui/tab-view';
import { isIOS } from '@nativescript/core/platform';

export function onLoaded(args: EventData) {
	console.log('TEST', args.object);
	const tabView = <TabView>args.object;
	if (isIOS) {
		tabView.ios.tabBar.translucent = false;
	}
}
