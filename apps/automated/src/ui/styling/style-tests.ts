import * as TKUnit from '../../tk-unit';
import { Application, Button, Label, Page, StackLayout, WrapLayout, TabView, TabViewItem, View, Utils, Color, resolveFileNameFromUrl, removeTaggedAdditionalCSS, addTaggedAdditionalCSS, unsetValue, knownFolders } from '@nativescript/core';
import * as helper from '../../ui-helper';
import { _evaluateCssCalcExpression } from '@nativescript/core/ui/core/properties';

export function test_css_dataURI_is_applied_to_backgroundImageSource() {
	const stack = new StackLayout();

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = "StackLayout { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC;') }";

		const value = stack.style.backgroundInternal;

		TKUnit.assert(Utils.isDefined(value), 'Style background-image not loaded correctly from data URI.');
		TKUnit.assert(Utils.isDefined(value.image), 'Style background-image not loaded correctly from data URI.');
	});
}

export function test_css_is_applied_to_normal_properties() {
	const stack = new StackLayout();

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		const expected = 'horizontal';
		page.css = `StackLayout { orientation: ${expected}; }`;
		TKUnit.assertEqual(stack.orientation, expected);
	});
}

export function test_css_is_applied_to_special_properties() {
	const stack = new StackLayout();

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		const expected = 'test';
		page.css = `StackLayout { class: ${expected}; }`;
		TKUnit.assertEqual(stack.className, expected);
	});
}

export function test_applies_css_changes_to_application_rules_before_page_load() {
	Application.addCss('.applicationChangedLabelBefore { color: red; }');
	const label = new Label();
	label.className = 'applicationChangedLabelBefore';
	label.text = 'Red color coming from updated application rules';

	helper.buildUIAndRunTest(label, function (views: Array<View>) {
		helper.assertViewColor(label, '#FF0000');
	});
}

export function test_applies_css_changes_to_application_rules_after_page_load() {
	const label1 = new Label();
	label1.text = 'Blue color coming from updated application rules';

	helper.buildUIAndRunTest(label1, function (views: Array<View>) {
		Application.addCss('.applicationChangedLabelAfter { color: blue; }');
		label1.className = 'applicationChangedLabelAfter';
		console.log('IsLoaded: ' + label1.isLoaded);
		helper.assertViewColor(label1, '#0000FF');
	});
}

export function test_applies_css_changes_to_application_rules_after_page_load_new_views() {
	const host = new StackLayout();

	helper.buildUIAndRunTest(host, function (views: Array<View>) {
		Application.addCss('.applicationChangedLabelAfterNew { color: #00FF00; }');

		const label = new Label();
		label.className = 'applicationChangedLabelAfterNew';
		label.text = 'Blue color coming from updated application rules';
		host.addChild(label);
		helper.assertViewColor(label, '#00FF00');
	});
}

// Test for inheritance in different containers
export function test_css_is_applied_inside_StackLayout() {
	const testButton = new Button();
	testButton.text = 'Test';
	const stack = new StackLayout();
	stack.addChild(testButton);

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = 'button { color: red; }';
		helper.assertViewColor(testButton, '#FF0000');
	});
}

export function test_css_is_applied_inside_TabView() {
	const testButton = new Button();
	testButton.text = 'Test';
	const tabView = new TabView();
	let item = new TabViewItem();
	item.title = 'First tab';
	item.view = testButton;
	tabView.items = [item];

	helper.buildUIAndRunTest(tabView, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = 'button { color: red; }';
		TKUnit.waitUntilReady(() => testButton.isLoaded);
		helper.assertViewColor(testButton, '#FF0000');
	});
}

export function test_css_is_applied_inside_NestedControls() {
	const testButton = new Button();
	testButton.text = 'Test';
	const rootLayout = new StackLayout();
	const nestedLayout = new StackLayout();
	rootLayout.addChild(nestedLayout);
	nestedLayout.addChild(testButton);

	helper.buildUIAndRunTest(rootLayout, function (views: Array<View>) {
		const page = <Page>views[1];
		page.css = 'button { color: red; }';
		helper.assertViewColor(testButton, '#FF0000');
	});
}

// Basic selector tests
export function test_setting_css() {
	// >> article-setting-css-page
	const page = new Page();
	page.css = '.title { font-size: 20 }';
	// << article-setting-css-page

	TKUnit.assert(page.css === '.title { font-size: 20 }', 'CSS not set correctly.');
}

// Basic selector tests
export function test_type_selector() {
	let page = helper.getClearCurrentPage();

	page.style.color = unsetValue;

	let btn: Button;
	let label: Label;

	// >> article-using-type-selector
	page.css = 'button { background-color: red; }';

	//// Will be styled
	btn = new Button();

	//// Won't be styled
	label = new Label();
	// << article-using-type-selector

	let stack = new StackLayout();
	page.content = stack;
	stack.addChild(label);
	stack.addChild(btn);

	TKUnit.assert(btn.backgroundColor, 'backgroundColor property not applied correctly.');
	TKUnit.assertEqual((<Color>btn.backgroundColor).hex, '#FF0000', 'backgroundColor');
	TKUnit.assertNull(label.backgroundColor, 'backgroundColor should not have a value');
}

export function test_class_selector() {
	let page = helper.getClearCurrentPage();
	let btnWithClass: Button;
	let btnWithNoClass: Button;

	// >> article-using-class-selector
	page.css = '.test { color: red; }';

	//// Will be styled
	btnWithClass = new Button();
	btnWithClass.className = 'test';

	//// Won't be styled
	btnWithNoClass = new Button();
	// << article-using-class-selector

	const stack = new StackLayout();
	page.content = stack;
	stack.addChild(btnWithClass);
	stack.addChild(btnWithNoClass);

	helper.assertViewColor(btnWithClass, '#FF0000');
	TKUnit.assert(btnWithNoClass.style.color === undefined, 'Color should not have a value');
}

