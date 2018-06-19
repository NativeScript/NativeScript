import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Color } from "tns-core-modules/color";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    view.animate({
        backgroundColor: new Color("#3D5AFE"),
        opacity: 0.5,
        translate: {x: 100, y: 100},
        rotate: 180,
        duration: 3000
    });
}

export function onReset(args: EventData) {
    view.backgroundColor = new Color("White");
    view.opacity = 1;
    view.translateX = 0;
    view.translateY = 0;
    view.rotate = 0;
}
