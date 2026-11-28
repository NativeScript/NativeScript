import { createPageAndNavigate } from './action-bar-tests-common';
import * as PageModule from '@nativescript/core/ui/page';
import * as TKUnit from '../../tk-unit';
import * as LabelModule from '@nativescript/core/ui/label';
import * as helper from '../../ui-helper';
import * as view from '@nativescript/core/ui/core/view';
import * as actionBar from '@nativescript/core/ui/action-bar';
import { CoreTypes } from '@nativescript/core';

export * from './action-bar-tests-common';

export function test_NavBar_isVisible_when_MenuItems_areSet() {
	let page: PageModule.Page;
	let label: LabelModule.Label;
	let navBarIsVisible = false;

	const handler = function (data) {
		page.off(PageModule.Page.navigatedToEvent, handler);
		navBarIsVisible = !page.actionBar.nativeView.hidden;
		console.log(navBarIsVisible);
		console.log(page.actionBar.nativeView.hidden);
	};

	const pageFactory = function (): PageModule.Page {
		page = new PageModule.Page();
		page.on(PageModule.Page.navigatedToEvent, handler);

		const mi = new actionBar.ActionItem();
		mi.text = 'B';
		page.actionBar.actionItems.addItem(mi);
		label = new LabelModule.Label();
		label.text = 'Text';
		page.content = label;

		return page;
	};

	helper.navigate(pageFactory);

	try {
		TKUnit.assert(navBarIsVisible, 'Expected: true, Actual: ' + navBarIsVisible);
	} finally {
		page.off(view.View.loadedEvent, handler);
	}
}

export function test_NavBarItemsAreClearedFromNativeWhenClearedFromNativeScript() {
	let page: PageModule.Page;
	let label: LabelModule.Label;

	const handler = function (data) {
		page.off(PageModule.Page.navigatedToEvent, handler);
		const menuItems = page.actionBar.actionItems.getItems();
		let i;
		for (i = menuItems.length - 1; i >= 0; i--) {
			page.actionBar.actionItems.removeItem(menuItems[i]);
		}
	};

	const pageFactory = function (): PageModule.Page {
		page = new PageModule.Page();
		page.on(PageModule.Page.navigatedToEvent, handler);

		const mi = new actionBar.ActionItem();
		mi.text = 'B';
		page.actionBar.actionItems.addItem(mi);
		label = new LabelModule.Label();
		label.text = 'Text';
		page.content = label;

		return page;
	};

	helper.navigate(pageFactory);

	try {
		const navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
		const rightBarButtonItemsCount = navigationItem.rightBarButtonItems ? navigationItem.rightBarButtonItems.count : 0;
		TKUnit.assertEqual(rightBarButtonItemsCount, 0, 'After remove all items native items should be 0.');
	} finally {
		page.off(view.View.loadedEvent, handler);
	}
}

export function test_actionItem_visibility() {
	const actionItem = new actionBar.ActionItem();
	actionItem.text = 'Test';
	actionItem.ios.position = 'left';
	const page = createPageAndNavigate();

	page.actionBar.actionItems.addItem(actionItem);

	const viewController = <UIViewController>page.ios;
	const navigationItem: UINavigationItem = viewController.navigationItem;

	let leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;
	TKUnit.assertEqual(leftBarButtonItemsCount, 1, 'Visibility does not work');
	actionItem.visibility = CoreTypes.Visibility.collapse;

	TKUnit.waitUntilReady(() => {
		leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;

		return leftBarButtonItemsCount === 0;
	});

	leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;
	TKUnit.assertEqual(leftBarButtonItemsCount, 0, 'Visibility does not work');
}

export function test_actionItem_with_icon_keeps_text_as_title() {
	const actionItem = new actionBar.ActionItem();
	actionItem.icon = 'sys://star';
	actionItem.text = 'Favorite';
	actionItem.ios.position = 'right';
	const page = createPageAndNavigate();

	page.actionBar.actionItems.addItem(actionItem);

	const navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
	const barButtonItem = navigationItem.rightBarButtonItems.objectAtIndex(0);

	TKUnit.assert(!!barButtonItem.image, 'The icon should be the bar button item image');
	TKUnit.assertEqual(barButtonItem.title, 'Favorite', 'The text should be kept as the bar button item title');
}

export function test_actionItem_bar_placement() {
	const actionItem = new actionBar.ActionItem();
	actionItem.icon = 'sys://star';
	actionItem.text = 'Favorite';
	actionItem.ios.position = 'right';
	actionItem.ios.visibilityPriority = 'low';
	actionItem.ios.axisBehavior = 'horizontalOnly';
	const page = createPageAndNavigate();

	// Must not throw where the placement API (iOS 27.1+) is unavailable.
	page.actionBar.actionItems.addItem(actionItem);

	const navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
	const barButtonItem: any = navigationItem.rightBarButtonItems.objectAtIndex(0);
	if (barButtonItem.respondsToSelector('setVisibilityPriority:')) {
		TKUnit.assertEqual(barButtonItem.visibilityPriority, (<any>global).UIBarButtonItemVisibilityPriorityLow, 'visibilityPriority');
		TKUnit.assertEqual(barButtonItem.axisBehavior, 1, 'axisBehavior should be horizontalOnly');
	}
}

export function test_navigationButton_visibility() {
	const actionItem = new actionBar.NavigationButton();
	actionItem.text = 'Test';
	const page = createPageAndNavigate();

	page.actionBar.navigationButton = actionItem;

	const viewController = <UIViewController>page.ios;
	const navigationItem: UINavigationItem = viewController.navigationItem;

	TKUnit.assertFalse(navigationItem.hidesBackButton, 'Visibility does not work');
	actionItem.visibility = CoreTypes.Visibility.collapse;

	TKUnit.waitUntilReady(() => {
		return navigationItem.hidesBackButton;
	});

	TKUnit.assertTrue(navigationItem.hidesBackButton, 'Visibility does not work');
}
