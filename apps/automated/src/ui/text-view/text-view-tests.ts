import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as textViewTestsNative from './text-view-tests-native';
import { CoreTypes, Color, Page, View, TextView, BindingOptions, Observable } from '@nativescript/core';

// >> text-view-xml
// <Page loaded="pageLoaded">
//  <StackLayout orientation="vertical">
//    {%raw%}<TextView text="{{ someProperty }}" />
//    <TextView text="{{ someProperty }}" />{%endraw%}
//  </StackLayout>
// </Page>
// << text-view-xml
// >> observable-declare
export function pageLoaded(args) {
	const page = args.object;
	const obj = new Observable();
	obj.set('someProperty', 'Please change this text!');
	page.bindingContext = obj;
}
// << observable-declare

export function test_recycling() {
	helper.nativeView_recycling_test(_createTextViewFunc);
}

var _createTextViewFunc = function (): TextView {
	// >> text-view-create
	const textView = new TextView();
	// << text-view-create
	textView.text = 'textView';

	return textView;
};

export var testSetText = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		// >> set-text-value
		textView.text = 'Hello, world!';
		// << set-text-value

		const expectedValue = 'Hello, world!';
		const actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetTextNull = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		textView.text = null;

		const expectedValue = '';
		const actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetTextUndefined = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		textView.text = undefined;

		const expectedValue = '';
		const actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

// Supported for ios only.

export function test_set_color() {
	if (__APPLE__) {
		helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
			const textView = <TextView>views[0];
			textView.color = new Color('red');
			TKUnit.assertEqual(textView.color.ios.CGColor, textView.ios.textColor.CGColor, 'textView.color');
		});
	}
}

export var testBindTextDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		// >> binding-text-property-textview
		const model = new Observable();
		model.set('username', 'john');
		const options: BindingOptions = {
			sourceProperty: 'username',
			targetProperty: 'text',
		};
		textView.bind(options, model);
		// textView.text is now "john"
		// >> (hide)
		TKUnit.assert(textView.text === 'john', 'Actual: ' + textView.text + '; Expected: ' + 'john');
		TKUnit.assert(textViewTestsNative.getNativeText(textView) === 'john', 'Actual: ' + textViewTestsNative.getNativeText(textView) + '; Expected: ' + 'john');
		// << (hide)
		model.set('username', 'mary');
		// textView.text is now "mary"
		// >> (hide)
		TKUnit.assert(textView.text === 'mary', 'Actual: ' + textView.text + '; Expected: ' + 'mary');
		TKUnit.assert(textViewTestsNative.getNativeText(textView) === 'mary', 'Actual: ' + textViewTestsNative.getNativeText(textView) + '; Expected: ' + 'mary');
		// << (hide)
		// << binding-text-property-textview
	});
};

export var testBindTextToBindingContext = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];

		const model = new Observable();
		model.set('username', 'john');
		page.bindingContext = model;

		const options: BindingOptions = {
			sourceProperty: 'username',
			targetProperty: 'text',
		};

		textView.bind(options);
		TKUnit.assert(textView.text === 'john', 'Actual: ' + textView.text + '; Expected: ' + 'john');
		TKUnit.assert(textViewTestsNative.getNativeText(textView) === 'john', 'Actual: ' + textViewTestsNative.getNativeText(textView) + '; Expected: ' + 'john');

		model.set('username', 'mary');
		TKUnit.assert(textView.text === 'mary', 'Actual: ' + textView.text + '; Expected: ' + 'mary');
		TKUnit.assert(textViewTestsNative.getNativeText(textView) === 'mary', 'Actual: ' + textViewTestsNative.getNativeText(textView) + '; Expected: ' + 'mary');
	});
};

