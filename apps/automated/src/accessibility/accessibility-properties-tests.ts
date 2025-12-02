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

export function test_iosAccessibilityMaxFontScalimport * as TKUnit from '../tk-unit';
import * as helper from '../ui-helper';
import { isIOS, Label, StackLayout, Page } from '@nativescript/core';

// ✅ Reusable test setup for all cases
function setupTestEnvironment(): { page: Page; layout: StackLayout; label: Label } {
    const page = helper.getCurrentPage();
    const layout = new StackLayout();
    const label = new Label();
    layout.addChild(label);
    page.content = layout;
    return { page, layout, label };
}

export function test_iosAccessibilityAdjustsFontSize_property() {
    if (!isIOS) {
        console.log('Skipping test: iOS-specific feature.');
        return;
    }

    const deviceFontScaleMock = 4.0;
    const { layout, label } = setupTestEnvironment();

    // Step 1: Disable scaling
    layout.style.iosAccessibilityAdjustsFontSize = false;
    layout.style.fontScaleInternal = deviceFontScaleMock;

    const baseFontSize = label.nativeTextViewProtected.font.pointSize;

    // Step 2: Enable scaling
    layout.style.iosAccessibilityAdjustsFontSize = true;
    const adjustedFontSize = label.nativeTextViewProtected.font.pointSize;

    TKUnit.assertEqual(
        baseFontSize,
        label.style.fontSize,
        '❌ Font scaled even though iosAccessibilityAdjustsFontSize is disabled.'
    );

    TKUnit.assertEqual(
        adjustedFontSize,
        label.style.fontSize * deviceFontScaleMock,
        '❌ Font did not scale correctly when iosAccessibilityAdjustsFontSize was enabled.'
    );

    console.log('✅ test_iosAccessibilityAdjustsFontSize_property passed.');
}

export function test_iosAccessibilityMinFontScale_property() {
    if (!isIOS) {
        console.log('Skipping test: iOS-specific feature.');
        return;
    }

    const deviceFontScaleMock = 1.0;
    const { layout, label } = setupTestEnvironment();

    layout.style.iosAccessibilityAdjustsFontSize = true;
    layout.style.fontScaleInternal = deviceFontScaleMock;

    // Apply minimum scale
    label.style.iosAccessibilityMinFontScale = 2.0;

    const actualFontSize = label.nativeTextViewProtected.font.pointSize;
    const expectedFontSize = label.style.fontSize * label.style.iosAccessibilityMinFontScale;

    TKUnit.assertEqual(
        actualFontSize,
        expectedFontSize,
        '❌ Font size does not respect iosAccessibilityMinFontScale.'
    );

    console.log('✅ test_iosAccessibilityMinFontScale_property passed.');
}

export function test_iosAccessibilityMaxFontScale_property() {
    if (!isIOS) {
        console.log('Skipping test: iOS-specific feature.');
        return;
    }

    const deviceFontScaleMock = 4.0;
    const { layout, label } = setupTestEnvironment();

    layout.style.iosAccessibilityAdjustsFontSize = true;
    layout.style.fontScaleInternal = deviceFontScaleMock;

    // Apply maximum scale
    label.style.iosAccessibilityMaxFontScale = 2.0;

    const actualFontSize = label.nativeTextViewProtected.font.pointSize;
    const expectedFontSize = label.style.fontSize * label.style.iosAccessibilityMaxFontScale;

    TKUnit.assertEqual(
        actualFontSize,
        expectedFontSize,
        '❌ Font size does not respect iosAccessibilityMaxFontScale.'
    );

    console.log('✅ test_iosAccessibilityMaxFontScale_property passed.');
}
e_property() {
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
