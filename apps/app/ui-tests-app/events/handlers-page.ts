import * as observable from "tns-core-modules/data/observable";
import * as gestures from "tns-core-modules/ui/gestures";
import * as pages from "tns-core-modules/ui/page";

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    page.bindingContext = { tapAction: tapAction, doubleTapAction: doubleTapAction };
}

export function tapAction(args: gestures.GestureEventData) {
    console.log("tapAction")
}

export function doubleTapAction(args: gestures.GestureEventData) {
    console.log("doubleTapAction")
}
