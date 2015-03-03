import tabViewModule = require("ui/tab-view");

export function getNativeTabCount(tabView: tabViewModule.TabView): number {
    if (!tabView.ios.viewControllers) {
        return 0;
    }

    return tabView.ios.viewControllers.count;
}

export function selectNativeTab(tabView: tabViewModule.TabView, index: number): void {
    tabView.ios.selectedIndex = index;
    tabView.ios.delegate.tabBarControllerDidSelectViewController(tabView.ios, tabView.ios.selectedViewController);
}