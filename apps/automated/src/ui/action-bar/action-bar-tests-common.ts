import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { Builder } from '@nativescript/core/ui/builder';
import { Label } from '@nativescript/core/ui/label';
import { Button } from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';
import { View, isIOS } from '@nativescript/core';
import { fromObject } from '@nativescript/core/data/observable';
import { Frame } from '@nativescript/core/ui/frame';

// >> actionbar-common-require
import * as actionBarModule from '@nativescript/core/ui/action-bar';
// << actionbar-common-require

export function test_actionItem_inherit_bindingContext() {
	let page: Page;
	let label: Label;
	const context = { text: 'item' };

	const pageFactory = function (): Page {
		page = new Page();
		page.bindingContext = context;
		const actionItem = new actionBarModule.ActionItem();

		actionItem.bind({
			sourceProperty: 'text',
			targetProperty: 'text',
		});

		page.actionBar.actionItems.addItem(actionItem);

		label = new Label();
		label.text = 'Text';
		page.content = label;

		return page;
	};

	helper.navigate(pageFactory);

	TKUnit.assertEqual(page.actionBar.actionItems.getItemAt(0).text, 'item', 'actionItem.text');
}

export function test_actionBar_inherit_bindingContext_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar title="{{ myProp }} " /> </Page.actionBar> </Page>');
	p.bindingContext = { myProp: 'success' };

	TKUnit.assertEqual(p.actionBar.title, 'success', 'actionBar.title');
}

export function test_actionItem_inherit_bindingContext_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionBar.actionItems>' + '<ActionItem text="{{ myProp }} " />' + '</ActionBar.actionItems> </ActionBar> </Page.actionBar> </Page>');
	p.bindingContext = { myProp: 'success' };

	const actionItem = p.actionBar.actionItems.getItemAt(0);

	TKUnit.assertEqual(actionItem.text, 'success', 'actionItem.text');
}

export function test_actionItem_page_property_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionBar.actionItems>' + '<ActionItem text="test" />' + '</ActionBar.actionItems> </ActionBar> </Page.actionBar> </Page>');

	const actionItem = p.actionBar.actionItems.getItemAt(0);

	TKUnit.assertEqual(actionItem.page, p, 'actionItem.page');
}

export function test_actionItem_actionView_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>' + '<Label/>' + '</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>');

	const label = <Label>p.actionBar.actionItems.getItemAt(0).actionView;
	TKUnit.assert(label instanceof Label, 'ActionItem.actionView not loaded correctly');
}

export function test_actionItem_actionView_inherit_bindingContext_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>' + '<Label text="{{ myProp }} " />' + '</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>');
	p.bindingContext = { myProp: 'success' };

	const label = <Label>p.actionBar.actionItems.getItemAt(0).actionView;
	TKUnit.assert(label instanceof Label, 'ActionItem.actionView not loaded correctly');
	TKUnit.assertEqual(label.text, 'success', 'ActionItem.actionView');
}

export function test_ActionBar_is_not_empty_when_actionItem_actionView_is_set() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>' + '<Label text="test" />' + '</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>');

	TKUnit.assertFalse(p.actionBar._isEmpty(), 'ActionItem.actionView is set but ActionBar reports empty');
}

export function test_navigationButton_inherit_bindingContext_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar>' + '<NavigationButton text="{{ myProp }} " />' + '</ActionBar> </Page.actionBar> </Page>');
	p.bindingContext = { myProp: 'success' };

	const navButton = p.actionBar.navigationButton;
	TKUnit.assertEqual(navButton.text, 'success', 'actionItem.text');
}

export function test_titleView_inherit_bindingContext_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>' + '<Button text="{{ myProp }} " />' + '</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>');
	p.bindingContext = { myProp: 'success' };

	const centerBtn = <Button>p.actionBar.titleView;
	TKUnit.assert(centerBtn instanceof Button, 'titleView not loaded correctly');
	TKUnit.assertEqual(centerBtn.text, 'success', 'actionItem.text');
}

export function test_titleView_inXML() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>' + '<Button/>' + '</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>');

	const centerBtn = <Button>p.actionBar.titleView;
	TKUnit.assert(centerBtn instanceof Button, 'titleView not loaded correctly');
}

