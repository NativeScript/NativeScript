import { EventData } from "tns-core-modules/data/observable";
import { TabView } from "tns-core-modules/ui/tab-view";
import { isIOS } from "tns-core-modules/platform";

export function onLoaded(args: EventData) {
    console.log("TEST", args.object);
    const tabView = <TabView>args.object;
    if (isIOS) {
        tabView.ios.tabBar.translucent = false;
    }
}
