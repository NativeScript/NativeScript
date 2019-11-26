import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Point3D } from "tns-core-modules/ui/animation/animation";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimateX(args: EventData) {
    rotate({ x: 360, y: 0, z: 0 });
}

export function onAnimateY(args: EventData) {
    rotate({ x: 0, y: 360, z: 0 });
}

export function onAnimateZ(args: EventData) {
    rotate({ x: 0, y: 0, z: 360 });
}

export function onAnimateXYZ(args: EventData) {
    rotate({ x: 360, y: 360, z: 360 });
}

async function rotate(rotate: Point3D) {
    await view.animate({
        rotate,
        duration: 1000
    });
    reset();
}

function reset() {
    view.rotate = 0;
    view.rotateX = 0;
    view.rotateY = 0;
}