export function test_titleView_inXML_short_definition() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar>' + '<Button/>' + '</ActionBar> </Page.actionBar> </Page>');

	const centerBtn = <Button>p.actionBar.titleView;
	TKUnit.assert(centerBtn instanceof Button, 'titleView not loaded correctly');
}

export function test_ActionBar_is_not_empty_when_titleView_is_set() {
	const p = <Page>Builder.parse('<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>' + '<Button text="test" />' + '</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>');

	TKUnit.assertFalse(p.actionBar._isEmpty(), 'titleView is set but ActionBar reports empty');
}

export function test_ActionBarItemBindingToEvent() {
	const p = <Page>Builder.parse('<Page><Page.actionBar><ActionBar><ActionBar.actionItems><ActionItem tap="{{ test }}"/></ActionBar.actionItems></ActionBar></Page.actionBar></Page>');

	const testAction = function (views: Array<View>) {
		const page = <Page>views[0];
		let firstHandlerCallCounter = 0;
		let secondHandlerCallCounter = 0;
		const firstHandler = function () {
			firstHandlerCallCounter++;
		};
		const secondHandler = function () {
			secondHandlerCallCounter++;
		};

		page.bindingContext = fromObject({ test: firstHandler });

		const actionBarItem = page.actionBar.actionItems.getItemAt(0);

		TKUnit.assertEqual((<any>actionBarItem)._observers['tap'].length, 1, 'There should be only one listener');
		TKUnit.assertEqual((<any>actionBarItem)._observers['tap'][0].callback + '', firstHandler.toString(), 'First handler is not equal');

		p.bindingContext.set('test', secondHandler);

		TKUnit.assertEqual((<any>actionBarItem)._observers['tap'].length, 1, 'There should be only one listener');
		TKUnit.assertEqual((<any>actionBarItem)._observers['tap'][0].callback + '', secondHandler.toString(), 'Second handler is not equal');
	};

	helper.navigate(function () {
		return p;
	});
	testAction([p]);
}

export function test_Setting_ActionItems_doesnt_thrown() {
	let page: Page;
	let label: Label;
	let gotException = false;

	const pageFactory = function (): Page {
		page = new Page();
		const actionItem = new actionBarModule.ActionItem();
		actionItem.text = 'Item';
		page.actionBar.actionItems.addItem(actionItem);

		label = new Label();
		label.text = 'Text';
		page.content = label;

		return page;
	};

	try {
		helper.navigate(pageFactory);
	} catch (e) {
		gotException = true;
	}

	TKUnit.assert(!gotException, 'Expected: false, Actual: ' + gotException);
}

export function test_Setting_ActionItemsWithNumberAsText_doesnt_thrown() {
	let gotException = false;

	try {
		helper.navigateToModule('ui/action-bar/ActionBar_NumberAsText');
	} catch (e) {
		gotException = true;
	}

	TKUnit.assert(!gotException, 'Expected: false, Actual: ' + gotException);
}

export function test_ActionBar_set_title_as_number_doesnt_thrown() {
	let gotException = false;

	try {
		helper.navigateToModule('ui/action-bar/ActionBar_NumberAsTitle');
	} catch (e) {
		gotException = true;
	}

	TKUnit.assert(!gotException, 'Expected: false, Actual: ' + gotException);
}

export function test_CanDefineEverythingAsContentBetweenTheTwoTags() {
	helper.navigateToModuleAndRunTest('ui/action-bar/ActionBar_BetweenTags', undefined, (page: Page) => {
		TKUnit.assertNotNull(page.actionBar.navigationButton);
		TKUnit.assertEqual(page.actionBar.navigationButton.text, 'nb');

		TKUnit.assertNull(page.actionBar.title);
		TKUnit.assertNotNull(page.actionBar.titleView);
		TKUnit.assertTrue(page.actionBar.titleView instanceof Label);
		TKUnit.assertEqual((<Label>page.actionBar.titleView).text, 'tv');

		TKUnit.assertNotNull(page.actionBar.actionItems);
		const items = page.actionBar.actionItems.getItems();
		TKUnit.assertEqual(items.length, 3);

		TKUnit.assertEqual(items[0].text, 'i1');
		TKUnit.assertEqual(items[1].text, 'i2');
		TKUnit.assertEqual(items[2].text, 'i3');
	});
}

