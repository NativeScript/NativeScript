// >> web-view-loaded
import { EventData } from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page';
import { WebView } from "tns-core-modules/ui/web-view";
import { isAndroid } from "tns-core-modules/platform"

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
}

export function webViewTouch(args){
    console.log("touch event");
}

export function webViewPan(args){
    console.log("pan gesture");
}

export function webViewLoaded(args){
    var webview:WebView = <WebView>args.object;
    if(isAndroid){
        webview.android.getSettings().setDisplayZoomControls(false);
    }
}
// >> web-view-loaded