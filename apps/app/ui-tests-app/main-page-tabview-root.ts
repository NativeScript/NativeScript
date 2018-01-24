import { EventData } from "tns-core-modules/data/observable";
import { TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Frame } from "tns-core-modules/ui/frame";
    
export function firstTabLoaded(args: EventData) {
    const tabView = (<TabViewItem>args.object);
    const frame = <Frame>tabView.getViewById("firstMainFrame");
    
    frame.navigate("ui-tests-app/main-page");
}