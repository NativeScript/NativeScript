import tabViewModule = require('@nativescript/core/ui/tab-view');
import { Font } from '@nativescript/core/ui/styling/font';

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

export function getNativeFont(tabView: tabViewModule.TabView): UIFont {
	const tabBar = <UITabBar>tabView.ios.tabBar;
	if (tabBar.items.count > 0) {
		const currentAttrs = tabBar.items[0].titleTextAttributesForState(UIControlState.Normal);
		if (currentAttrs) {
			return currentAttrs.objectForKey(NSFontAttributeName);
		}
	}

	return null;
}

export function getOriginalFont(tabView: tabViewModule.TabView): UIFont {
	return (tabView.style.fontInternal || Font.default).getUIFont(UIFont.systemFontOfSize(10));
}
