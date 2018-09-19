import { EventData, Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

let view: View;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view = page.getViewById<View>("view");
}

export function onAnimate(args: EventData) {
    view.className = "original";
    view.className = "transformed";
}
