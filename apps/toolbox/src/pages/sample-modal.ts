import { Page, ShownModallyData, Observable } from '@nativescript/core';

let page: Page;
let closeCallback: Function;
export function onShownModally(args: ShownModallyData) {
	page = <Page>args.object;
	page.bindingContext = new SampleModal();
	closeCallback = args.closeCallback;

	if (args.context) {
		args.context.shownModally = true;
	}
}

export class SampleModal extends Observable {
	close() {
		// TODO: a11y
		// if (global.isIOS) {
		//   (<UIViewController>page.ios).view.accessibilityPerformEscape();
		// }
		closeCallback();
	}
}