export function test_class_selector_with_escape_characters() {
	let page = helper.getClearCurrentPage();
	page.css = `
        .test-1 { color: red; }
        .test-1\\/2, .test-1\\:2, .\\61 f, .\\1F642 { color: blue }
    `;

	const stack = new StackLayout();
	page.content = stack;

	let btn: Button = new Button();
	stack.addChild(btn);

	//// Will be styled
	btn.className = 'test-1';
	helper.assertViewColor(btn, '#FF0000');

	btn.className = 'test-1/2';
	helper.assertViewColor(btn, '#0000FF');

	btn.className = 'test-1:2';
	helper.assertViewColor(btn, '#0000FF');

	btn.className = 'af';
	helper.assertViewColor(btn, '#0000FF');

	btn.className = '\u{1F642}';
	helper.assertViewColor(btn, '#0000FF');
}

export function test_multiple_class_selector() {
	let page = helper.getClearCurrentPage();
	let btnWithClasses: Button;

	page.css = '.style1 { color: red; } .style2 { background-color: blue; } ';

	//// Will be styled
	btnWithClasses = new Button();
	btnWithClasses.className = 'style1 style2';

	const stack = new StackLayout();
	page.content = stack;
	stack.addChild(btnWithClasses);

	helper.assertViewColor(btnWithClasses, '#FF0000');
	helper.assertViewBackgroundColor(btnWithClasses, '#0000FF');
}

export function test_class_selector_overwriting() {
	const page = helper.getClearCurrentPage();
	page.css = '.first { color: red; } .second { background-color: blue; }';

	const btnWithClass = new Button();
	const stack = new StackLayout();
	page.content = stack;
	stack.addChild(btnWithClass);

	btnWithClass.className = 'first';
	helper.assertViewColor(btnWithClass, '#FF0000');
	TKUnit.assert(btnWithClass.style.backgroundColor === undefined, ' Background color should not have a value');

	btnWithClass.className = 'second';
	TKUnit.assert(btnWithClass.style.color === undefined, 'Color should not have a value');
	helper.assertViewBackgroundColor(btnWithClass, '#0000FF');
}

export function test_id_selector() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;
	let btnWithId: Button;
	let btnWithNoId: Button;

	// >> article-using-id-selector
	page.css = '#myButton { color: red; }';

	//// Will be styled
	btnWithId = new Button();
	btnWithId.id = 'myButton';

	//// Won't be styled
	btnWithNoId = new Button();
	// << article-using-id-selector

	const stack = new StackLayout();
	page.content = stack;
	stack.addChild(btnWithId);
	stack.addChild(btnWithNoId);

	helper.assertViewColor(btnWithId, '#FF0000');
	TKUnit.assert(btnWithNoId.style.color === undefined, 'Color should not have a value');
}

// State selector tests
export function test_state_selector() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;
	let btn: Button;
	const testStack = new StackLayout();
	page.content = testStack;

	btn = new Button();
	testStack.addChild(btn);

	page.css = ':pressed { color: red; }';

	testButtonPressedStateIsRed(btn);
}

export function test_type_and_state_selector() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;
	let btn: Button;

	// >>article-using-state-selector
	page.css = 'button:pressed { color: red; }';

	//// Will be red when pressed
	btn = new Button();
	// << article-using-state-selector
	const stack = new StackLayout();
	page.content = stack;
	stack.addChild(btn);

	testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;

	let btn = new Button();
	btn.className = 'test';

	let testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);

	page.css = '.test:pressed { color: red; }';
	testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector_with_multiple_classes() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;

	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;

	btn.className = 'test otherClass';
	testStack.addChild(btn);

	page.css = '.test:pressed { color: red; }';

	testButtonPressedStateIsRed(btn);
}

export function test_id_and_state_selector() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;

	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;

	btn.id = 'myButton';
	testStack.addChild(btn);

	page.css = '#myButton:pressed { color: red; }';

	testButtonPressedStateIsRed(btn);
}

export function test_restore_original_values_when_state_is_changed() {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;

	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);

	page.css = 'button { color: blue; } ' + 'button:pressed { color: red; } ';

	helper.assertViewColor(btn, '#0000FF');
	btn._goToVisualState('pressed');
	helper.assertViewColor(btn, '#FF0000');
	btn._goToVisualState('normal');
	helper.assertViewColor(btn, '#0000FF');
}

export const test_composite_selector_type_and_class = function () {
	// Arrange
	const testStack = new StackLayout();

	const btnWithClass = new Button();
	btnWithClass.className = 'test';
	testStack.addChild(btnWithClass);

	const btnWithNoClass = new Button();
	testStack.addChild(btnWithNoClass);

	const lblWithClass = new Label();
	lblWithClass.className = 'test';
	testStack.addChild(lblWithClass);

	let testCss = 'button.test { color: red; }';

	let testFunc = function (views: Array<View>) {
		TKUnit.assert(btnWithClass.style.color, 'Color property no applied correctly.');
		TKUnit.assert(btnWithClass.style.color.hex === '#FF0000', 'Color property no applied correctly.');
		TKUnit.assert(btnWithNoClass.style.color === undefined, 'btnWithNoClass color should not have a value');
		TKUnit.assert(lblWithClass.style.color === undefined, 'lblWithClass color should not have a value');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: testCss });
};

