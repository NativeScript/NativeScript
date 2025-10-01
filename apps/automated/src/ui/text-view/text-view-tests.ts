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
	let page = args.object;
	let obj = new Observable();
	obj.set('someProperty', 'Please change this text!');
	page.bindingContext = obj;
}
// << observable-declare

export function test_recycling() {
	helper.nativeView_recycling_test(_createTextViewFunc);
}

var _createTextViewFunc = function (): TextView {
	// >> text-view-create
	var textView = new TextView();
	// << text-view-create
	textView.text = 'textView';

	return textView;
};

export var testSetText = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];

		// >> set-text-value
		textView.text = 'Hello, world!';
		// << set-text-value

		var expectedValue = 'Hello, world!';
		var actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetTextNull = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];

		textView.text = null;

		var expectedValue = '';
		var actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetTextUndefined = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];

		textView.text = undefined;

		var expectedValue = '';
		var actualValue = textViewTestsNative.getNativeText(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

// Supported for ios only.

export function test_set_color() {
	if (__APPLE__) {
		helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
			var textView = <TextView>views[0];
			textView.color = new Color('red');
			TKUnit.assertEqual(textView.color.ios.CGColor, textView.ios.textColor.CGColor, 'textView.color');
		});
	}
}

export var testBindTextDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];

		// >> binding-text-property-textview
		var model = new Observable();
		model.set('username', 'john');
		var options: BindingOptions = {
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
		var textView = <TextView>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('username', 'john');
		page.bindingContext = model;

		var options: BindingOptions = {
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
		var textView = <TextView>views[0];
		textView.updateTextTrigger = 'focusLost';

		var expectedValue = 'Hello, world!';
		textViewTestsNative.typeTextNatively(textView, expectedValue);

		var actualValue = textView.text;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetHint = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		textView.text = '';

		// >> set-textview-hint
		textView.hint = 'type your username here';
		// << set-textview-hint

		var expectedValue = 'type your username here';
		var actualValue = textViewTestsNative.getNativeHint(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindHintDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		textView.text = '';

		// >> binding-hint-property-textview
		var model = new Observable();
		model.set('hint', 'type your username here');
		var options: BindingOptions = {
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
		var textView = <TextView>views[0];
		textView.text = '';
		var page = <Page>views[1];

		var model = new Observable();
		model.set('hint', 'type your username here');
		page.bindingContext = model;

		var options: BindingOptions = {
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
		var textView = <TextView>views[0];
		if (!textView.ios) {
			return;
		}

		var expectedValue;
		var actualValue;

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
		var textView = <TextView>views[0];
		if (!textView.ios) {
			return;
		}

		textView.text = '';
		textView.color = new Color('red');
		textView.hint = 'hint';

		var expectedValue;
		var expectedNormalizedValue;
		var actualValue;

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
		var textView = <TextView>views[0];

		// >> setting-editable-property
		textView.editable = false;
		// << setting-editable-property

		var expectedValue = false;
		var actualValue = textViewTestsNative.getNativeEditable(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindEditableDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];

		// >> binding-editable-property
		var model = new Observable();
		model.set('editable', false);
		var options: BindingOptions = {
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
		var textView = <TextView>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('editable', false);
		page.bindingContext = model;

		var options: BindingOptions = {
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
		var textView = <TextView>views[0];

		textView.maxLines = 3;

		var expectedValue = 3;
		var actualValue = textViewTestsNative.getNativeMaxLines(textView);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

var expectedFontSize = 42;
export var testLocalFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];

		page.css = 'textview { font-size: ' + expectedFontSize + '; }';
		var actualResult = textView.style.fontSize;
		TKUnit.assert(actualResult === expectedFontSize, 'Actual: ' + actualResult + '; Expected: ' + expectedFontSize);
	});
};

export var testNativeFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { font-size: ' + expectedFontSize + '; }';

		var actualResult = textViewTestsNative.getNativeFontSize(textView);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromCss');
	});
};

export var testNativeFontSizeFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		textView.style.fontSize = expectedFontSize;

		var actualResult = textViewTestsNative.getNativeFontSize(textView);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromLocal');
	});
};

var expectedLineHeight = 10;
export var testLocalLineHeightFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];

		page.css = 'textview { line-height: ' + expectedLineHeight + '; }';
		var actualResult = textView.style.lineHeight;
		TKUnit.assert(actualResult === expectedLineHeight, 'Actual: ' + actualResult + '; Expected: ' + expectedLineHeight);
	});
};

var expectedColorHex = '#FF0000FF';
var expectedNormalizedColorHex = '#FF0000';
export var testLocalColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { color: ' + expectedColorHex + '; }';

		var actualResult = textView.style.color.hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { color: ' + expectedColorHex + '; }';

		var actualResult = textViewTestsNative.getNativeColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		textView.style.color = new Color(expectedColorHex);

		var actualResult = textViewTestsNative.getNativeColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

var expectedBackgroundColorHex = '#00FF00FF';
var expectedNormalizedBackgroundColorHex = '#00FF00';
export var testLocalBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { background-color: ' + expectedBackgroundColorHex + '; }';

		var actualResult = textView.style.backgroundColor.hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { background-color: ' + expectedBackgroundColorHex + '; }';

		helper.waitUntilLayoutReady(textView);

		var actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var textView = <TextView>views[0];
		textView.style.backgroundColor = new Color(expectedBackgroundColorHex);

		helper.waitUntilLayoutReady(textView);

		var actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

var expectedTextAlignment: 'right' = 'right';
export var testLocalTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var view = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = view.style.textAlignment;
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var view = <TextView>views[0];
		var page = <Page>views[1];
		page.css = 'textview { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = textViewTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromLocal = function () {
	helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<View>) {
		var view = <TextView>views[0];
		view.style.textAlignment = expectedTextAlignment;

		var actualResult = textViewTestsNative.getNativeTextAlignment(view);
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
			let tv = <TextView>views[0];
			let page = <Page>tv.page;
			let editText = tv.android;
			editText.setText('String');
			page.content = null;
			editText.setText('FAIL');
		});
	}
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
	let view = new TextView();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.text = 'NormalText';
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, CoreTypes.TextTransform.uppercase, 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, CoreTypes.TextDecoration.underline, 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
	let view = new TextView();
	let formattedString = helper._generateFormattedString();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.formattedText = formattedString;
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, CoreTypes.TextTransform.uppercase, 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, CoreTypes.TextDecoration.underline, 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}
