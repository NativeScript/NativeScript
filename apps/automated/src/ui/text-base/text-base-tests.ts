import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { FormattedString, isIOS, Label, Span, StackLayout } from '@nativescript/core';

export function test_native_font_size_with_a11y_font_scale() {
	if (isIOS) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iosAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * deviceFontScaleMock;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size does not respect a11y font scaling');
	}
}