export const test_composite_selector_type_class_state = function () {
	const testStack = new StackLayout();
	const btnWithClass = new Button();
	btnWithClass.className = 'test';
	testStack.addChild(btnWithClass);

	const btnWithNoClass = new Button();
	testStack.addChild(btnWithNoClass);

	const lblWithClass = new Label();
	lblWithClass.className = 'test';
	testStack.addChild(lblWithClass);

	let testCss = 'button.test:pressed { color: red; }';

	let testFunc = function (views: Array<View>) {
		testButtonPressedStateIsRed(btnWithClass);

		// The button with no class should not react to state changes.
		TKUnit.assertNull(btnWithNoClass.style.color, 'Color should not have a value.');
		btnWithNoClass._goToVisualState('pressed');
		TKUnit.assertNull(btnWithNoClass.style.color, 'Color should not have a value.');
		btnWithNoClass._goToVisualState('normal');
		TKUnit.assertNull(btnWithNoClass.style.color, 'Color should not have a value.');

		TKUnit.assertNull(lblWithClass.style.color, 'Color should not have a value');
	};
	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: testCss });
};

export const test_style_is_applied_when_control_is_added_after_load = function () {
	let page = helper.getClearCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;
	page.css = 'button { color: red; }';

	testStack.addChild(btn);
	TKUnit.assert(btn.style.color, 'Color property no applied correctly.');
	TKUnit.assertEqual(btn.style.color.hex, '#FF0000', 'Color property not applied correctly.');
};

const changeIdOrClassTestCss = 'button { background-color: #111111 } ' + '.button-class { background-color: #222222 } ' + '.button-class-two { background-color: #333333 } ' + '#myButton { background-color: #444444 } ' + '#myButtonTwo { background-color: #555555 } ';

