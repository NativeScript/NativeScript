import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { AnimationCurve } from "tns-core-modules/ui/enums";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimateLinear(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.linear
    });
}

export function onAnimateEaseIn(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.easeIn
    });
}

export function onAnimateEaseOut(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.easeOut
    });
}

export function onAnimateEaseInEaseOut(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.easeInOut
    });
}

export function onAnimateSpring(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.spring
    });
}

export function onAnimateCustom(args: EventData) {
    view.animate({
        translate: { x: 0, y: 100},
        duration: 1000,
        curve: AnimationCurve.cubicBezier(0.1, 0.1, 0.1, 1)
    });
}

export function onReset(args: EventData) {
    view.translateX = 0;
    view.translateY = 0;
}
