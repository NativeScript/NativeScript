import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View, EventData, Button, Observable, Color, Page, FormattedString } from '@nativescript/core';
import * as buttonTestsNative from './button-tests-native';
import * as spanModule from '@nativescript/core/text/span';

// >> button-require-others
import { BindingOptions } from '@nativescript/core/ui/core/bindable';
// << button-require-others

export function test_recycling() {
	helper.nativeView_recycling_test(() => new Button());
}

export var testSetText = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testSetText);
};

export var testOnClick = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testOnClick);
};

export var testBindTextDirectlyToModel = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testBindTextDirectlyToModel);
};

export var testBindTextToBindingContext = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testBindTextToBindingContext);
};

export var testLocalFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testLocalFontSizeFromCss);
};

export var testNativeFontSizeFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeFontSizeFromCss);
};

export var testNativeFontSizeFromLocal = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeFontSizeFromLocal);
};

export var testLocalColorFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testLocalColorFromCss);
};

export var testNativeColorFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeColorFromCss);
};

export var testNativeColorFromLocal = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeColorFromLocal);
};

export var testLocalBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testLocalBackgroundColorFromCss);
};

export var testNativeBackgroundColorFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeBackgroundColorFromCss);
};

export var testNativeBackgroundColorFromLocal = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testNativeBackgroundColorFromLocal);
};

export var testMemoryLeak = function (done) {
	helper.buildUIWithWeakRefAndInteract(
		_createButtonFunc,
		function (button) {
			buttonTestsNative.performNativeClick(button);
		},
		done
	);
};

var _createButtonFunc = function (): Button {
	// >>button-create
	var button = new Button();
	// << button-create
	button.text = 'Button';

	return button;
};

var _testSetText = function (views: Array<View>) {
	var button = <Button>views[0];
	// >> button-settext
	button.text = 'Hello, world!';
	// << button-settext

	var expectedValue = button.text;
	var actualValue = buttonTestsNative.getNativeText(button);

	TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
};

var _testOnClick = function (views: Array<View>) {
	var button = <Button>views[0];

	var actualValue = false;
	// >> button-tap
	button.on(Button.tapEvent, function (args: EventData) {
		// Do something
		// >> (hide)
		actualValue = true;
		// << (hide)
	});
	// << button-tap

	buttonTestsNative.performNativeClick(button);
	TKUnit.assertTrue(actualValue, 'Actual: ' + actualValue + '; Expected: ' + true);
};

var _testBindTextDirectlyToModel = function (views: Array<View>) {
	var button = <Button>views[0];

	// >> button-bind
	var model = new Observable();
	model.set('buttonTitle', 'OK');
	var options: BindingOptions = {
		sourceProperty: 'buttonTitle',
		targetProperty: 'text',
	};
	button.bind(options, model);
	// button.text is now "OK"
	// >> (hide)
	TKUnit.assert(button.text === 'OK', 'Actual: ' + button.text + '; Expected: ' + 'OK');
	// << (hide)
	model.set('buttonTitle', 'Cancel');
	// button.text is now "Cancel"
	// >> (hide)
	TKUnit.assert(button.text === 'Cancel', 'Actual: ' + button.text + '; Expected: ' + 'Cancel');
	// << (hide)
	// << button-bind
};

var _testBindTextToBindingContext = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];

	var model = new Observable();
	model.set('buttonTitle', 'OK');
	page.bindingContext = model;

	var options: BindingOptions = {
		sourceProperty: 'buttonTitle',
		targetProperty: 'text',
	};
	button.bind(options);

	TKUnit.assert(button.text === 'OK', 'Actual: ' + button.text + '; Expected: ' + 'OK');
	model.set('buttonTitle', 'Cancel');
	TKUnit.assert(button.text === 'Cancel', 'Actual: ' + button.text + '; Expected: ' + 'Cancel');
};

var expectedFontSize = 42;
var _testLocalFontSizeFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];

	page.css = 'button { font-size: ' + expectedFontSize + '; }';
	var actualResult = button.style.fontSize;
	TKUnit.assert(actualResult === expectedFontSize, 'Actual: ' + actualResult + '; Expected: ' + 33);
};

var _testNativeFontSizeFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];
	page.css = 'button { font-size: ' + expectedFontSize + '; }';

	var actualResult = buttonTestsNative.getNativeFontSize(button);
	helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromCss');
};

var _testNativeFontSizeFromLocal = function (views: Array<View>) {
	var button = <Button>views[0];
	button.style.fontSize = expectedFontSize;

	var actualResult = buttonTestsNative.getNativeFontSize(button);
	helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromLocal');
};

var actualColorHex = '#ffff0000';
var expectedNormalizedColorHex = '#FF0000';
var _testLocalColorFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];
	page.css = 'button { color: ' + actualColorHex + '; }';

	var actualResult = button.style.color.hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

