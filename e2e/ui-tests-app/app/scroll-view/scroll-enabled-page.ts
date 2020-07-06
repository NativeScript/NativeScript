import { EventData as ObservableEventData } from "tns-core-modules/data/observable";
import { GestureStateTypes, PanGestureEventData } from "tns-core-modules/ui/gestures";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: ObservableEventData) {
    var page = <Page>args.object;
}

export function panLayout(args: PanGestureEventData)
{
    const scrollView = args.object.parent;

    if (args.state === GestureStateTypes.began) {
        args.object.previousDeltaY = 0;
        scrollView.isScrollEnabled = false;
    }
    else if (args.state === GestureStateTypes.changed) {
        const diff = (args.deltaY - args.object.previousDeltaY);
        args.object.translateY += diff;
        args.object.previousDeltaY = args.deltaY;
    }
    else if (args.state === GestureStateTypes.ended) {
        scrollView.isScrollEnabled = true;
    }
}
