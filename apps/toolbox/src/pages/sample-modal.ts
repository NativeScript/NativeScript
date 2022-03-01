import { Page, ShownModallyData, Observable, LoadEventData } from '@nativescript/core';

let page: Page;
let closeCallback: Function;
export function onShownModally(args: ShownModallyData) {
	closeCallback = args.closeCallback;

	if (args.context) {
		args.context.shownModally = true;
	}
}

export function onLoaded(args: LoadEventData) {
	page = args.object as Page;
	page.bindingContext = new SampleModal();

	const disposePage = page.disposeNativeView.bind(page);
	page.disposeNativeView = () => {
		console.log('-'.repeat(100));
		console.log(' [!!] Disposing modal page...');
		console.log('-'.repeat(100));

		disposePage();
	};
}

export class SampleModal extends Observable {
	close() {
		// TODO: a11y
		// if (global.isIOS) {
		//   (<UIViewController>page.ios).view.accessibilityPerformEscape();
		// }
		if (typeof closeCallback === 'function') {
			closeCallback();
		} else {
			// fallback to regular nav back...
			page.frame.goBack();
		}
	}
}