export var testTextIsUpdatedWhenUserTypes = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.updateTextTrigger = 'focusLost';

		const expectedValue = 'Hello, world!';
		textViewTestsNative.typeTextNatively(textView, expectedValue);

		const actualValue = textView.text;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetHint = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.text = '';

		// >> set-textview-hint
		textView.hint = 'type your username here';
		// << set-textview-hint

		const expectedValue = 'type your username here';
		const actualValue = textViewTestsNative.getNativeHint(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindHintDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.text = '';

		// >> binding-hint-property-textview
		const model = new Observable();
		model.set('hint', 'type your username here');
		const options: BindingOptions = {
			sourceProperty: 'hint',
			targetProperty: 'hint',
		};
		textView.bind(options, model);
		// TextView.hint is now "type your username here"
		// >> (hide)
		TKUnit.assert(textView.hint === 'type your username here', 'Actual: ' + textView.hint + '; Expected: ' + 'type your username here');
		TKUnit.assert(textViewTestsNative.getNativeHint(textView) === 'type your username here', 'Actual: ' + textViewTestsNative.getNativeHint(textView) + '; Expected: ' + 'type your username here');
		// << (hide)
		model.set('hint', 'type your password here');
		// TextView.hint is now "type your password here"
		// >> (hide)
		TKUnit.assert(textView.hint === 'type your password here', 'Actual: ' + textView.hint + '; Expected: ' + 'type your password here');
		TKUnit.assert(textViewTestsNative.getNativeHint(textView) === 'type your password here', 'Actual: ' + textViewTestsNative.getNativeHint(textView) + '; Expected: ' + 'type your password here');
		// << (hide)
		// << binding-hint-property-textview
	});
};

export var testBindHintToBindingConext = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.text = '';
		const page = <Page>views[1];

		const model = new Observable();
		model.set('hint', 'type your username here');
		page.bindingContext = model;

		const options: BindingOptions = {
			sourceProperty: 'hint',
			targetProperty: 'hint',
		};

		textView.bind(options);
		TKUnit.assert(textView.hint === 'type your username here', 'Actual: ' + textView.hint + '; Expected: ' + 'type your username here');
		TKUnit.assert(textViewTestsNative.getNativeHint(textView) === 'type your username here', 'Actual: ' + textViewTestsNative.getNativeHint(textView) + '; Expected: ' + 'type your username here');

		model.set('hint', 'type your password here');
		TKUnit.assert(textView.hint === 'type your password here', 'Actual: ' + textView.hint + '; Expected: ' + 'type your password here');
		TKUnit.assert(textViewTestsNative.getNativeHint(textView) === 'type your password here', 'Actual: ' + textViewTestsNative.getNativeHint(textView) + '; Expected: ' + 'type your password here');
	});
};

export var testHintPlusTextiOS = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		if (!textView.ios) {
			return;
		}

		let expectedValue;
		let actualValue;

		textView.hint = 'hint';
		textView.text = 'text';

		expectedValue = 'text';
		actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);

		textView.text = '';
		expectedValue = 'hint';
		actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testHintColoriOS = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		if (!textView.ios) {
			return;
		}

		textView.text = '';
		textView.color = new Color('red');
		textView.hint = 'hint';

		let expectedValue;
		let expectedNormalizedValue;
		let actualValue;

		actualValue = textViewTestsNative.getNativeColor(textView).hex;

		TKUnit.assertEqual(actualValue, '#FF000038', 'Expected hint color to be a subtle transparent red: #FF000038');

		textView.text = 'text';

		expectedValue = '#FF0000FF'; // red
		expectedNormalizedValue = '#FF0000';
		actualValue = textViewTestsNative.getNativeColor(textView).hex;
		TKUnit.assert(actualValue === expectedNormalizedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedNormalizedValue);
	});
};

export var testSetEditable = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		// >> setting-editable-property
		textView.editable = false;
		// << setting-editable-property

		const expectedValue = false;
		const actualValue = textViewTestsNative.getNativeEditable(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindEditableDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		// >> binding-editable-property
		const model = new Observable();
		model.set('editable', false);
		const options: BindingOptions = {
			sourceProperty: 'editable',
			targetProperty: 'editable',
		};
		textView.bind(options, model);
		// textView.editable is now false
		// >> (hide)
		TKUnit.assertFalse(textView.editable, '.ediable property should be false');
		TKUnit.assertFalse(textViewTestsNative.getNativeEditable(textView), 'native Editable should be false');
		// << (hide)
		model.set('editable', true);
		// textView.editable is now true
		// >> (hide)
		TKUnit.assertTrue(textView.editable, '.ediable property should be true');
		TKUnit.assertTrue(textViewTestsNative.getNativeEditable(textView), 'native Editable should be true');
		// << (hide)
		// << binding-editable-property
	});
};

