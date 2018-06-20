import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    view.animate({
        translate: { x: 100, y: 100},
        duration: 3000
    });
}

export function onReset(args: EventData) {
    view.translateX = 0;
    view.translateY = 0;
}
