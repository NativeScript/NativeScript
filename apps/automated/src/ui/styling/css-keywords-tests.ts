import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Color, Button, StackLayout } from '@nativescript/core';

export var test_value_after_initial = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	(btn as any).backgroundColor = 'initial';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_initial = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'initial';
	TKUnit.assertEqual(btn.color, undefined, 'color property');
};

export var test_value_after_unset = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	(btn as any).backgroundColor = 'unset';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_unset = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'unset';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};

export var test_value_after_revert = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	(btn as any).backgroundColor = 'revert';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_revert = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'revert';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};

// A keyword set from code only releases the local value; see test_css_inherit_* for the stylesheet keyword.
export var test_value_after_inherit = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.backgroundColor = new Color('#0000FF');
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property');
	(btn as any).backgroundColor = 'inherit';
	TKUnit.assertEqual(btn.backgroundColor, undefined, 'backgroundColor property');
};

export var test_value_Inherited_after_inherit = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { color: #FF0000; }';

	page.content = testStack;
	testStack.addChild(btn);

	btn.color = new Color('#0000FF');
	TKUnit.assertEqual(btn.color.hex, '#0000FF', 'color property');
	(btn as any).color = 'inherit';
	TKUnit.assertEqual(btn.color.hex, '#FF0000', 'color property');
};

export var test_css_inherit_on_non_inherited_property = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { background-color: #FF0000; margin-top: 7; } Button { background-color: inherit; margin-top: inherit; }';

	page.content = testStack;
	testStack.addChild(btn);

	TKUnit.assertEqual(btn.backgroundColor.hex, '#FF0000', 'backgroundColor property');
	TKUnit.assertEqual(btn.marginTop, 7, 'marginTop property');

	testStack.backgroundColor = new Color('#0000FF');
	testStack.marginTop = 3;
	TKUnit.assertEqual(btn.backgroundColor.hex, '#0000FF', 'backgroundColor property follows the parent');
	TKUnit.assertEqual(btn.marginTop, 3, 'marginTop property follows the parent');
};

export var test_css_inherit_on_shorthand = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();

	page.css = 'StackLayout { border-color: #FF0000; } Button { border-color: inherit; }';

	page.content = testStack;
	testStack.addChild(btn);

	TKUnit.assertEqual((<Color>btn.borderTopColor).hex, '#FF0000', 'borderTopColor property');
	TKUnit.assertEqual((<Color>btn.borderLeftColor).hex, '#FF0000', 'borderLeftColor property');
};