export function test_styles_are_updated_when_cssClass_is_set() {
	const testStack = new StackLayout();
	const btn = new Button();
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#111111');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.className = 'button-class';

		helper.assertViewBackgroundColor(btn, '#222222');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

export function test_styles_are_updated_when_cssClass_is_changed() {
	const testStack = new StackLayout();
	const btn = new Button();
	btn.className = 'button-class';
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#222222');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.className = 'button-class-two';

		helper.assertViewBackgroundColor(btn, '#333333');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

export function test_styles_are_updated_when_cssClass_is_cleared() {
	const testStack = new StackLayout();
	const btn = new Button();
	btn.className = 'button-class';
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#222222');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.className = undefined;

		helper.assertViewBackgroundColor(btn, '#111111');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

export function test_styles_are_updated_when_id_is_set() {
	const testStack = new StackLayout();
	const btn = new Button();
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#111111');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.id = 'myButton';

		helper.assertViewBackgroundColor(btn, '#444444');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

export function test_styles_are_updated_when_id_is_changed() {
	const testStack = new StackLayout();
	const btn = new Button();
	btn.id = 'myButton';
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#444444');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.id = 'myButtonTwo';

		helper.assertViewBackgroundColor(btn, '#555555');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

export function test_styles_are_updated_when_id_is_cleared() {
	const testStack = new StackLayout();
	const btn = new Button();
	btn.id = 'myButton';
	const btn2 = new Button();
	testStack.addChild(btn);
	testStack.addChild(btn2);

	const testFunc = () => {
		helper.assertViewBackgroundColor(btn, '#444444');
		helper.assertViewBackgroundColor(btn2, '#111111');

		btn.id = undefined;

		helper.assertViewBackgroundColor(btn, '#111111');
		helper.assertViewBackgroundColor(btn2, '#111111');
	};

	helper.buildUIAndRunTest(testStack, testFunc, { pageCss: changeIdOrClassTestCss });
}

const typeSelector = 'button { color: blue } ';
const classSelector = '.button-class { color: green } ';
const idSelector = '#myButton { color: red } ';

export function test_selector_priorities_1() {
	testSelectorsPrioritiesTemplate(typeSelector + classSelector + idSelector);
}

export function test_selector_priorities_2() {
	testSelectorsPrioritiesTemplate(typeSelector + idSelector + classSelector);
}

export function test_selector_priorities_3() {
	testSelectorsPrioritiesTemplate(classSelector + typeSelector + idSelector);
}

export function test_selector_priorities_4() {
	testSelectorsPrioritiesTemplate(classSelector + idSelector + typeSelector);
}

export function test_selector_priorities_5() {
	testSelectorsPrioritiesTemplate(idSelector + typeSelector + classSelector);
}

export function test_selector_priorities_6() {
	testSelectorsPrioritiesTemplate(idSelector + classSelector + typeSelector);
}

function testSelectorsPrioritiesTemplate(css: string) {
	let page = helper.getClearCurrentPage();
	page.style.color = unsetValue;
	let btn: Button;
	let btnWithClass: Button;
	let btnWithId: Button;

	const testStack = new StackLayout();
	page.content = testStack;

	btn = new Button();
	testStack.addChild(btn);

	btnWithClass = new Button();
	btnWithClass.className = 'button-class';
	testStack.addChild(btnWithClass);

	btnWithId = new Button();
	btnWithId.className = 'button-class';
	btnWithId.id = 'myButton';
	testStack.addChild(btnWithId);

	page.css = css;

	helper.assertViewColor(btn, '#0000FF'); //red
	helper.assertViewColor(btnWithClass, '#008000'); //green
	helper.assertViewColor(btnWithId, '#FF0000'); //blue
}

// helpers
function testButtonPressedStateIsRed(btn: Button) {
	TKUnit.assert(btn.style.color === undefined, 'Color should not have a value.');

	btn._goToVisualState('pressed');

	helper.assertViewColor(btn, '#FF0000');

	btn._goToVisualState('normal');

	TKUnit.assert(btn.style.color === undefined, 'Color should not have a value after returned to normal state.');
}

export function test_setInlineStyle_setsLocalValues() {
	const testButton = new Button();
	testButton.text = 'Test';
	const stack = new StackLayout();
	stack.addChild(testButton);

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		(<any>testButton).style = 'color: red;';
		helper.assertViewColor(testButton, '#FF0000');
	});
}

export function test_setStyle_throws() {
	const testButton = new Button();

	TKUnit.assertThrows(function () {
		(<any>testButton).style = {};
	}, 'View.style property is read-only.');
}

export function test_CSS_isAppliedOnPage() {
	const testButton = new Button();
	testButton.text = 'Test';

	helper.buildUIAndRunTest(testButton, function (views: Array<View>) {
		const page: Page = <Page>views[1];
		page.css = 'page { background-color: red; }';
		helper.assertViewBackgroundColor(page, '#FF0000');
	});
}

export function test_CSS_isAppliedOnPage_From_Import() {
	const testButton = new Button();
	testButton.text = 'Test';

	helper.buildUIAndRunTest(testButton, function (views: Array<View>) {
		const page: Page = <Page>views[1];
		page.css = "@import url('ui/styling/test-page.css');";
		helper.assertViewBackgroundColor(page, '#FF0000');
	});
}

export function test_CSS_isAppliedOnPage_From_Import_Without_Url() {
	const testButton = new Button();
	testButton.text = 'Test';

	helper.buildUIAndRunTest(testButton, function (views: Array<View>) {
		const page: Page = <Page>views[1];
		page.css = "@import 'ui/styling/test-page.css';";
		helper.assertViewBackgroundColor(page, '#FF0000');
	});
}

export function test_CSS_isAppliedOnPage_From_addCssFile() {
	const testButton = new Button();
	testButton.text = 'Test';

	helper.buildUIAndRunTest(testButton, function (views: Array<View>) {
		const page: Page = <Page>views[1];
		page.addCssFile(knownFolders.currentApp().path + '/ui/styling/test-page.css');
		helper.assertViewBackgroundColor(page, '#FF0000');
	});
}

export function test_CSS_isAppliedOnPage_From_changeCssFile() {
	const testButton = new Button();
	testButton.text = 'Test';

	const testCss = 'button { color: blue; }';

	const testFunc = function (views: Array<View>) {
		helper.assertViewColor(testButton, '#0000FF');
		const page: Page = <Page>views[1];
		page.changeCssFile(knownFolders.currentApp().path + '/ui/styling/test-page.css');
		helper.assertViewBackgroundColor(page, '#FF0000');
		TKUnit.assert(testButton.style.color === undefined, 'Color should not have a value');
	};

	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

const invalidCSS =
	'.invalid { ' +
	'color: invalidValue; ' +
	'background-color: invalidValue; ' +
	'border-color: invalidValue; ' +
	'border-width: invalidValue; ' +
	'border-radius: invalidValue; ' +
	'font: invalidValue; ' +
	'font-style: invalidValue; ' +
	'font-weight: invalidValue; ' +
	'text-align: invalidValue; ' +
	'min-width: invalidValue; ' +
	'min-height: invalidValue; ' +
	'visibility: invalidValue; ' +
	'opacity: invalidValue; ' +
	'font-size: 30;' + // set one valid value to test it is applied
	'}';

export function test_set_invalid_CSS_values_dont_cause_crash() {
	const testButton = new Button();
	testButton.text = 'Test';
	testButton.className = 'invalid';

	helper.buildUIAndRunTest(
		testButton,
		(views: Array<View>) => {
			TKUnit.assertEqual(30, testButton.style.fontSize);
		},
		{ pageCss: invalidCSS }
	);
}

// Check Mixed, Upper and lower case properties
const casedCSS = '.cased {' + 'cOlOr: blue; ' + 'FONT-SIZE: 30; ' + 'background-color: red; ' + '}';

export function test_set_mixed_CSS_cases_works() {
	const testButton = new Button();
	testButton.text = 'Test';
	testButton.className = 'cased';

	helper.buildUIAndRunTest(
		testButton,
		function (views: Array<View>) {
			TKUnit.assertEqual(30, testButton.style.fontSize);
			helper.assertViewBackgroundColor(testButton, '#FF0000');
			helper.assertViewColor(testButton, '#0000FF');
		},
		{ pageCss: casedCSS }
	);
}

export function test_basic_hierarchical_selectors() {
	let stack = new StackLayout();
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = 'stacklayout button { background-color: #FF0000; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#FF0000');
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#FF0000');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_basic_hierarchical_direct_child_selectors() {
	let stack = new StackLayout();
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = 'stacklayout > button { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#FF0000');
		// only buttons that are direct children of StackLayout should have red background color
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#00FF00');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_basic_hierarchical_direct_child_more_levels_selectors() {
	let stack = new StackLayout();
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = 'stacklayout > wraplayout > button { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#00FF00');
		// only buttons that are direct children of StackLayout and WrapLayout should have red background color
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#FF0000');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types() {
	let stack = new StackLayout();
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	wrap.className = 'wraplayoutClass';
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';
	testButton2.className = 'buttonClass';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = 'stacklayout>.wraplayoutClass > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#00FF00');
		// only buttons that are direct children of StackLayout and WrapLayout should have red background color
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#FF0000');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types2() {
	let stack = new StackLayout();
	stack.id = 'stack';
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	wrap.className = 'wraplayoutClass';
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';
	testButton2.className = 'buttonClass';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = '#stack>.wraplayoutClass>.buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#00FF00');
		// only buttons that are direct children of Layout with id stack and Layout with cssClass wraplayoutClass should have red background color
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#FF0000');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types_invalid() {
	let stack = new StackLayout();
	stack.id = 'stack';
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	wrap.className = 'wraplayoutClass';
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';
	testButton2.className = 'buttonClass';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = '#stackErr > .wraplayoutClass > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#00FF00');
		// this is an invalid css so red style should not be applied
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#00FF00');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types_invalid_middle() {
	let stack = new StackLayout();
	stack.id = 'stack';
	let testButton1 = new Button();
	testButton1.text = 'Test 1';
	testButton1.id = 'testButton1';

	let wrap = new WrapLayout();
	wrap.className = 'wraplayoutClass';
	let testButton2 = new Button();
	testButton2.text = 'Test 2';
	testButton2.id = 'testButton2';
	testButton2.className = 'buttonClass';

	wrap.addChild(testButton2);
	stack.addChild(testButton1);
	stack.addChild(wrap);

	let testCss = '#stack > .wraplayoutClassErr > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(stack.getViewById('testButton1'), '#00FF00');
		// this is an invalid css so red style should not be applied
		helper.assertViewBackgroundColor(stack.getViewById('testButton2'), '#00FF00');
	};

	helper.buildUIAndRunTest(stack, testFunc, { pageCss: testCss });
}

