import * as helper from '../../ui-helper';
import * as TKUnit from '../../tk-unit';
import { Color, Button, StackLayout, unsetValue } from '@nativescript/core';

export var test_value_Inherited_after_unset = function () {
	let page = helper.getCurrentPage();
	page.css = 'StackLayout { color: #FF0000; } .blue { color: #0000FF; }';
	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);
	btn.className = 'blue';
	helper.assertViewColor(btn, '#0000FF');
	btn.className = '';
	helper.assertViewColor(btn, '#FF0000');
};

export var test_value_Inherited_stronger_than_Default = function () {
	let page = helper.getCurrentPage();
	let btn = new Button();
	let testStack = new StackLayout();
	page.content = testStack;
	testStack.addChild(btn);
	page.css = 'stackLayout { color: red; }';
	helper.assertViewColor(btn, '#FF0000');
	page.css = '';
};

export var test_value_Css_stronger_than_Inherited = function () {
	let page = helper.getCurrentPage();
	let testStack = new StackLayout();
	page.content = testStack;

	let btn = new Button();
	testStack.addChild(btn);
	page.css = 'stackLayout { color: red; } button { color: blue; }';

	helper.assertViewColor(btn, '#0000FF');
};

export function test_value_Local_stronger_than_Css() {
	let testPage = helper.getCurrentPage();
	let testStack = new StackLayout();
	testPage.content = testStack;

	let btn = new Button();
	testStack.addChild(btn);
	testPage.css = 'button { color: red; }';

	helper.assertViewColor(btn, '#FF0000');
	btn.style.color = new Color('#0000FF');
	helper.assertViewColor(btn, '#0000FF');
	btn.style.color = unsetValue;
	TKUnit.assertEqual(btn.style.color, undefined, 'style.color should be undefined when set locally.');
}
