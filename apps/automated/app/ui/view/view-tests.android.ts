import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View, unsetValue } from '@nativescript/core/ui/core/view';
import { Button } from '@nativescript/core/ui/button';
import * as types from '@nativescript/core/utils/types';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Label } from '@nativescript/core/ui/label';
import { Trace } from '@nativescript/core';
import { Color } from '@nativescript/core/color';
import { isIOS } from '@nativescript/core';

// enable the trace, it is disabled by default
Trace.enable();

export * from './view-tests-common';

// function setup(): StackLayout {
//     const page = helper.getClearCurrentPage();
//     const stack = new StackLayout();
//     page.content = stack;
//     return stack;
// }

// export function test_recycle_native_view_never() {
//     const stack = setup();
//     const btn = new Button();
//     btn.recycleNativeView = 'never';
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.nativeViewProtected);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertNotEqual(oldNativeView, newNativeView);
// }

// export function test_recycle_native_view_always() {
//     const stack = setup();
//     const btn = new Button();
//     btn.recycleNativeView = 'always';
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.nativeViewProtected);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertEqual(oldNativeView, newNativeView);
// }

// export function test_recycle_native_view_auto_access_nativeView() {
//     const stack = setup();
//     const btn = new Button();
//     btn.recycleNativeView = 'auto';
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.nativeView);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertNotEqual(oldNativeView, newNativeView);
// }

// export function test_recycle_native_view_auto_access_android() {
//     const stack = setup();
//     const btn = new Button();
//     btn.recycleNativeView = 'auto';
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.android);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertNotEqual(oldNativeView, newNativeView);
// }

// export function test_recycle_property_counter_few_properties() {
//     const stack = setup();
//     const btn = new Button();
//     btn.text = "text";
//     btn.recycleNativeView = 'auto';
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.nativeViewProtected);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertEqual(oldNativeView, newNativeView);
// }

// export function test_recycle_property_counter_more_properties() {
//     const stack = setup();
//     const btn = new Button();
//     btn.recyclePropertyCounter = 1;
//     btn.recycleNativeView = 'auto';
//     btn.text = "text";
//     btn.style.margin = "20";
//     stack.addChild(btn);
//     TKUnit.assertNotNull(btn.nativeViewProtected);

//     const oldNativeView = btn.nativeViewProtected;
//     stack.removeChild(btn);
//     stack.addChild(btn);
//     const newNativeView = btn.nativeViewProtected;
//     TKUnit.assertNotEqual(oldNativeView, newNativeView);
// }

