import { EventData } from "data/observable";
import { Page } from "ui/page";
import { PanGestureEventData } from "ui/gestures";
import { View } from "ui/core/view";
import { TextView } from "ui/text-view";

var view: View;
export function navigatingTo(args: EventData) {
    var page = <Page>args.object;
    view = page.getViewById<View>("target");
}

export function onPan(data: PanGestureEventData) {
    console.log(`data state:${data.state} [${data.deltaX}, ${data.deltaY}]`);
    var msg = `data state:${data.state} [${data.deltaX}, ${data.deltaY}]`;
        (<TextView>view.page.getViewById("output")).text += msg + "\n";
    view.translateX = data.deltaX;
    view.translateY = data.deltaY;
}

export function clear(args) {
    args.object.page.getViewById("output").text = "";
}