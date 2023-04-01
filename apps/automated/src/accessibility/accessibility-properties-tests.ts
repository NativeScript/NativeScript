import * as TKUnit from '../tk-unit';
import * as helper from '../ui-helper';
import { isIOS, Label, StackLayout } from '@nativescript/core';

export function test_iOSAccessibilityAdjustsFontSize_property() {
	if (isIOS) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iOSAccessibilityAdjustsFontSize = false;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		layout.style.iOSAccessibilityAdjustsFontSize = true;
		const nativeFontSizeWithAdjust = testView.nativeTextViewProtected.font.pointSize;

		TKUnit.assertEqual(nativeFontSize, testView.style.fontInternal.fontSize, 'View font size was scaled even though iOSAccessibilityAdjustsFontSize is disabled');
		TKUnit.assertEqual(nativeFontSizeWithAdjust, testView.style.fontInternal.fontSize * deviceFontScaleMock, 'View font size was not scaled even though iOSAccessibilityAdjustsFontSize is enabled');
	}
}

export function test_iOSAccessibilityMinFontScale_property() {
	if (isIOS) {
		const deviceFontScaleMock = 1.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iOSAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		testView.style.iOSAccessibilityMinFontScale = 2.0;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * testView.style.iOSAccessibilityMinFontScale;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size scaling does not respect iOSAccessibilityMinFontScale');
	}
}

export function test_iOSAccessibilityMaxFontScale_property() {
	if (isIOS) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iOSAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		testView.style.iOSAccessibilityMaxFontScale = 2.0;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * testView.style.iOSAccessibilityMaxFontScale;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size scaling does not respect iOSAccessibilityMaxFontScale');
	}
}
