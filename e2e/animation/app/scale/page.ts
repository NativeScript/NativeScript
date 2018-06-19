import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    view.animate({
        scale: { x: 2, y: 2},
        duration: 3000
    });
}

export function onReset(args: EventData) {
    view.scaleX = 1;
    view.scaleY = 1;
}
