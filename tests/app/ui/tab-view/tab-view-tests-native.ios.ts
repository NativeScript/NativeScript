import tabViewModule = require("ui/tab-view");
import * as utils from "utils/utils";
import getter = utils.ios.getter;

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

export function getNativeSelectedIndex(tabView: tabViewModule.TabView): number {
    return tabView.ios.selectedIndex;
}

export function getNativeFont(tabView: tabViewModule.TabView): any {
    let tabBar = <UITabBar>tabView.ios.tabBar;
    let currentFont;

    if (tabBar.items.count > 0) {
        let currentAttrs = tabBar.items[0].titleTextAttributesForState(UIControlState.Normal);
        if (currentAttrs) {
            currentFont = currentAttrs.objectForKey(NSFontAttributeName);
        }
    }

    if (!currentFont) {
        currentFont = UIFont.systemFontOfSize(getter(UIFont, UIFont.labelFontSize));
    }

    return currentFont;
}