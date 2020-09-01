import * as TKUnit from '../../tk-unit';
import { createPageAndNavigate } from './action-bar-tests-common';
import { ActionItem } from '@nativescript/core/ui/action-bar';
import { Visibility } from '@nativescript/core/ui/enums';
import { Button } from '@nativescript/core/ui/button';

export * from './action-bar-tests-common';

export function test_actionItem_visibility() {
	const actionItem = new ActionItem();
	actionItem.text = 'Test';
	const page = createPageAndNavigate();
	page.actionBar.actionItems.addItem(actionItem);
	const toolbar = <androidx.appcompat.widget.Toolbar>page.actionBar.nativeViewProtected;
	const menu = toolbar.getMenu();

	TKUnit.assertTrue(menu.hasVisibleItems(), 'Visibility does not work');
	actionItem.visibility = Visibility.collapse;
	TKUnit.assertFalse(menu.hasVisibleItems(), 'Visibility does not work');
}

export function test_navigationButton_visibility() {
	const actionItem = new ActionItem();
	actionItem.icon = '~/assets/small-image.png';
	const page = createPageAndNavigate();
	page.actionBar.navigationButton = actionItem;

	const toolbar = <androidx.appcompat.widget.Toolbar>page.actionBar.nativeViewProtected;

	TKUnit.assertNotNull(toolbar.getNavigationIcon(), 'Visibility does not work');
	actionItem.visibility = Visibility.collapse;
	TKUnit.assertNull(toolbar.getNavigationIcon(), 'Visibility does not work');
}

export function test_navigationButton_contentDecription() {
	const actionItem = new ActionItem();
	actionItem.icon = '~/assets/small-image.png';
	const actionItemText = 'NavButton with small-image';
	actionItem.text = actionItemText;
	const page = createPageAndNavigate();
	page.actionBar.navigationButton = actionItem;

	const toolbar = <androidx.appcompat.widget.Toolbar>page.actionBar.nativeViewProtected;

	TKUnit.assertEqual(toolbar.getNavigationContentDescription(), actionItemText, 'Navigation Button should have an content decription');
}

export function test_set_actionView_to_attached_actionItem_propagates_context() {
	const actionItem = new ActionItem();
	const actionButton = new Button();
	actionItem.actionView = actionButton;

	const page = createPageAndNavigate();

	// sanity check
	TKUnit.assertNotNull(page.content._context, 'Page content context should not be null');

	// assert null before add
	TKUnit.assertNull(actionItem._context, 'Action Item context should be null before added');
	TKUnit.assertNull(actionButton._context, 'Action button context should not null before added');

	page.actionBar.actionItems.addItem(actionItem);

	// assert not null after add
	TKUnit.assertNotNull(actionItem._context, 'Action Item context should not be null after add');
	TKUnit.assertNotNull(actionButton._context, 'Action button context should not be null after add');
}

export function test_add_actionItem_with_actionView_propagates_context() {
	const actionItem = new ActionItem();

	const page = createPageAndNavigate();

	// sanity check
	TKUnit.assertNotNull(page.content._context, 'Page content context should not be null');

	// add actionItem to the actionBar
	TKUnit.assertNull(actionItem._context, 'Action Item context should be null before added');
	page.actionBar.actionItems.addItem(actionItem);
	TKUnit.assertNotNull(actionItem._context, 'Action Item context should not be null after add');

	const actionButton = new Button();

	// add actionButton to the actionItem
	TKUnit.assertNull(actionButton._context, 'Action button context should be null before added');
	actionItem.actionView = actionButton;
	TKUnit.assertNotNull(actionButton._context, 'Action button context should not be null after add');
}
