import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View, isIOS, StackLayout, Page, Color, Span, FormattedString } from '@nativescript/core';
import { getNativeText, getNativeHint, typeTextNatively, typeTextNativelyWithReturn, getNativeSecure, getNativeFontSize, getNativeColor, getNativeBackgroundColor, getNativeTextAlignment, getNativePlaceholderColor, getNativeFocus } from './text-field-tests-native';

// >> require-textfield
import { TextField } from '@nativescript/core/ui/text-field';
// << require-textfield
// Other frequently used modules when working with buttons include:
// >> require-observable-binding-options-textfield
import { BindingOptions } from '@nativescript/core/ui/core/bindable';

import { Observable } from '@nativescript/core/data/observable';
// << require-observable-binding-options-textfield

// ### Binding two TextFields text property to observable view-model property.
// >> binding-text-property-textfield
function pageLoaded(args) {
	var page = args.object;
	var obj = new Observable();
	obj.set('someProperty', 'Please change this text!');
	page.bindingContext = obj;
}
exports.pageLoaded = pageLoaded;
// << binding-text-property-textfield

export function test_recycling() {
	helper.nativeView_recycling_test(_createTextFieldFunc);
}

var _createTextFieldFunc = function (): TextField {
	// >> creating-textfield
	var textField = new TextField();
	// << creating-textfield
	textField.text = 'textField';

	return textField;
};

export var testSetText = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> setting-text-property
		textField.text = 'Hello, world!';
		// << setting-text-property

		var expectedValue = 'Hello, world!';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextNull = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.text = null;

		var expectedValue = '';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextUndefined = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.text = undefined;

		var expectedValue = '';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextToZero = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		(<any>textField).text = 0;

		var expectedValue = '0';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

function createFormattedString(value: any): FormattedString {
	var span = new Span();
	span.text = value;
	var result = new FormattedString();
	result.spans.push(span);

	return result;
}

export var testSetTextWithSpan = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.formattedText = createFormattedString('Hello, world!');

		var expectedValue = 'Hello, world!';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextNullWithSpan = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.formattedText = createFormattedString(null);

		var expectedValue = '';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextUndefinedWithSpan = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.formattedText = createFormattedString(undefined);

		var expectedValue = '';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

export var testSetTextToZeroWithSpan = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.formattedText = createFormattedString(0);

		var expectedValue = '0';
		var actualValue = getNativeText(textField);
		TKUnit.assertEqual(actualValue, expectedValue, 'TextField native text');
	});
};

/* tslint:disable */
export var testSetHintToNumber = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var expectedValue = 1;

		// >> setting-hint-property
		textField.hint = <any>expectedValue;
		// << setting-hint-property

		var actualValue = getNativeHint(textField);
		TKUnit.assert(<any>actualValue == expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};
/* tslint:enable */
export var testBindTextDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> binding-text-property-second
		var model = new Observable();
		model.set('username', 'john');
		var options: BindingOptions = {
			sourceProperty: 'username',
			targetProperty: 'text',
		};
		textField.bind(options, model);
		// textField.text is now "john"
		// >> (hide)
		TKUnit.assert(textField.text === 'john', 'Actual: ' + textField.text + '; Expected: ' + 'john');
		TKUnit.assert(getNativeText(textField) === 'john', 'Actual: ' + getNativeText(textField) + '; Expected: ' + 'john');
		// << (hide)
		model.set('username', 'mary');
		// textField.text is now "mary"
		// >> (hide)
		TKUnit.assert(textField.text === 'mary', 'Actual: ' + textField.text + '; Expected: ' + 'mary');
		TKUnit.assert(getNativeText(textField) === 'mary', 'Actual: ' + getNativeText(textField) + '; Expected: ' + 'mary');
		// << (hide)
		// << binding-text-property-second
	});
};

// Supported for ios only.
if (isIOS) {
	exports.test_set_color = function () {
		helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
			var textField = <TextField>views[0];
			textField.color = new Color('red');
			TKUnit.assert(textField.color.ios.CGColor.isEqual(textField.ios.textColor.CGColor), 'textField.color');
		});
	};
}

export var testBindTextToBindingContext = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('username', 'john');
		page.bindingContext = model;

		var options: BindingOptions = {
			sourceProperty: 'username',
			targetProperty: 'text',
		};

		textField.bind(options);
		TKUnit.assert(textField.text === 'john', 'Actual: ' + textField.text + '; Expected: ' + 'john');
		TKUnit.assert(getNativeText(textField) === 'john', 'Actual: ' + getNativeText(textField) + '; Expected: ' + 'john');

		model.set('username', 'mary');
		TKUnit.assert(textField.text === 'mary', 'Actual: ' + textField.text + '; Expected: ' + 'mary');
		TKUnit.assert(getNativeText(textField) === 'mary', 'Actual: ' + getNativeText(textField) + '; Expected: ' + 'mary');
	});
};

