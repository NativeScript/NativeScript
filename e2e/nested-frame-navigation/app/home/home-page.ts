import * as application from "tns-core-modules/application";
import { EventData } from "tns-core-modules/ui/core/view";
import { Button } from "tns-core-modules/ui/button";

export function onNavigateToLayoutFrame(args: EventData) {
    application._resetRootView({ moduleName: "layout-root/layout-frame-root" });
}

export function onNavigateToLayoutMultiFrame(args: EventData) {
    application._resetRootView({ moduleName: "layout-root/layout-multi-frame-root" });
}

export function onNavigateToPageFrame(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("frame-root/frame-home-page");
}

export function onNavigateToPageMultiFrame(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("frame-root/frame-multi-home-page");
}

export function onNavigateToTabViewTopPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tab-page/tab-top-page");
}

export function onNavigateToTabViewBottomPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tab-page/tab-bottom-page");
}

export function onNavigateToTabViewTopRoot(args: EventData) {
    application._resetRootView({ moduleName: "tab-root/tab-top-root" });
}

export function onNavigateToTabViewBottomRoot(args: EventData) {
    application._resetRootView({ moduleName: "tab-root/tab-bottom-root" });
}

export function onNavigateToBottomNavigationPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("bottom-navigation-page/bottom-navigation-page");
}

export function onNavigateToBottomNavigationRoot(args: EventData) {
    application._resetRootView({ moduleName: "bottom-navigation-root/bottom-navigation-root" });
}

export function onNavigateToTabsTopPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tabs-page/tabs-top-page");
}

export function onNavigateToTabsBottomPage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("tabs-page/tabs-bottom-page");
}

export function onNavigateToTabsTopRoot(args: EventData) {
    application._resetRootView({ moduleName: "tabs-root/tabs-top-root" });
}

export function onNavigateToTabsBottomRoot(args: EventData) {
    application._resetRootView({ moduleName: "tabs-root/tabs-bottom-root" });
}

export function onNavigateToSomePage(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate("some-page/some-page");
}

export function onFrameToNestedFrame(args: EventData) {
    const button = <Button>args.object;
    button.page.frame.navigate({
        moduleName: "frame-root/frame-home-page",
        animated: true,
        transition: {
            name: "slide",
            duration: 300,
            curve: "easeIn"
        }
    });
}
