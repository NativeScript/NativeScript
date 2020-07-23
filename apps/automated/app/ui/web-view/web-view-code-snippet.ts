// >> web-view-loaded
import { EventData } from '@nativescript/core/data/observable';
import { WebView } from '@nativescript/core/ui/web-view';
import { isAndroid } from '@nativescript/core/platform';

export function navigatingTo(args: EventData) {
	console.log('page navigating to');
}

export function webViewTouch(args) {
	console.log('touch event');
}

export function webViewPan(args) {
	console.log('pan gesture');
}

export function webViewLoaded(args) {
	var webview: WebView = <WebView>args.object;
	if (isAndroid) {
		webview.android.getSettings().setDisplayZoomControls(false);
	}
}
// << web-view-loaded