export var testTextIsUpdatedWhenUserTypes = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		textField.updateTextTrigger = 'focusLost';

		var expectedValue = 'Hello, world!';
		typeTextNatively(textField, expectedValue);

		var actualValue = textField.text;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetHint = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> setting-hint-text
		textField.hint = 'type your username here';
		// << setting-hint-text

		var expectedValue = 'type your username here';
		var actualValue = getNativeHint(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindHintDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> binding-hint-property-textfield
		var model = new Observable();
		model.set('hint', 'type your username here');
		var options: BindingOptions = {
			sourceProperty: 'hint',
			targetProperty: 'hint',
		};
		textField.bind(options, model);
		// textField.hint is now "type your username here"
		// >> (hide)
		TKUnit.assert(textField.hint === 'type your username here', 'Actual: ' + textField.text + '; Expected: ' + 'type your username here');
		TKUnit.assert(getNativeHint(textField) === 'type your username here', 'Actual: ' + getNativeHint(textField) + '; Expected: ' + 'type your username here');
		// << (hide)
		model.set('hint', 'type your password here');
		// textField.hint is now "type your password here"
		// >> (hide)
		TKUnit.assert(textField.hint === 'type your password here', 'Actual: ' + textField.text + '; Expected: ' + 'type your password here');
		TKUnit.assert(getNativeHint(textField) === 'type your password here', 'Actual: ' + getNativeHint(textField) + '; Expected: ' + 'type your password here');
		// << (hide)
		// << binding-hint-property-textfield
	});
};

export var testBindHintToBindingConext = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('hint', 'type your username here');
		page.bindingContext = model;

		var options: BindingOptions = {
			sourceProperty: 'hint',
			targetProperty: 'hint',
		};

		textField.bind(options);
		TKUnit.assert(textField.hint === 'type your username here', 'Actual: ' + textField.hint + '; Expected: ' + 'type your username here');
		TKUnit.assert(getNativeHint(textField) === 'type your username here', 'Actual: ' + getNativeHint(textField) + '; Expected: ' + 'type your username here');

		model.set('hint', 'type your password here');
		TKUnit.assert(textField.hint === 'type your password here', 'Actual: ' + textField.text + '; Expected: ' + 'type your password here');
		TKUnit.assert(getNativeHint(textField) === 'type your password here', 'Actual: ' + getNativeHint(textField) + '; Expected: ' + 'type your password here');
	});
};

export var testSetSecure = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> setting-secure-property
		textField.secure = true;
		// << setting-secure-property

		var expectedValue = true;
		var actualValue = getNativeSecure(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetSecureAndKeyboardTypeNumber = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.secure = true;
		textField.keyboardType = 'number';

		var expectedValue = true;
		var actualValue = getNativeSecure(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSetKeyboardTypeNumberAndSecure = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		textField.keyboardType = 'number';
		textField.secure = true;

		var expectedValue = true;
		var actualValue = getNativeSecure(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testBindSecureDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];

		// >> binding-secure-property
		var model = new Observable();
		model.set('secure', true);
		var options: BindingOptions = {
			sourceProperty: 'secure',
			targetProperty: 'secure',
		};
		textField.bind(options, model);
		// textField.secure is now true
		// >> (hide)
		TKUnit.assert(textField.secure === true, 'Actual: ' + textField.secure + '; Expected: ' + true);
		TKUnit.assert(getNativeSecure(textField) === true, 'Actual: ' + getNativeSecure(textField) + '; Expected: ' + true);
		// << (hide)
		model.set('secure', false);
		// textField.secure is now false
		// >> (hide)
		TKUnit.assert(textField.secure === false, 'Actual: ' + textField.secure + '; Expected: ' + false);
		TKUnit.assert(getNativeSecure(textField) === false, 'Actual: ' + getNativeSecure(textField) + '; Expected: ' + false);
		// << (hide)
		// << binding-secure-property
	});
};

export var testBindSecureToBindingConext = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('secure', true);
		page.bindingContext = model;

		var options: BindingOptions = {
			sourceProperty: 'secure',
			targetProperty: 'secure',
		};

		textField.bind(options);
		TKUnit.assert(textField.secure === true, 'Actual: ' + textField.secure + '; Expected: ' + true);
		TKUnit.assert(getNativeSecure(textField) === true, 'Actual: ' + getNativeSecure(textField) + '; Expected: ' + true);

		model.set('secure', false);
		TKUnit.assert(textField.secure === false, 'Actual: ' + textField.secure + '; Expected: ' + false);
		TKUnit.assert(getNativeSecure(textField) === false, 'Actual: ' + getNativeSecure(textField) + '; Expected: ' + false);
	});
};

