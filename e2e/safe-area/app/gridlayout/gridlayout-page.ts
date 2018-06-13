import { View, EventData } from "tns-core-modules/ui/core/view";

export function onNavigate(args: EventData) {
    const view = args.object as View;
    const route = view["route"];

    view.page.frame.navigate(route);
}