import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimateX(args: EventData) {
    view.animate({
        rotate: { x: 360, y: 0, z: 0 },
        duration: 3000
    });
}

export function onAnimateY(args: EventData) {
    view.animate({
        rotate: { x: 0, y: 360, z: 0 },
        duration: 3000
    });
}

export function onAnimateZ(args: EventData) {
    view.animate({
        rotate: { x: 0, y: 0, z: 360 },
        duration: 3000
    });
}

export function onAnimateXYZ(args: EventData) {
    view.animate({
        rotate: { x: 360, y: 360, z: 360 },
        duration: 3000
    });
}

export function onReset(args: EventData) {
    view.rotate = 0;
    view.rotateX = 0;
    view.rotateY = 0;
}
