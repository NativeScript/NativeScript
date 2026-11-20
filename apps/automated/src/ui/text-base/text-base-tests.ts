import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { Button, FormattedString, Label, Span, StackLayout, Utils } from '@nativescript/core';

export function test_native_font_size_with_a11y_font_scale() {
	if (__APPLE__) {
		const deviceFontScaleMock = 4.0;

		const page = helper.getCurrentPage();
		const testView = new Label();
		const layout = new StackLayout();
		layout.addChild(testView);

		page.content = layout;

		layout.style.iosAccessibilityAdjustsFontSize = true;
		layout.style.fontScaleInternal = deviceFontScaleMock;

		const nativeFontSize = (testView.nativeTextViewProtected as unknown as TNSLabel).font.pointSize;
		const expectedNativeFontSize = testView.style.fontInternal.fontSize * deviceFontScaleMock;
		TKUnit.assertEqual(nativeFontSize, expectedNativeFontSize, 'View font size does not respect a11y font scaling');
	}
}

function collectJsAndJavaGarbage() {
	for (let i = 0; i < 3; i++) {
		Utils.GC();
		java.lang.System.gc();
		java.lang.System.runFinalization();
		TKUnit.wait(0.05);
	}
}

function displayedText(view: Label | Button): string {
	const nativeView = <android.widget.TextView>view.nativeTextViewProtected;

	return nativeView.getTransformationMethod().getTransformation(nativeView.getText(), nativeView).toString();
}

export function test_android_text_transform_survives_garbage_collection() {
	if (!__ANDROID__) {
		return;
	}

	const label = new Label();
	label.text = 'label';
	label.textTransform = 'uppercase';

	const span = new Span();
	span.text = 'button';
	const formattedText = new FormattedString();
	formattedText.spans.push(span);
	const button = new Button();
	button.formattedText = formattedText;

	const layout = new StackLayout();
	layout.addChild(label);
	layout.addChild(button);
	helper.getCurrentPage().content = layout;
	TKUnit.waitUntilReady(() => layout.isLoaded);

	collectJsAndJavaGarbage();
	label.text = 'changed';
	span.text = 'span changed';
	label.nativeViewProtected.requestLayout();
	button.nativeViewProtected.requestLayout();
	TKUnit.wait(0.05);

	TKUnit.assertEqual(displayedText(label), 'CHANGED', 'label text-transform after garbage collection');
	TKUnit.assertEqual(displayedText(button), 'span changed', 'button formatted text after garbage collection');
}