export function test_type_attr_selector() {
	let testButton = new Button();
	testButton['testAttr'] = 'some value';

	let testCss = 'button[testAttr] { background-color: #FF0000; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_class_attr_selector() {
	let testButton = new Button();
	testButton.className = 'button';
	testButton['testAttr'] = 'some value';

	let testCss = '.button[testAttr] { background-color: #FF0000; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_id_attr_selector() {
	let testButton = new Button();
	testButton.id = 'myButton';
	testButton['testAttr'] = 'some value';

	let testCss = '#myButton[testAttr] { background-color: #FF0000; }';

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_type_attr_value_selector() {
	let testButton = new Button();
	testButton['testAttr'] = 'somevalue';

	let testCss = "button[testAttr='somevalue'] { background-color: #FF0000; }";

	let testFunc = function (views: Array<View>) {
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_type_attr_invalid_value_selector() {
	let testButton = new Button();
	testButton['testAttr'] = 'somevalue';

	let testCss = "button[testAttr='value'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_correct_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_correct_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'some flower';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_correct_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower new';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_incorrect_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'my-flower';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_incorrect_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowers';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_tilde_attr_selector_incorrect_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower-house';

	let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_pipe_attr_selector_correct_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_pipe_attr_selector_correct_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower-house';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_pipe_attr_selector_incorrect_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowers';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_pipe_attr_selector_incorrect_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'myflower';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_pipe_attr_selector_incorrect_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'my-flower';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_power_attr_selector_correct_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower';

	let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_power_attr_selector_correct_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower-house';

	let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_power_attr_selector_correct_synta2() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowers';

	let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_power_attr_selector_incorrect_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'myflower';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_power_attr_selector_incorrect_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'my-flower';

	let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_correct_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_correct_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'myflower';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_correct_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'my-flower';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_incorrect_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowers';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_incorrect_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowermy';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_dollar_attr_selector_incorrect_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower-my';

	let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax1() {
	let testButton = new Button();
	testButton['testAttr'] = 'myflower';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax2() {
	let testButton = new Button();
	testButton['testAttr'] = 'my-flower';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax3() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowers';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax4() {
	let testButton = new Button();
	testButton['testAttr'] = 'flowermy';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_correct_syntax5() {
	let testButton = new Button();
	testButton['testAttr'] = 'flower-my';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#FF0000');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_star_attr_selector_incorrect_syntax() {
	let testButton = new Button();
	testButton['testAttr'] = 'flow';

	let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_alone_attr_selector() {
	let testButton = new Button();
	testButton['testAttr'] = 'flow';

	let testCss = "[testAttr*='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_UsingSameSelectors_ShouldApplyLatest() {
	let testButton = new Button();
	testButton.className = 'green';

	let testCss = '.green { background-color: #FF0000; } .green { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_UsingSameSelectorsWithSpecific_ShouldApplyLatest() {
	let testButton = new Button();
	testButton.className = 'red green';

	let testCss = '.red { background-color: #FF0000; } Button.green { background-color: #00FF00; }';

	let testFunc = function (views: Array<View>) {
		// style from correct type css should be applied
		helper.assertViewBackgroundColor(testButton, '#00FF00');
	};
	helper.buildUIAndRunTest(testButton, testFunc, { pageCss: testCss });
}

export function test_CascadingClassNamesAppliesAfterPageLoad() {
	const stack = new StackLayout();
	const label = new Label();
	label.text = 'Some text';
	label.className = 'lab1';
	stack.addChild(label);

	Application.addCss('.added { background-color: red; } .added .lab1 { background-color: blue; } .lab1 { color: red}');

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		helper.assertViewColor(label, '#FF0000');
		stack.className = 'added';
		helper.assertViewBackgroundColor(label, '#0000FF');
		helper.assertViewBackgroundColor(stack, '#FF0000');
	});
}

export function test_evaluateCssCalcExpression() {
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(1px + 1px)'), '2px', 'Simple calc (1)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(50px - (20px - 30px))'), '60px', 'Simple calc (2)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(100px - (100px - 100%))'), '100%', 'Simple calc (3)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(100px + (100px - 100%))'), 'calc(200px - 100%)', 'Simple calc (4)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(100% - 10px + 20px)'), 'calc(100% + 10px)', 'Simple calc (5)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(100% + 10px - 20px)'), 'calc(100% - 10px)', 'Simple calc (6)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(10.px + .0px)'), '10px', 'Simple calc (8)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('a calc(1px + 1px)'), 'a 2px', 'Ignore value surrounding calc function (1)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(1px + 1px) a'), '2px a', 'Ignore value surrounding calc function (2)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('a calc(1px + 1px) b'), 'a 2px b', 'Ignore value surrounding calc function (3)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('a calc(1px + 1px) b calc(1em + 2em) c'), 'a 2px b 3em c', 'Ignore value surrounding calc function (4)');
	TKUnit.assertEqual(_evaluateCssCalcExpression(`calc(\n1px \n* 2 \n* 1.5)`), '3px', 'Handle new lines');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(1/100)'), '0.01', 'Handle precision correctly (1)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(5/1000000)'), '0.00001', 'Handle precision correctly (2)');
	TKUnit.assertEqual(_evaluateCssCalcExpression('calc(5/100000)'), '0.00005', 'Handle precision correctly (3)');
}

export function test_css_calc() {
	const page = helper.getClearCurrentPage();

	const stack = new StackLayout();
	stack.css = `
    StackLayout.slim {
        width: calc(100 * .1);
    }

    StackLayout.wide {
        width: calc(100 * 1.25);
    }

    StackLayout.invalid-css-calc {
        width: calc(asd3 * 1.25);
    }
    `;

	const label = new Label();
	page.content = stack;
	stack.addChild(label);

	stack.className = 'slim';
	TKUnit.assertEqual(stack.width as any, 10, 'Stack - width === 10');

	stack.className = 'wide';
	TKUnit.assertEqual(stack.width as any, 125, 'Stack - width === 125');

	(stack as any).style = `width: calc(100% / 2)`;
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.5 }, 'Stack - width === 50%');

	// This should log an error for the invalid css-calc expression, but not cause a crash
	stack.className = 'invalid-css-calc';
}

export function test_css_calc_units() {
	const page = helper.getClearCurrentPage();

	const stack = new StackLayout();
	stack.css = `
    StackLayout.no_unit {
        width: calc(100 * .1);
    }

    StackLayout.dip_unit {
        width: calc(100dip * .1);
    }

    StackLayout.pct_unit {
        width: calc(100% * .1);
    }

    StackLayout.px_unit {
        width: calc(100px * .1);
    }
    `;

	const label = new Label();
	page.content = stack;
	stack.addChild(label);

	stack.className = 'no_unit';
	TKUnit.assertEqual(stack.width as any, 10, 'Stack - width === 10');

	stack.className = 'dip_unit';
	TKUnit.assertEqual(stack.width as any, 10, 'Stack - width === 10dip');

	stack.className = 'pct_unit';
	TKUnit.assertDeepEqual(stack.width as any, { unit: '%', value: 0.1 }, 'Stack - width === 10%');

	stack.className = 'px_unit';
	TKUnit.assertDeepEqual(stack.width as any, { unit: 'px', value: 10 }, 'Stack - width === 10px');
}

export function test_nested_css_calc() {
	const page = helper.getClearCurrentPage();

	const stack = new StackLayout();
	stack.css = `
    StackLayout.slim {
        width: calc(calc(10 * 10) * .1);
    }

    StackLayout.wide {
        width: calc(calc(10 * 10) * 1.25);
    }
    `;

	const label = new Label();
	page.content = stack;
	stack.addChild(label);

	stack.className = 'slim';
	TKUnit.assertEqual(stack.width as any, 10, 'Stack - width === 10');

	stack.className = 'wide';
	TKUnit.assertEqual(stack.width as any, 125, 'Stack - width === 125');

	(stack as any).style = `width: calc(100% * calc(1 / 2))`;

	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.5 }, 'Stack - width === 50%');
}

