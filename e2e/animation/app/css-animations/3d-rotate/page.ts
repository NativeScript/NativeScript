import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Point3D } from "tns-core-modules/ui/animation/animation";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimateX(args: EventData) {
    view.className = "original";
    view.className = "animate-x";
}

export function onAnimateY(args: EventData) {
    view.className = "original";
    view.className = "animate-y";
}

export function onAnimateZ(args: EventData) {
    view.className = "original";
    view.className = "animate-z";
}

export function onAnimateXYZ3D(args: EventData) {
    view.className = "original";
    view.className = "animate-xyz-3d";
}

export function onAnimateXYZ(args: EventData) {
    view.className = "original";
    view.className = "animate-xyz";
}
