import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View, EventData, Button, Observable, Color, Page, FormattedString, BindingOptions, Span, Utils } from '@nativescript/core';
import * as buttonTestsNative from './button-tests-native';

export function test_recycling() {
	helper.nativeView_recycling_test(() => new Button());
}

export var testSetText = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testSetText);
};

export var testOnClick = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), _testOnClick);
};

function collectJsAndJavaGarbage() {
	for (let i = 0; i < 3; i++) {
		Utils.GC();
		if (__ANDROID__) {
			java.lang.System.gc();
			java.lang.System.runFinalization();
		}
		TKUnit.wait(0.05);
	}
}

export function testOnClickAfterGarbageCollection() {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const button = <Button>views[0];
		let tapped = false;
		button.on(Button.tapEvent, () => (tapped = true));

		collectJsAndJavaGarbage();
		buttonTestsNative.performNativeClick(button);

		TKUnit.assertTrue(tapped, 'tap should fire after a garbage collection');
	});
}

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

// export var testMemoryLeak = function (done) {
// 	helper.buildUIWithWeakRefAndInteract(
// 		_createButtonFunc,
// 		function (button) {
// 			buttonTestsNative.performNativeClick(button);
// 		},
// 		done
// 	);
// };

var _createButtonFunc = function (): Button {
	// >>button-create
	const button = new Button();
	// << button-create
	button.text = 'Button';

	return button;
};

var _testSetText = function (views: Array<View>) {
	const button = <Button>views[0];
	// >> button-settext
	button.text = 'Hello, world!';
	// << button-settext

	const expectedValue = button.text;
	const actualValue = buttonTestsNative.getNativeText(button);

	TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
};

var _testOnClick = function (views: Array<View>) {
	const button = <Button>views[0];

	let actualValue = false;
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
	const button = <Button>views[0];

	// >> button-bind
	const model = new Observable();
	model.set('buttonTitle', 'OK');
	const options: BindingOptions = {
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
	const button = <Button>views[0];
	const page = <Page>views[1];

	const model = new Observable();
	model.set('buttonTitle', 'OK');
	page.bindingContext = model;

	const options: BindingOptions = {
		sourceProperty: 'buttonTitle',
		targetProperty: 'text',
	};
	button.bind(options);

	TKUnit.assert(button.text === 'OK', 'Actual: ' + button.text + '; Expected: ' + 'OK');
	model.set('buttonTitle', 'Cancel');
	TKUnit.assert(button.text === 'Cancel', 'Actual: ' + button.text + '; Expected: ' + 'Cancel');
};

const expectedFontSize = 42;
var _testLocalFontSizeFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];

	page.css = 'button { font-size: ' + expectedFontSize + '; }';
	const actualResult = button.style.fontSize;
	TKUnit.assert(actualResult === expectedFontSize, 'Actual: ' + actualResult + '; Expected: ' + 33);
};

var _testNativeFontSizeFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];
	page.css = 'button { font-size: ' + expectedFontSize + '; }';

	const actualResult = buttonTestsNative.getNativeFontSize(button);
	helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromCss');
};

var _testNativeFontSizeFromLocal = function (views: Array<View>) {
	const button = <Button>views[0];
	button.style.fontSize = expectedFontSize;

	const actualResult = buttonTestsNative.getNativeFontSize(button);
	helper.assertAreClose(actualResult, expectedFontSize, 'FontSizeFromLocal');
};

const actualColorHex = '#ff0000ff';
const expectedNormalizedColorHex = '#FF0000';
var _testLocalColorFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];
	page.css = 'button { color: ' + actualColorHex + '; }';

	const actualResult = button.style.color.hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

var _testNativeColorFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];
	page.css = 'button { color: ' + actualColorHex + '; }';

	const actualResult = buttonTestsNative.getNativeColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

var _testNativeColorFromLocal = function (views: Array<View>) {
	const button = <Button>views[0];
	button.style.color = new Color(actualColorHex);

	const actualResult = buttonTestsNative.getNativeColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedColorHex);
};

const actualBackgroundColorHex = '#00FF00FF';
const expectedNormalizedBackgroundColorHex = '#00FF00';
var _testLocalBackgroundColorFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];
	page.css = 'button { background-color: ' + actualBackgroundColorHex + '; }';

	const actualResult = button.style.backgroundColor.hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