export function test_event_setupUI_IsRaised() {
	const test = function (views: Array<View>) {
		views.forEach((v) => {
			TKUnit.assertNotNull(v.nativeViewProtected, '_setupUI should initialize set nativeView');
		});
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_event_setupUI_IsRaised_WhenAttached_Dynamically() {
	const test = function (views: Array<View>) {
		// add new button to the visual tree and ensure its _setupUI event
		const btn = new Button();
		(<StackLayout>views[1]).addChild(btn);
		TKUnit.assertNotNull(btn.nativeViewProtected, '_setupUI should initialize nativeViewProtected');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_event_onContextChanged_IsRaised_WhenAttached() {
	const test = function (views: Array<View>) {
		views.forEach((v) => {
			TKUnit.assertNotNull(v._context, '_setupUI should initialize _context');
		});
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_event_onContextChanged_IsRaised_WhenAttached_Dynamically() {
	const test = function (views: Array<View>) {
		// add new button to the visual tree and ensure its _onContextChanged event
		const btn = new Button();
		(<StackLayout>views[1]).addChild(btn);
		TKUnit.assertNotNull(btn._context, '_setupUI should initialize _context');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_event_tearDownUI_IsRaised() {
	let btn;
	let stack;
	const test = function (views: Array<View>) {
		stack = views[1];
		btn = views[1];
		// once the above method completes goBack on the current frame is called which will detach the tested views
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);

	// _tearDownUI event is propagated to nested children first
	TKUnit.assertNull(stack.nativeViewProtected, '_tearDownUI should clear nativeViewProtected');
	TKUnit.assertNull(btn.nativeViewProtected, '_tearDownUI should clear nativeViewProtected');
}

export function test_event_tearDownUI_IsRaised_WhenRemoved_Dynamically() {
	const test = function (views: Array<View>) {
		// add new button to the visual tree and ensure its _tearDownUI event
		// remove the button from the layout
		const v = views[2];
		(<StackLayout>views[1]).removeChild(v);

		TKUnit.assertNull(v.nativeViewProtected, '_tearDownUI should clear nativeViewProtected');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_events_tearDownUIAndRemovedFromNativeVisualTree_AreRaised_WhenNavigateBack() {
	const test = function (views: Array<View>) {
		const page = views[0].page;
		const stack = views[1];
		const btn = views[2];

		const nativeBtn = btn.nativeViewProtected;
		const nativeStack = stack.nativeViewProtected;
		page.content = null;

		// 2 tearDownUI calls: stack, button
		TKUnit.assertNull(btn.nativeViewProtected);
		TKUnit.assertNull(stack.nativeViewProtected);

		TKUnit.assertNull(btn._context);
		TKUnit.assertNull(stack._context);

		const btnNativeParent = isIOS ? nativeBtn.superview : nativeBtn.getParent();
		const stackNativeParent = isIOS ? nativeStack.superview : nativeStack.getParent();

		TKUnit.assertNull(btnNativeParent, 'button NativeParent should be null');
		TKUnit.assertNull(stackNativeParent, 'stack NativeParent should be null');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_cachedProperties_Applied_WhenNativeWidged_IsCreated() {
	const test = function (views: Array<View>) {
		const newButton = new Button();
		newButton.text = 'Test Button';
		TKUnit.assertNull(newButton.android);
		(<StackLayout>views[1]).addChild(newButton);

		TKUnit.assertTrue(!!newButton.android);
		// TODO: There is currently an issue with the getText conversion to JavaScript string
		TKUnit.assertEqual(newButton.android.getText(), 'Test Button');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_automation_text_set_to_native() {
	const test = function (views: Array<View>) {
		const newButton = new Button();
		newButton.automationText = 'Button1';
		(<StackLayout>views[1]).addChild(newButton);
		TKUnit.assertEqual((<android.widget.Button>newButton.android).getContentDescription(), 'Button1', 'contentDescription not set to native ');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export const test_StylePropertiesDefaultValuesCache = function () {
	const testValue = 35;

	const test = function (views: [View, StackLayout, Button, View]) {
		const testLabel = new Label();
		const testButton = new Button();
		const stack = views[1];

		stack.addChild(testLabel);
		stack.addChild(testButton);

		const defaultLabelFontSize = (<android.widget.TextView>testLabel.android).getTextSize();
		const defaultButtonFontSize = (<android.widget.Button>testButton.android).getTextSize();

		testLabel.style.fontSize = testValue;
		testButton.style.fontSize = testValue;

		let actualLabelTextSize = (<android.widget.TextView>testLabel.android).getTextSize();
		let actualButtonTextSize = (<android.widget.Button>testButton.android).getTextSize();

		TKUnit.assert(actualLabelTextSize !== defaultLabelFontSize, 'Label text size should be different from default!');
		TKUnit.assert(actualButtonTextSize !== defaultButtonFontSize, 'Button text size should be different from default!');

		testLabel.style.fontSize = unsetValue;
		testButton.style.fontSize = unsetValue;

		actualLabelTextSize = (<android.widget.TextView>testLabel.android).getTextSize();
		actualButtonTextSize = (<android.widget.Button>testButton.android).getTextSize();

		TKUnit.assertEqual(actualLabelTextSize, defaultLabelFontSize, 'Label text size should be default!');
		TKUnit.assertEqual(actualButtonTextSize, defaultButtonFontSize, 'Button text size should be default!');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function getUniformNativeBorderWidth(v: View): number {
	const bkg = <org.nativescript.widgets.BorderDrawable>v.android.getBackground();

	return bkg ? bkg.getUniformBorderWidth() : 0;
}

export function checkUniformNativeBorderColor(v: View): boolean {
	const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();

	return bkg && bkg.getUniformBorderColor() === (<Color>v.borderColor).android;
}

export function getUniformNativeCornerRadius(v: View): number {
	const bkg = <org.nativescript.widgets.BorderDrawable>v.android.getBackground();

	return bkg ? bkg.getUniformBorderRadius() : 0;
}

export function checkNativeBackgroundColor(v: View): boolean {
	const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();

	return v.backgroundColor && bkg && bkg.getBackgroundColor() === (<Color>v.backgroundColor).android;
}

export function checkNativeBackgroundImage(v: View): boolean {
	const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();

	return bkg && !types.isNullOrUndefined(bkg.getBackgroundImage());
}
