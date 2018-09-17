import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { TextView } from "tns-core-modules/ui/text-view";

let outputText: TextView;
export function navigatingTo(args: EventData) {
    var page = <Page>args.object;
    outputText = page.getViewById<TextView>("output");
}

export function onSwipe(data: SwipeGestureEventData) {
    const msg = `swipe state:${data.direction}`;
    console.log(msg);
    outputText.text += msg + "\n";
}

export function onTap(args) {
    const msg = `tapEvent triggered`;
    console.log(msg);
    outputText.text += msg + "\n";
}
