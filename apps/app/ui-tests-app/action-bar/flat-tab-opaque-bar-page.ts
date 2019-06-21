import { EventData } from "tns-core-modules/data/observable";
import { TabView } from "tns-core-modules/ui/tab-view";

export function onLoaded(args: EventData) {
    const tabView = <TabView>args.object;
    tabView.ios.tabBar.translucent = false;
}