export function test_css_variables() {
	const blackColor = '#000000';
	const redColor = '#FF0000';
	const greenColor = '#00FF00';
	const blueColor = '#0000FF';

	const page = helper.getClearCurrentPage();

	const cssVarName = `--my-background-color-${Date.now()}`;

	const stack = new StackLayout();
	stack.css = `
    StackLayout[use-css-vars] {
        background-color: var(${cssVarName});
    }

    StackLayout.make-red {
        ${cssVarName}: red;
    }

    StackLayout.make-blue {
        ${cssVarName}: blue;
    }

    Label.lab1 {
        background-color: var(${cssVarName});
        color: black;
    }`;

	const label = new Label();
	page.content = stack;
	stack.addChild(label);

	// This should log an error about not finding the css-variable but not cause a crash
	stack['use-css-vars'] = true;
	label.className = 'lab1';

	stack.className = 'make-red';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, redColor, 'Stack - background-color is red');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, redColor, 'Label - background-color is red');

	stack.className = 'make-blue';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, blueColor, 'Stack - background-color is blue');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, blueColor, 'Label - background-color is blue');

	stack.className = 'make-red';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, redColor, 'Stack - background-color is red');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, redColor, 'Label - background-color is red');

	// view.style takes priority over css-classes.
	(stack as any).style = `${cssVarName}: ${greenColor}`;
	stack.className = '';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, greenColor, 'Stack - background-color is green');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, greenColor, 'Label - background-color is green');

	stack.className = 'make-red';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, greenColor, 'Stack - background-color is green');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, greenColor, 'Label - background-color is green');

	(stack as any).style = '';
	TKUnit.assertEqual(label.style.color.hex, blackColor, 'text color is black');
	TKUnit.assertEqual((<Color>stack.backgroundColor).hex, redColor, 'Stack - background-color is red');
	TKUnit.assertEqual((<Color>label.backgroundColor).hex, redColor, 'Label - background-color is red');
}

