import { Tabs } from '@nativescript/core/ui/tabs';
import { Font } from '@nativescript/core/ui/styling/font';

// TODO: Should we add getCount to UIPageViewController???
export function getNativeTabCount(tabView: Tabs): number {
	if (!(<any>tabView).viewControllers) {
		return 0;
	}

	return (<any>tabView).viewControllers.length;
}

// TODO: separate in another function with Tabs implementation - selectNativeTab()
export function selectNativeTab(tabView: Tabs, index: number): void {
	const item = tabView.items[index];
	const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(1);

	let itemController = (<any>item).__controller;
	controllers.addObject(itemController);
	let navigationDirection = UIPageViewControllerNavigationDirection.Forward;
	tabView.viewController.setViewControllersDirectionAnimatedCompletion(controllers, navigationDirection, false, null);
	tabView.viewController.delegate.pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted(tabView.viewController, true, null, true);
}

// TODO: Should we add getNativeSelectedIndex to UIPageViewController???
export function getNativeSelectedIndex(tabView: Tabs): number {
	return tabView.selectedIndex;
}

export function getNativeFont(tabView: Tabs): UIFont {
	const tabBar = <UITabBar>tabView.viewController.tabBar;
	if (tabBar.items.count > 0) {
		const currentAttrs = tabBar.items[0].titleTextAttributesForState(UIControlState.Normal);
		if (currentAttrs) {
			return currentAttrs.objectForKey(NSFontAttributeName);
		}
	}

	return null;
}

export function getOriginalFont(tabView: Tabs): UIFont {
	return (tabView.style.fontInternal || Font.default).getUIFont(UIFont.systemFontOfSize(10));
}