export var testBindEditableToBindingConext = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];

		const model = new Observable();
		model.set('editable', false);
		page.bindingContext = model;

		const options: BindingOptions = {
			sourceProperty: 'editable',
			targetProperty: 'editable',
		};

		textView.bind(options);
		TKUnit.assertFalse(textView.editable, '.ediable property should be false');
		TKUnit.assertFalse(textViewTestsNative.getNativeEditable(textView), 'native Editable should be false');

		model.set('editable', true);
		TKUnit.assertTrue(textView.editable, '.ediable property should be true');
		TKUnit.assertTrue(textViewTestsNative.getNativeEditable(textView), 'native Editable should be true');
	});
};

export var testSetMaxLines = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];

		textView.maxLines = 3;

		const expectedValue = 3;
		const actualValue = textViewTestsNative.getNativeMaxLines(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

const expectedFontSize = 42;
export var testLocalFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];

		page.css = 'textview { font-size: ' + expectedFontSize + '; }';
		const actualResult = textView.style.fontSize;
		TKUnit.assert(actualResult === expectedFontSize, 'Actual: ' + actualResult + '; Expected: ' + expectedFontSize);
	});
};

export var testNativeFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { font-size: ' + expectedFontSize + '; }';

		const actualResult = textViewTestsNative.getNativeFontSize(textView);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromCss');
	});
};

export var testNativeFontSizeFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.style.fontSize = expectedFontSize;

		const actualResult = textViewTestsNative.getNativeFontSize(textView);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromLocal');
	});
};

const expectedLineHeight = 10;
export var testLocalLineHeightFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];

		page.css = 'textview { line-height: ' + expectedLineHeight + '; }';
		const actualResult = textView.style.lineHeight;
		TKUnit.assert(actualResult === expectedLineHeight, 'Actual: ' + actualResult + '; Expected: ' + expectedLineHeight);
	});
};

const expectedColorHex = '#FF0000FF';
const expectedNormalizedColorHex = '#FF0000';
export var testLocalColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { color: ' + expectedColorHex + '; }';

		const actualResult = textView.style.color.hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { color: ' + expectedColorHex + '; }';

		const actualResult = textViewTestsNative.getNativeColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.style.color = new Color(expectedColorHex);

		const actualResult = textViewTestsNative.getNativeColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

const expectedBackgroundColorHex = '#00FF00FF';
const expectedNormalizedBackgroundColorHex = '#00FF00';
export var testLocalBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { background-color: ' + expectedBackgroundColorHex + '; }';

		const actualResult = textView.style.backgroundColor.hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { background-color: ' + expectedBackgroundColorHex + '; }';

		helper.waitUntilLayoutReady(textView);

		const actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const textView = <TextView>views[0];
		textView.style.backgroundColor = new Color(expectedBackgroundColorHex);

		helper.waitUntilLayoutReady(textView);

		const actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

const expectedTextAlignment: 'right' = 'right';
export var testLocalTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const view = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { text-align: ' + expectedTextAlignment + '; }';

		const actualResult = view.style.textAlignment;
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const view = <TextView>views[0];
		const page = <Page>views[1];
		page.css = 'textview { text-align: ' + expectedTextAlignment + '; }';

		const actualResult = textViewTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		const view = <TextView>views[0];
		view.style.textAlignment = expectedTextAlignment;

		const actualResult = textViewTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

// export var testMemoryLeak = function (done) {
// 	helper.buildUIWithWeakRefAndInteract(
// 		_createTextViewFunc,
// 		function (textView) {
// 			textViewTestsNative.typeTextNatively(textView, 'Hello, world!');
// 		},
// 		done
// 	);
// };

export function test_watch_listerer_is_removed_at_onDetach() {
	if (__ANDROID__) {
		helper.buildUIAndRunTest(_createTextViewFunc(), (views: Array<View>) => {
			const tv = <TextView>views[0];
			const page = <Page>tv.page;
			const editText = tv.android;
			editText.setText('String');
			page.content = null;
			editText.setText('FAIL');
		});
	}
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
	const view = new TextView();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.text = 'NormalText';
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, CoreTypes.TextTransform.uppercase, 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, CoreTypes.TextDecoration.underline, 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
	const view = new TextView();
	const formattedString = helper._generateFormattedString();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.formattedText = formattedString;
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, CoreTypes.TextTransform.uppercase, 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, CoreTypes.TextDecoration.underline, 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}