export function test_css_calc_and_variables() {
	const page = helper.getClearCurrentPage();

	const cssVarName = `--my-width-factor-${Date.now()}`;

	const stack = new StackLayout();
	stack.css = `
    StackLayout[use-css-vars] {
        ${cssVarName}: 1;
        width: calc(100% * var(${cssVarName}));
    }

    StackLayout.slim {
        ${cssVarName}: 0.1;
    }

    StackLayout.wide {
        ${cssVarName}: 1.25;
    }
    `;

	const label = new Label();
	page.content = stack;
	stack['use-css-vars'] = true;
	stack.addChild(label);

	stack.className = '';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 1 }, 'Stack - width === 100%');

	stack.className = 'slim';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.1 }, 'Stack - width === 10%');

	stack.className = 'wide';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 1.25 }, 'Stack - width === 125%');

	// Test setting the CSS variable via the style-attribute, this should override any value set via css-class
	(stack as any).style = `${cssVarName}: 0.5`;
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.5 }, 'Stack - width === 50%');
}

export function test_css_variable_fallback() {
	const redColor = '#FF0000';
	const blueColor = '#0000FF';
	const limeColor = new Color('lime').hex;
	const yellowColor = new Color('yellow').hex;

	const classToValue = [
		{
			className: 'defined-css-variable',
			expectedColor: blueColor,
		},
		{
			className: 'defined-css-variable-with-fallback',
			expectedColor: blueColor,
		},
		{
			className: 'undefined-css-variable-without-fallback',
			expectedColor: undefined,
		},
		{
			className: 'undefined-css-variable-with-fallback',
			expectedColor: redColor,
		},
		{
			className: 'undefined-css-variable-with-defined-fallback',
			expectedColor: limeColor,
		},
		{
			className: 'undefined-css-variable-with-multiple-fallbacks',
			expectedColor: limeColor,
		},
		{
			className: 'undefined-css-variable-with-missing-fallback-value',
			expectedColor: undefined,
		},
		{
			className: 'undefined-css-variable-with-nested-fallback',
			expectedColor: yellowColor,
		},
	];

	const page = helper.getClearCurrentPage();

	const stack = new StackLayout();
	stack.css = `
    .defined-css-variable {
        --my-var: blue;
        color: var(--my-var); /* resolved as color: blue; */
    }

    .defined-css-variable-with-fallback {
        --my-var: blue;
        color: var(--my-var, red); /* resolved as color: blue; */
    }

    .undefined-css-variable-without-fallback {
        color: var(--undefined-var); /* resolved as color: unset; */
    }

    .undefined-css-variable-with-fallback {
        color: var(--undefined-var, red); /* resolved as color: red; */
    }

    .undefined-css-variable-with-defined-fallback {
        --my-fallback-var: lime;
        color: var(--undefined-var, var(--my-fallback-var)); /* resolved as color: lime; */
    }

    .undefined-css-variable-with-multiple-fallbacks {
        --my-fallback-var: lime;
        color: var(--undefined-var, var(--my-fallback-var), yellow); /* resolved as color: lime; */
    }

    .undefined-css-variable-with-missing-fallback-value {
        color: var(--undefined-var, var(--undefined-fallback-var)); /* resolved as color: unset; */
    }

    .undefined-css-variable-with-nested-fallback {
        color: var(--undefined-var, var(--undefined-fallback-var, yellow)); /* resolved as color: yellow; */
    }
    `;

	const label = new Label();
	page.content = stack;
	stack.addChild(label);

	for (const { className, expectedColor } of classToValue) {
		label.className = className;
		TKUnit.assertEqual(label.style.color && label.style.color.hex, expectedColor, className);
	}
}

export function test_nested_css_calc_and_variables() {
	const page = helper.getClearCurrentPage();

	const cssVarName = `--my-width-factor-base-${Date.now()}`;
	const cssVarName2 = `--my-width-factor-${Date.now()}`;
	const undefinedCssVarName = `--my-undefined-variable-${Date.now()}`;

	const stack = new StackLayout();
	stack.css = `
    StackLayout[use-css-vars] {
        ${cssVarName}: 0.5;
        ${cssVarName2}: var(${cssVarName});
        width: calc(100% * calc(var(${cssVarName2}) * 2));
    }

    StackLayout.slim {
        ${cssVarName}: 0.05;
    }

    StackLayout.wide {
        ${cssVarName}: 0.625
    }

    StackLayout.nested {
        ${cssVarName2}: calc(var(${cssVarName}) * 2);
    }

    StackLayout.nested-fallback {
        width: calc(calc(var(${undefinedCssVarName}, 16) / 2) * 2));
    }
    `;

	const label = new Label();
	page.content = stack;
	stack['use-css-vars'] = true;
	stack.addChild(label);

	stack.className = '';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 1 }, 'Stack - width === 100%');

	stack.className = 'nested';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 2 }, 'Stack - width === 200%');

	stack.className = 'slim';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.1 }, 'Stack - width === 10%');

	stack.className = 'slim nested';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.2 }, 'Stack - width === 20%');

	stack.className = 'wide';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 1.25 }, 'Stack - width === 125%');

	stack.className = 'wide nested';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 2.5 }, 'Stack - width === 250%');

	// Test setting the CSS variable via the style-attribute, this should override any value set via css-class
	stack.className = 'wide';
	(stack as any).style = `${cssVarName}: 0.25`;
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 0.5 }, 'Stack - width === 50%');

	stack.className = 'nested';
	TKUnit.assertDeepEqual(stack.width, { unit: '%', value: 1 }, 'Stack - width === 100%');

	stack.className = 'nested-fallback';
	TKUnit.assertDeepEqual(stack.width, 16, 'Stack - width === 16');
}

