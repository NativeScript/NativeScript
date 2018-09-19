import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    const animation1 = view.createAnimation({ opacity: 0 });
    const animation2 = view.createAnimation({ opacity: 1 });

    animation1.play()
        .then(() => animation2.play())
        .then(() => animation1.play())
        .then(() => animation2.play())
        .then(() => animation1.play())
        .then(() => animation2.play())
        .then(() => {
            console.log("Animation finished");
        })
        .catch((e) => {
            console.log(e.message);
        });
}

export function onReset(args: EventData) {
    view.opacity = 1;
}
