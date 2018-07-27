import { View, EventData } from "tns-core-modules/ui/core/view/view";
import * as frame from "tns-core-modules/ui/frame";

export function onNavigate(args: EventData) {
    const view = args.object as View;
    const route = view["route"];

    // view.page.frame.navigate(route);
    frame.topmost().navigate(route);
}
