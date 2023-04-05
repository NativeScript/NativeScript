import * as TKUnit from '../tk-unit';
import * as helper from '../ui-helper';
import { isIOS, Label, StackLayout } from '@nativescript/core';

export function test_iosAccessibilityAdjustsFontSize_property() {
	if (isIOS) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iosAccessibilityAdjustsFontSize = false;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		layout.style.iosAccessibilityAdjustsFontSize = true;
		const nativeFontSizeWithAdjust = testView.nativeTextViewProtected.font.pointSize;

		TKUnit.assertEqual(nativeFontSize, testView.style.fontInternal.fontSize, 'View font size was scaled even though iosAccessibilityAdjustsFontSize is disabled');
		TKUnit.assertEqual(nativeFontSizeWithAdjust, testView.style.fontInternal.fontSize * deviceFontScaleMock, 'View font size was not scaled even though iosAccessibilityAdjustsFontSize is enabled');
	}
}

export function test_iosAccessibilityMinFontScale_property() {
	if (isIOS) {
		const deviceFontScaleMock = 1.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iosAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		testView.style.iosAccessibilityMinFontScale = 2.0;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * testView.style.iosAccessibilityMinFontScale;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size scaling does not respect iosAccessibilityMinFontScale');
	}
}

export function test_iosAccessibilityMaxFontScale_property() {
	if (isIOS) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iosAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		testView.style.iosAccessibilityMaxFontScale = 2.0;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * testView.style.iosAccessibilityMaxFontScale;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size scaling does not respect iosAccessibilityMaxFontScale');
	}
}
