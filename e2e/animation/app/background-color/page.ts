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
        duration: 3000
    });
}

export function onReset(args: EventData) {
    view.backgroundColor = new Color("White");
}