export function test_css_variable_is_applied_to_normal_properties() {
	const stack = new StackLayout();

	const cssVarName = `--my-custom-variable-${Date.now()}`;

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		const expected = 'horizontal';
		page.css = `StackLayout {
            ${cssVarName}: ${expected};
            orientation: var(${cssVarName});
        }`;
		TKUnit.assertEqual(stack.orientation, expected);
	});
}

export function test_css_variable_is_applied_to_special_properties() {
	const stack = new StackLayout();

	const cssVarName = `--my-custom-variable-${Date.now()}`;

	helper.buildUIAndRunTest(stack, function (views: Array<View>) {
		const page = <Page>views[1];
		const expected = 'test';
		page.css = `StackLayout {
            ${cssVarName}: ${expected};
            class: var(${cssVarName});
        }`;
		TKUnit.assertEqual(stack.className, expected);
	});
}

export function test_resolveFileNameFromUrl_local_file_tilda() {
	const localFileExistsMock = (fileName: string) => true;
	const url = '~/theme/core.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/theme/core.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, localFileExistsMock);

	TKUnit.assertEqual(result, expected, 'Should resolve local file with leading tilda (~/)');
}

export function test_resolveFileNameFromUrl_local_file_no_tilda() {
	const localFileExistsMock = (fileName: string) => true;
	const url = 'theme/core.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/theme/core.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, localFileExistsMock);

	TKUnit.assertEqual(result, expected, 'Should resolve local file without leading tilda (no ~/)');
}

export function test_resolveFileNameFromUrl_external_file_tilda() {
	const externalFileExistsMock = (fileName: string) => fileName.indexOf('tns_modules') !== -1;
	const url = '~/theme/core.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/tns_modules/theme/core.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, externalFileExistsMock);

	TKUnit.assertEqual(result, expected, 'Should resolve file from tns_modules with leading tilda (~/)');
}

export function test_resolveFileNameFromUrl_external_file_no_tilda() {
	const externalFileExistsMock = (fileName: string) => fileName.indexOf('tns_modules') !== -1;
	const url = 'theme/core.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/tns_modules/theme/core.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, externalFileExistsMock);

	TKUnit.assertEqual(result, expected, 'Should resolve file from tns_modules without leading tilda (no ~/)');
}

export function test_resolveFileNameFromUrl_import_relative_file_curent_dir() {
	const importedFileExistsMock = (fileName: string) => fileName.indexOf('views') !== -1;
	const importSource = 'app/views/main-page.css';
	const url = './common.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/views/common.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, importedFileExistsMock, importSource);

	TKUnit.assertEqual(result, expected, 'Should resolve relative file to current directory');
}

export function test_resolveFileNameFromUrl_import_relative_file_parent_dir() {
	const importedFileExistsMock = (fileName: string) => fileName.indexOf('views') !== -1;
	const importSource = 'app/views/shared/main-page.css';
	const url = '../common.css';
	const appDirectory = 'app';
	const expected = `${appDirectory}/views/common.css`;
	const result = resolveFileNameFromUrl(url, appDirectory, importedFileExistsMock, importSource);

	TKUnit.assertEqual(result, expected, 'Should resolve relative file to parent directory');
}

export function test_resolveFileNameFromUrl_unexisting_file() {
	const fileDoesNotExistMock = (fileName: string) => false;
	const url = '~/theme/core.css';
	const appDirectory = 'app';
	const result = resolveFileNameFromUrl(url, appDirectory, fileDoesNotExistMock);

	TKUnit.assertNull(result, "Shouldn't resolve unexisting file");
}

export function test_checkAddRemoveCSS() {
	const css1 = '#test_checkAddRemoveCSS_label { color: #FF0000; }';
	const css2 = '#test_checkAddRemoveCSS_label { color: #00FF00; }';
	const label = new Label();
	label.text = 'color coming from updated rules';
	label.id = 'test_checkAddRemoveCSS_label';

	helper.buildUIAndRunTest(label, function (views: Array<View>) {
		const page = <Page>views[1];

		// Add Red, we have to then trigger the page's CSS state change, for it to refresh the label's css with the new global rule
		addTaggedAdditionalCSS(css1, 'red');
		page._onCssStateChange();
		helper.assertViewColor(label, '#FF0000');

		// Add Green (should override red)
		addTaggedAdditionalCSS(css2, 'green');
		page._onCssStateChange();
		helper.assertViewColor(label, '#00FF00');

		// Remove Green (Should revert to red, since we removed the green rule)
		removeTaggedAdditionalCSS('green');
		page._onCssStateChange();
		helper.assertViewColor(label, '#FF0000');

		//Cleanup
		removeTaggedAdditionalCSS('red');
	});
}

// <snippet module="ui/styling" title="styling">
// For information and example how to use style properties please refer to special [**Styling**](../../../styling.md) topic.
// </snippet>