export function test_LoadedEventsOrder() {
	const loadedEvents = new Array<string>();
	const pageFactory = function (): Page {
		const page = new Page();
		page.on(View.loadedEvent, () => {
			loadedEvents.push('page');
		});

		page.actionBar.on(View.loadedEvent, () => {
			loadedEvents.push('action-bar');
		});

		const content = new Label();
		content.on(View.loadedEvent, () => {
			loadedEvents.push('content');
		});
		page.content = content;

		return page;
	};

	helper.navigate(pageFactory);

	TKUnit.arrayAssert(loadedEvents, new Array<string>('content', 'action-bar', 'page'));
}

export function test_LoadedEventsOrder_WithoutPageContent() {
	const loadedEvents = new Array<string>();
	const pageFactory = function (): Page {
		const page = new Page();
		page.on(View.loadedEvent, () => {
			loadedEvents.push('page');
		});

		page.actionBar.on(View.loadedEvent, () => {
			loadedEvents.push('action-bar');
		});

		return page;
	};

	helper.navigate(pageFactory);

	TKUnit.arrayAssert(loadedEvents, new Array<string>('action-bar', 'page'));
}

export function test_ActionBarVisibility_Never_ShouldNotShowDeclaredActionBar() {
	const frame = Frame.topmost();
	frame.actionBarVisibility = 'never';

	const page = <Page>Builder.parse(
		`<Page>
            <ActionBar>
                <ActionBar.titleView>
                    <Button text="test" />
                </ActionBar.titleView>
            </ActionBar>
        </Page>
        `
	);

	helper.navigate(() => page);
	let actionBarHidden = false;
	if (isIOS) {
		actionBarHidden = page.actionBar.nativeView.hidden;
	} else {
		actionBarHidden = !page.actionBar.nativeView.isShown();
	}
	TKUnit.assertTrue(actionBarHidden, `ActionBar hidden: expected true, actual ${actionBarHidden}`);

	// restore default actionBarVisibility
	frame.actionBarVisibility = 'auto';
}

export function test_ActionBarVisibility_Always_ShouldShownHiddenActionBar() {
	const frame = Frame.topmost();
	frame.actionBarVisibility = 'always';

	const page = <Page>Builder.parse(
		`<Page actionBarHidden="true">
            <ActionBar>
                <ActionBar.titleView>
                    <Button text="test" />
                </ActionBar.titleView>
            </ActionBar>
        </Page>
        `
	);

	helper.navigate(() => page);
	let actionBarHidden = false;
	if (isIOS) {
		actionBarHidden = page.actionBar.nativeView.hidden;
	} else {
		actionBarHidden = !page.actionBar.nativeView.isShown();
	}
	TKUnit.assertFalse(actionBarHidden, `ActionBar hidden: expected false, actual ${actionBarHidden}`);

	// restore default actionBarVisibility
	frame.actionBarVisibility = 'auto';
}

export function test_ActionBarVisibility_Auto_ShouldRespectPageActionBarHiddenProperty() {
	const frame = Frame.topmost();
	frame.actionBarVisibility = 'auto';

	const page = <Page>Builder.parse(
		`<Page actionBarHidden="true">
            <ActionBar>
                <ActionBar.titleView>
                    <Button text="test" />
                </ActionBar.titleView>
            </ActionBar>
        </Page>
        `
	);

	helper.navigate(() => page);
	let actionBarHidden = false;
	if (isIOS) {
		actionBarHidden = page.actionBar.nativeView.hidden;
	} else {
		actionBarHidden = !page.actionBar.nativeView.isShown();
	}
	TKUnit.assertTrue(actionBarHidden, `ActionBar hidden: expected true, actual ${actionBarHidden}`);

	// restore default actionBarVisibility
	frame.actionBarVisibility = 'auto';
}

export function test_setId() {
	const pageFactory = function (): Page {
		const page = new Page();
		page.actionBar.id = 'myId';

		return page;
	};

	try {
		helper.navigate(pageFactory);
	} catch (e) {
		TKUnit.assert(false, "Failed to apply property 'id' to actionBar before its nativeView is ready.");
	}
}

export function createPageAndNavigate() {
	let page: Page;
	const pageFactory = function (): Page {
		page = new Page();

		const label = new Label();
		label.text = 'Text';
		page.content = label;

		return page;
	};

	helper.navigate(pageFactory);

	return page;
}

export function test_recycling() {
	helper.nativeView_recycling_test(() => new actionBarModule.ActionBar());
}
