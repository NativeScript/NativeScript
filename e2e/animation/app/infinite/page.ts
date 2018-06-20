import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";
import { Animation } from "tns-core-modules/ui/animation";

let view: View;
let animationSet: Animation;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    animationSet = new Animation([{
        target: view,
        rotate: 360,
        duration: 3000,
        iterations: Number.POSITIVE_INFINITY
    }]);
    animationSet.play().catch((e) => {
        console.log("Animation stopped!");
    });
}

export function onReset(args: EventData) {
    animationSet.cancel();
    view.rotate = 0;
}
