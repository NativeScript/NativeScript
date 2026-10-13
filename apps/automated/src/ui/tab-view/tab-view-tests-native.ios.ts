import { Font, TabView, Utils } from '@nativescript/core';

export function getNativeTabCount(tabView: TabView): number {
	const controllers = tabView.ios.viewControllers ?? (Utils.SDK_VERSION >= 27 ? tabView.ios.tabs : null);

	return controllers ? controllers.count : 0;
}

export function selectNativeTab(tabView: TabView, index: number): void {
	tabView.ios.selectedIndex = index;
	tabView.ios.delegate.tabBarControllerDidSelectViewController(tabView.ios, tabView.ios.selectedViewController);
}

export function getNativeSelectedIndex(tabView: TabView): number {
	return tabView.ios.selectedIndex;
}

export function getNativeProminentTabIdentifier(tabView: TabView): string | null | undefined {
	if (Utils.SDK_VERSION < 27) {
		return undefined;
	}

	return tabView.ios.prominentTabIdentifier;
}

export function getNativeFont(tabView: TabView): UIFont {
	const tabBar = <UITabBar>tabView.ios.tabBar;
	if (tabBar.items.count > 0) {
		const currentAttrs = tabBar.items[0].titleTextAttributesForState(UIControlState.Normal);
		if (currentAttrs) {
			return currentAttrs.objectForKey(NSFontAttributeName);
		}
	}

	return null;
}

export function getOriginalFont(tabView: TabView): UIFont {
	return (tabView.style.fontInternal || Font.default).getUIFont(UIFont.systemFontOfSize(10));
}
