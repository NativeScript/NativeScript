import { View, Page, Button, GridLayout, Color, Utils } from '@nativescript/core';
import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { _createBackgroundColorView, _createLabelWithBorder } from './view-tests-common';

export * from './view-tests-common';

class MyGrid extends GridLayout {
	public backgroundDrawCount: number = 0;

	_redrawNativeBackground(background: any) {
		this.backgroundDrawCount++;
		super._redrawNativeBackground(background);
	}
}

export function getUniformNativeBorderWidth(v: View): number {
	return Utils.layout.toDevicePixels((<UIView>v.ios).layer.borderWidth);
}

export function checkUniformNativeBorderColor(v: View): boolean {
	if (v.borderColor instanceof Color) {
		return (<UIView>v.ios).layer.borderColor === (<Color>v.borderColor).ios.CGColor;
	}

	return undefined;
}

export function getUniformNativeCornerRadius(v: View): number {
	return Utils.layout.toDevicePixels((<UIView>v.ios).layer.cornerRadius);
}

export function testBackgroundColor() {
	helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
		const lbl = views[0];
		helper.waitUntilLayoutReady(lbl);
		TKUnit.assertEqual(checkNativeBackgroundColor(lbl), true, 'BackgroundColor not applied correctly!');
	});
}

export function testBackgroundBorderColor() {
	helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
		const lbl = views[0];
		helper.waitUntilLayoutReady(lbl);
		TKUnit.assertEqual(checkNativeBackgroundColor(lbl), true, 'BackgroundColor not applied correctly!');
	});
}
export function testSetAndRemoveBackgroundColor() {
	helper.buildUIAndRunTest(_createBackgroundColorView(), function (views: Array<View>) {
		const lbl = views[0];
		helper.waitUntilLayoutReady(lbl);
		TKUnit.assertEqual(checkNativeBackgroundColor(lbl), true, 'BackgroundColor not applied correctly!');
		lbl.backgroundColor = null;
		TKUnit.assertEqual(checkNativeBackgroundColor(lbl), true, 'BackgroundColor not applied correctly!');
	});
}

export function testBackgroundImage() {
	const lbl = _createLabelWithBorder();
	lbl.className = 'myClass';
	helper.buildUIAndRunTest(lbl, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = ".myClass { background-image: url('~/assets/logo.png') }";
		TKUnit.assertEqual(checkNativeBackgroundImage(lbl), true, 'Style background-image not loaded correctly.');
	});
}

export function checkNativeBackgroundColor(v: View): boolean {
	if (v.ios instanceof UILabel) {
		var cgColor1 = (<UILabel>v.ios).layer.backgroundColor;
		var cgColor2 = (<UIColor>(<Color>v.backgroundColor)?.ios)?.CGColor;

		if (v.backgroundColor) {
			return v.backgroundColor && !!CGColorEqualToColor(cgColor1, cgColor2);
		} else {
			return !cgColor1 && !cgColor2;
		}
	}
	if (v.backgroundColor) {
		return (<UIView>v.ios)?.backgroundColor.isEqual((<Color>v.backgroundColor)?.ios);
	} else {
		return !(<UIView>v.ios).backgroundColor && !v.backgroundColor;
	}
}

export function checkNativeBackgroundImage(v: View): boolean {
	return (<UIView>v.ios).backgroundColor !== undefined;
}

export function testBackgroundInternalChangedOnceOnResize() {
	let root = helper.getCurrentPage();
	let layout = new MyGrid();
	layout.className = 'myClass';
	layout.backgroundColor = new Color(255, 255, 0, 0);

	root.css = ".myClass { background-image: url('~/assets/logo.png') }";
	root.content = layout;

	function trackCount() {
		let result = layout.backgroundDrawCount;
		layout.backgroundDrawCount = 0;

		return result;
	}

	trackCount();
	layout.requestLayout();
	layout.layout(0, 0, 200, 200);

	TKUnit.assertEqual(trackCount(), 1, 'Expected background to be re-applied at most once when the view is laid-out on 0 0 200 200.');

	// Ignore safe area as it may result in re-calculating view frame, thus trigger a size change regardless
	layout.iosIgnoreSafeArea = true;

	layout.requestLayout();
	layout.layout(50, 50, 250, 250);

	TKUnit.assertEqual(trackCount(), 0, 'Expected background to NOT change when view is laid-out from 0 0 200 200 to 50 50 250 250.');

	layout.iosIgnoreSafeArea = false;

	layout.requestLayout();
	layout.layout(0, 0, 250, 250);

	TKUnit.assertEqual(trackCount(), 1, 'Expected background to be re-applied at most once when the view is laid-out from 50 50 250 250 to 0 0 250 250.');
}

export function test_automation_text_set_to_native() {
	var newButton = new Button();
	newButton.automationText = 'Button1';
	newButton.accessibilityLabel = 'Button1';
	helper.getCurrentPage().content = newButton;
	TKUnit.assertEqual((<UIView>newButton.ios).accessibilityIdentifier, 'Button1', 'accessibilityIdentifier not set to native view.');
	TKUnit.assertEqual((<UIView>newButton.ios).accessibilityLabel, 'Button1', 'accessibilityLabel not set to native view.');
}