// iOS only
export var testBindCloseOnReturnToBindingConext = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		if (!isIOS) {
			TKUnit.assert(true === true);

			return;
		}
		var textField = <TextField>views[0];
		var page = <Page>views[1];

		var model = new Observable();
		model.set('closeOnReturn', false);
		page.bindingContext = model;

		var options: BindingOptions = {
			sourceProperty: 'closeOnReturn',
			targetProperty: 'closeOnReturn',
		};

		textField.bind(options);
		TKUnit.assert(textField.closeOnReturn === false, 'Actual: ' + textField.closeOnReturn + '; Expected: ' + false);
		typeTextNativelyWithReturn(textField, 'Should not close textfield');
		TKUnit.assert(getNativeFocus(textField) === true, 'Actual: ' + getNativeFocus(textField) + '; Expected: ' + true);

		model.set('closeOnReturn', true);
		TKUnit.assert(textField.closeOnReturn === true, 'Actual: ' + textField.closeOnReturn + '; Expected: ' + true);
		typeTextNativelyWithReturn(textField, 'Should close textfield');
		TKUnit.assert(getNativeFocus(textField) === false, 'Actual: ' + getNativeFocus(textField) + '; Expected: ' + false);
	});
};

// iOS only
export var testDontCloseOnReturn = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		if (!isIOS) {
			TKUnit.assert(true === true);

			return;
		}
		var textField = <TextField>views[0];

		// >> setting-closeOnReturn-property
		textField.closeOnReturn = false;
		// << setting-closeOnReturn-property

		typeTextNativelyWithReturn(textField, 'Should not close textfield');

		var expectedValue = true;
		var actualValue = getNativeFocus(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

// iOS only
export var testCloseOnReturn = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		if (!isIOS) {
			TKUnit.assert(true === true);

			return;
		}
		var textField = <TextField>views[0];
		textField.closeOnReturn = true;

		typeTextNativelyWithReturn(textField, 'Should close textfield');

		var expectedValue = false;
		var actualValue = getNativeFocus(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

// iOS only
export var testCloseOnReturnByDefault = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		if (!isIOS) {
			TKUnit.assert(true === true);

			return;
		}
		var textField = <TextField>views[0];

		typeTextNativelyWithReturn(textField, 'Should close textfield by default');

		var expectedValue = false;
		var actualValue = getNativeFocus(textField);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

var expectedFontSize = 42;
export var testLocalFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];

		page.css = 'textfield { font-size: ' + expectedFontSize + '; }';
		var actualResult = textField.style.fontSize;
		TKUnit.assert(actualResult === expectedFontSize, 'Actual: ' + actualResult + '; Expected: ' + expectedFontSize);
	});
};

export var testNativeFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { font-size: ' + expectedFontSize + '; }';

		var actualResult = getNativeFontSize(textField);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromCss');
	});
};

export var testNativeFontSizeFromLocal = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		textField.style.fontSize = expectedFontSize;

		var actualResult = getNativeFontSize(textField);
		helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromLocal');
	});
};

var expectedColorHex = '#FFFF0000';
var expectedNormalizedColorHex = '#FF0000';
export var testLocalColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { color: ' + expectedColorHex + '; }';

		var actualResult = textField.style.color.hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { color: ' + expectedColorHex + '; }';

		var actualResult = getNativeColor(textField).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

export var testNativeColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		textField.style.color = new Color(expectedColorHex);

		var actualResult = getNativeColor(textField).hex;
		TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
	});
};

var expectedBackgroundColorHex = '#FF00FF00';
var expectedNormalizedBackgroundColorHex = '#00FF00';
export var testLocalBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { background-color: ' + expectedBackgroundColorHex + '; }';

		var actualResult = textField.style.backgroundColor.hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { background-color: ' + expectedBackgroundColorHex + '; }';

		helper.waitUntilLayoutReady(textField);

		var actualResult = getNativeBackgroundColor(textField).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

export var testNativeBackgroundColorFromLocal = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var textField = <TextField>views[0];
		textField.style.backgroundColor = new Color(expectedBackgroundColorHex);

		helper.waitUntilLayoutReady(textField);

		var actualResult = getNativeBackgroundColor(textField).hex;
		TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
	});
};

