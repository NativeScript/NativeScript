import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { Label } from '@nativescript/core';

export function test_native_font_size_with_a11y_font_scale() {
	const page = helper.getCurrentPage();
	const testView = new Label();
	const deviceFontScaleMock = 4.0;

	page.content = testView;

	testView.style._fontScale = deviceFontScaleMock;

	const nativeFontSize = testView.nativeTextViewProtected.font.pointSize;
	const expectedNativeFontSize = testView.style.fontInternal.fontSize * deviceFontScaleMock;
	TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size does not respect a11y font scaling');
}
