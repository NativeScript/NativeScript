// >> web-view-loaded
import { EventData } from 'data/observable';
import { Page } from 'ui/page';
import { HelloWorldModel } from './main-view-model';
import { WebView } from "ui/web-view";
import { isAndroid } from "platform"


export function navigatingTo(args: EventData) {

    let page = <Page>args.object;

    page.bindingContext = new HelloWorldModel();
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