var expectedTextAlignment: 'right' = 'right';
export var testLocalTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var view = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = view.style.textAlignment;
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var view = <TextField>views[0];
		var page = <Page>views[1];
		page.css = 'textfield { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromLocal = function () {
	helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<View>) {
		var view = <TextField>views[0];
		view.style.textAlignment = expectedTextAlignment;

		var actualResult = getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testMemoryLeak = function (done) {
	helper.buildUIWithWeakRefAndInteract(
		_createTextFieldFunc,
		function (textField) {
			typeTextNatively(textField, 'Hello, world!');
		},
		done
	);
};

export var test_WhenFormattedTextPropertyChanges_TextIsUpdated_TextBase = function () {
	var firstSpan = new Span();
	firstSpan.fontSize = 10;
	firstSpan.text = 'First';
	var secondSpan = new Span();
	secondSpan.fontSize = 15;
	secondSpan.text = 'Second';
	var thirdSpan = new Span();
	thirdSpan.fontSize = 20;
	thirdSpan.text = 'Third';
	var formattedString1 = new FormattedString();
	formattedString1.spans.push(firstSpan);
	var formattedString2 = new FormattedString();
	formattedString2.spans.push(secondSpan);
	formattedString2.spans.push(thirdSpan);

	var view = new TextField();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		TKUnit.assertEqual(view.text, '');

		view.formattedText = formattedString1;
		TKUnit.assertEqual(view.text, 'First');

		view.formattedText = formattedString2;
		TKUnit.assertEqual(view.text, 'SecondThird');

		formattedString2.spans.getItem(0).text = 'Mecond';
		TKUnit.assertEqual(view.text, 'MecondThird');

		view.formattedText = null;
		TKUnit.assertEqual(view.text, '');
	});
};

export function test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
	const view = new TextField();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		TKUnit.assertEqual(view.text, '', 'Text');
		TKUnit.assertEqual(view.style.textTransform, 'initial', 'TextTransform default value');
		TKUnit.assertEqual(view.style.textDecoration, 'none', 'TextDecoration default value');
		TKUnit.assertTrue(view.style.letterSpacing === 0, 'LetterSpacing default value');

		view.text = 'NormalText';
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, 'uppercase', 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, 'underline', 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
	const view = new TextField();
	const formattedString = helper._generateFormattedString();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.formattedText = formattedString;
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, 'uppercase', 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, 'underline', 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_set_placeholder_color() {
	const view = new TextField();
	const expectedColorHex = '#FFFF0000';
	const expectedNormalizedColorHex = '#FF0000';
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.hint = 'Some text for hint';
		view.setInlineStyle('placeholder-color: ' + expectedColorHex + ';');
		const actualColorHex = getNativePlaceholderColor(view).hex;
		TKUnit.assertEqual(actualColorHex, expectedNormalizedColorHex);
	});
}

export function test_set_placeholder_color_when_hint_is_not_set() {
	const view = new TextField();
	const expectedColorHex = '#FFFF0000';
	const expectedNormalizedColorHex = '#FF0000';
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.setInlineStyle('placeholder-color: ' + expectedColorHex + ';');
		const actualColorHex = getNativePlaceholderColor(view).hex;
		TKUnit.assertEqual(actualColorHex, expectedNormalizedColorHex);
	});
}

export function test_android_ime_actions_move_focus() {
	if (isIOS) {
		return;
	}

	const stack = new StackLayout();
	const addTextField = () => {
		const tf = new TextField();
		(<any>tf).returnPress = 0;
		tf.on('returnPress', (args) => (<any>args.object).returnPress++);
		stack.addChild(tf);
	};

	addTextField();
	addTextField();
	addTextField();

	const assert = (index, count) => {
		const view: any = stack.getChildAt(index);
		TKUnit.assertEqual(view.returnPress, count, `TextField at ${index}, has incorrect returnPress.`);
	};
	helper.buildUIAndRunTest(stack, (views: Array<View>) => {
		(stack.getChildAt(0) as TextField).focus();

		let edittext = stack._context.getCurrentFocus();
		TKUnit.assertNotNull(edittext, 'TextField not focused.');

		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_NEXT);
		assert(0, 1);
		assert(1, 0);
		assert(2, 0);

		edittext = stack._context.getCurrentFocus();
		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_NEXT);
		assert(0, 1);
		assert(1, 1);
		assert(2, 0);

		edittext = stack._context.getCurrentFocus();
		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_NEXT);
		assert(0, 1);
		assert(1, 1);
		assert(2, 1);

		edittext = stack._context.getCurrentFocus();
		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_PREVIOUS);
		assert(0, 2);
		assert(1, 1);
		assert(2, 1);

		edittext = stack._context.getCurrentFocus();
		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_PREVIOUS);
		assert(0, 2);
		assert(1, 1);
		assert(2, 2);

		edittext = stack._context.getCurrentFocus();
		edittext.onEditorAction(android.view.inputmethod.EditorInfo.IME_ACTION_PREVIOUS);
		assert(0, 2);
		assert(1, 2);
		assert(2, 2);
	});
}