var _testNativeColorFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];
	page.css = 'button { color: ' + actualColorHex + '; }';

	var actualResult = buttonTestsNative.getNativeColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

var _testNativeColorFromLocal = function (views: Array<View>) {
	var button = <Button>views[0];
	button.style.color = new Color(actualColorHex);

	var actualResult = buttonTestsNative.getNativeColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

var actualBackgroundColorHex = '#FF00FF00';
var expectedNormalizedBackgroundColorHex = '#00FF00';
var _testLocalBackgroundColorFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];
	page.css = 'button { background-color: ' + actualBackgroundColorHex + '; }';

	var actualResult = button.style.backgroundColor.hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

var _testNativeBackgroundColorFromCss = function (views: Array<View>) {
	var button = <Button>views[0];
	var page = <Page>views[1];
	page.css = 'button { background-color: ' + actualBackgroundColorHex + '; }';

	helper.waitUntilLayoutReady(button);

	var actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

var _testNativeBackgroundColorFromLocal = function (views: Array<View>) {
	var button = <Button>views[0];
	button.style.backgroundColor = new Color(actualBackgroundColorHex);

	helper.waitUntilLayoutReady(button);

	var actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

var expectedTextAlignment: 'right' = 'right';
export var testLocalTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		var page = <Page>views[1];
		page.css = 'button { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = view.style.textAlignment;
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		var page = <Page>views[1];
		page.css = 'button { text-align: ' + expectedTextAlignment + '; }';

		var actualResult = buttonTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var test_StateHighlighted_also_fires_pressedState = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		var page = <Page>views[1];
		var expectedColor = '#FFFF0000';
		var expectedNormalizedColor = '#FF0000';
		page.css = 'button:pressed { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view._goToVisualState('highlighted');

		var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var test_StateHighlighted_also_fires_activeState = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		var page = <Page>views[1];
		var expectedColor = '#FFFF0000';
		var expectedNormalizedColor = '#FF0000';
		page.css = 'button:active { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view._goToVisualState('highlighted');

		var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var test_applying_disabled_visual_State_when_button_is_disable = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		var page = <Page>views[1];
		var expectedColor = '#FFFF0000';
		var expectedNormalizedColor = '#FF0000';
		page.css = 'button:disabled { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view.isEnabled = false;

		var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var testNativeTextAlignmentFromLocal = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		var view = <Button>views[0];
		view.style.textAlignment = expectedTextAlignment;

		var actualResult = buttonTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var test_WhenFormattedTextPropertyChanges_TextIsUpdated_Button = function () {
	var firstSpan = new spanModule.Span();
	firstSpan.fontSize = 10;
	firstSpan.text = 'First';
	var secondSpan = new spanModule.Span();
	secondSpan.fontSize = 15;
	secondSpan.text = 'Second';
	var thirdSpan = new spanModule.Span();
	thirdSpan.fontSize = 20;
	thirdSpan.text = 'Third';
	var formattedString1 = new FormattedString();
	formattedString1.spans.push(firstSpan);
	var formattedString2 = new FormattedString();
	formattedString2.spans.push(secondSpan);
	formattedString2.spans.push(thirdSpan);

	var view = new Button();
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
	let view = new Button();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.text = 'NormalText';
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, 'uppercase', 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, 'underline', 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
	let view = new Button();
	let formattedString = helper._generateFormattedString();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.formattedText = formattedString;
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, 'uppercase', 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, 'underline', 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

// Reported in https://github.com/NativeScript/NativeScript/issues/4109
export function test_setting_formattedText_With_UnknownFont_DoesNotCrash() {
	let btn = new Button();
	btn.style.fontFamily = '_UnknownFont';

	helper.buildUIAndRunTest(btn, function (views) {
		TKUnit.waitUntilReady(() => btn.isLayoutValid);

		let span = new spanModule.Span();
		span.text = 'Login';
		let formattedString = new FormattedString();
		formattedString.spans.push(span);
		btn.formattedText = formattedString;

		TKUnit.waitUntilReady(() => btn.isLayoutValid);
	});
}

export function test_Native_Background_Color_BorderRadius_Change() {
	let view = new Button();
	view.text = 'TEST';
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		let page = <Page>views[1];
		page.css = '.border { background-color: #00FF00; border-radius: 1; } .colorfilter { background-color: #FF0000; }';
		view.className = 'border';
		helper.waitUntilLayoutReady(view);
		TKUnit.assertEqual(buttonTestsNative.getNativeBackgroundColor(view).hex, '#00FF00');
		view.className = 'colorfilter';
		helper.waitUntilLayoutReady(view);
		TKUnit.assertEqual(buttonTestsNative.getNativeBackgroundColor(view).hex, '#FF0000');
	});
}
