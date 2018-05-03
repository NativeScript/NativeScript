// >> web-view-loaded
import { EventData } from "tns-core-modules/data/observable";
import { WebView } from "tns-core-modules/ui/web-view";
import { isAndroid } from "tns-core-modules/platform"

export function navigatingTo(args: EventData) {
    console.log("page navigating to");
}

export function webViewTouch(args) {
    console.log("touch event");
}

export function webViewPan(args) {
    console.log("pan gesture");
}

export function webViewLoaded(args) {
    var webview: WebView = <WebView>args.object;
    if (isAndroid) {
        webview.android.getSettings().setDisplayZoomControls(false);
    }
}
// << web-view-loaded