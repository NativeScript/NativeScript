import { EventData, Page, Utils } from '@nativescript/core';
import { HelloWorldModel } from './main-view-model';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new HelloWorldModel();

	// Testing setting window background color
	// if (global.isIOS) {
	// 	Utils.ios.setWindowBackgroundColor('blue');
	// }
}