var _testNativeBackgroundColorFromCss = function (views: Array<View>) {
	const button = <Button>views[0];
	const page = <Page>views[1];
	page.css = 'button { background-color: ' + actualBackgroundColorHex + '; }';

	helper.waitUntilLayoutReady(button);

	const actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

var _testNativeBackgroundColorFromLocal = function (views: Array<View>) {
	const button = <Button>views[0];
	button.style.backgroundColor = new Color(actualBackgroundColorHex);

	helper.waitUntilLayoutReady(button);

	const actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
	TKUnit.assert(actualResult === expectedNormalizedBackgroundColorHex, 'Actual: ' + actualResult + '; Expected: ' + expectedNormalizedBackgroundColorHex);
};

const expectedTextAlignment: 'right' = 'right';
export var testLocalTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		const page = <Page>views[1];
		page.css = 'button { text-align: ' + expectedTextAlignment + '; }';

		const actualResult = view.style.textAlignment;
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var testNativeTextAlignmentFromCss = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		const page = <Page>views[1];
		page.css = 'button { text-align: ' + expectedTextAlignment + '; }';

		const actualResult = buttonTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var test_StateHighlighted_also_fires_pressedState = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		const page = <Page>views[1];
		const expectedColor = '#FF0000FF';
		const expectedNormalizedColor = '#FF0000';
		page.css = 'button:pressed { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view._addVisualState('highlighted');

		const actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var test_StateHighlighted_also_fires_activeState = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		const page = <Page>views[1];
		const expectedColor = '#FF0000FF';
		const expectedNormalizedColor = '#FF0000';
		page.css = 'button:active { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view._addVisualState('highlighted');

		const actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var test_applying_disabled_visual_State_when_button_is_disable = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		const page = <Page>views[1];
		const expectedColor = '#FF0000FF';
		const expectedNormalizedColor = '#FF0000';
		page.css = 'button:disabled { background-color: ' + expectedColor + '; }';

		helper.waitUntilLayoutReady(view);

		view.isEnabled = false;

		const actualResult = buttonTestsNative.getNativeBackgroundColor(view);
		TKUnit.assert(actualResult.hex === expectedNormalizedColor, 'Actual: ' + actualResult.hex + '; Expected: ' + expectedNormalizedColor);
	});
};

export var testNativeTextAlignmentFromLocal = function () {
	helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<View>) {
		const view = <Button>views[0];
		view.style.textAlignment = expectedTextAlignment;

		const actualResult = buttonTestsNative.getNativeTextAlignment(view);
		TKUnit.assert(actualResult === expectedTextAlignment, 'Actual: ' + actualResult + '; Expected: ' + expectedTextAlignment);
	});
};

export var test_WhenFormattedTextPropertyChanges_TextIsUpdated_Button = function () {
	const firstSpan = new Span();
	firstSpan.fontSize = 10;
	firstSpan.text = 'First';
	const secondSpan = new Span();
	secondSpan.fontSize = 15;
	secondSpan.text = 'Second';
	const thirdSpan = new Span();
	thirdSpan.fontSize = 20;
	thirdSpan.text = 'Third';
	const formattedString1 = new FormattedString();
	formattedString1.spans.push(firstSpan);
	const formattedString2 = new FormattedString();
	formattedString2.spans.push(secondSpan);
	formattedString2.spans.push(thirdSpan);

	const view = new Button();
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
	const view = new Button();
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		view.text = 'NormalText';
		view.setInlineStyle('text-transform: uppercase; text-decoration: underline; letter-spacing: 1;');

		TKUnit.assertEqual(view.style.textTransform, 'uppercase', 'TextTransform');
		TKUnit.assertEqual(view.style.textDecoration, 'underline', 'TextDecoration');
		TKUnit.assertEqual(view.style.letterSpacing, 1, 'LetterSpacing');
	});
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
	const view = new Button();
	const formattedString = helper._generateFormattedString();
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
	const btn = new Button();
	btn.style.fontFamily = '_UnknownFont';

	helper.buildUIAndRunTest(btn, function (views) {
		TKUnit.waitUntilReady(() => btn.isLayoutValid);

		const span = new Span();
		span.text = 'Login';
		const formattedString = new FormattedString();
		formattedString.spans.push(span);
		btn.formattedText = formattedString;

		TKUnit.waitUntilReady(() => btn.isLayoutValid);
	});
}

/**
 * todo: fix className change
 * bug: className change does not update background color
 *
 * if we add className = '' before changing it, then it works properly.
 */
export function test_Native_Background_Color_BorderRadius_Change() {
	const view = new Button();
	view.text = 'TEST';
	helper.buildUIAndRunTest(view, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = '.border { background-color: #00FF00; border-radius: 1; } .colorfilter { background-color: #FF0000; }';
		view.className = 'border';
		helper.waitUntilLayoutReady(view);
		TKUnit.assertEqual(buttonTestsNative.getNativeBackgroundColor(view).hex, '#00FF00');

		view.className = '';
		view.className = 'colorfilter';
		helper.waitUntilLayoutReady(view);
		TKUnit.assertEqual(buttonTestsNative.getNativeBackgroundColor(view).hex, '#FF0000');
	});
}
