import * as application from "tns-core-modules/application";
import { EventData } from "tns-core-modules/ui/core/view";
import { Button } from "tns-core-modules/ui/button";

export function onNavigateToLayoutFrame(args: EventData) {
    application._resetRootView({ moduleName: "layout-root/layout-root-frame" });
}

export function onNavigateToLayoutMultiFrame(args: EventData) {
    application._resetRootView({ moduleName: "layout-root/layout-root-multi-frame" });
}

export function onNavigateToPageFrame(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("frame-root/frame-home-page");
}

export function onNavigateToPageMultiFrame(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("frame-root/frame-multi-home-page");
}

export function onNavigateToTabsTopPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tab-page/tabs-top-page");
}

export function onNavigateToTabsBottomPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tab-page/tabs-bottom-page");
}

export function onNavigateToTabsTopRoot(args: EventData) {
    application._resetRootView({ moduleName: "tab-root/tab-root-top" });
}

export function onNavigateToTabsBottomRoot(args: EventData) {
    application._resetRootView({ moduleName: "tab-root/tab-root-bottom" });
}
