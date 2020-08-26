import { Observable, fromObject, fromObjectRecursive } from '@nativescript/core/data/observable';
import { ViewBase } from '@nativescript/core/ui/core/view-base';
import { BindingOptions } from '@nativescript/core/ui/core/bindable';
import * as TKUnit from '../../../tk-unit';
import * as types from '@nativescript/core/utils/types';
import * as helper from '../../../ui-helper';
import * as utils from '@nativescript/core/utils/utils';
import * as bindingBuilder from '@nativescript/core/ui/builder/binding-builder';
import * as appModule from '@nativescript/core/application';
import { Trace } from '@nativescript/core';
import { View } from '@nativescript/core/ui/core/view';
import { Button } from '@nativescript/core/ui/button';
import { Page } from '@nativescript/core/ui/page';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Label } from '@nativescript/core/ui/label';
import { TextField } from '@nativescript/core/ui/text-field';
declare var WeakRef: any;
// <snippet module="ui/core/bindable" title="bindable">
// For information and examples how to use bindings please refer to special [**Data binding**](../../../../bindings.md) topic.
// </snippet>

// <snippet module="ui/core/weak-event-listener" title="weak-event-listener">
// For information and example how to use weak event listeners please refer to special [**Events**](../../../../events.md) topic which has a dedicated part about weak event listeners.
// </snippet>

export function test_Bindable_Members() {
	const obj = new Label();
	TKUnit.assert(types.isDefined(obj.bind), 'Bindable.bind not defined');
	TKUnit.assert(types.isDefined(obj.unbind), 'Bindable.unbind not defined');
}

export function test_Binding_to_bindingContext_of_View() {
	const target = new Button();
	const source = new Button();

	target.bind({ targetProperty: 'bindingContext', sourceProperty: 'text' }, source);
	source.text = 'a';
	TKUnit.assertEqual(target.bindingContext, 'a');
}

export function test_Bindable_Bind_ToTarget_OneWay() {
	const model = new Observable();
	model.set('name', 'John');

	const options: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
	};

	const obj = new Label();
	obj.bind(options, model);

	TKUnit.assert(obj.get('text') === 'John', "Expected result after binding is [test value] === 'John'");

	model.set('name', 'Changed');

	TKUnit.assert(obj.get('text') === 'Changed', "Expected result after binding is [test value] === 'Changed'");
}

export function test_Bindable_Bind_ToTarget_TwoWay() {
	const model = new Observable();
	model.set('name', 'John');

	const options: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
		twoWay: true,
	};

	const obj = new Label();
	obj.bind(options, model);
	obj.set('text', 'Changed');

	TKUnit.assertEqual(model.get('name'), 'Changed', 'Two-way binding not updating the source when target is changed.');

	model.set('name', 'John');

	TKUnit.assertEqual(obj.get('text'), 'John', 'Two-way binding not updating the target when source is changed.');
}

export function test_Bindable_Bind_ToBindingContext_OneWay() {
	const model = new Observable();
	model.set('name', 'John');

	const options: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
	};

	const obj = new Label();
	obj.bind(options);
	obj.set('text', 'local');
	obj.bindingContext = model;

	TKUnit.assert(obj.get('text') === 'John', 'Binding to a context does not update the target property.');
}

export function test_Bindable_Bind_ToBindingContext_TwoWay() {
	const model = new Observable();
	model.set('name', 'John');

	const options: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
		twoWay: true,
	};

	const obj = new Label();
	obj.bind(options);

	obj.set('text', 'local');
	obj.bindingContext = model;

	TKUnit.assertEqual(obj.get('text'), 'John', 'Binding to a context does not update the target property.');

	obj.set('text', 'local');

	TKUnit.assertEqual(model.get('name'), 'local', 'Two-way binding to a context does not update the source property.');
}

export function test_Bindable_Unbind() {
	const model = new Observable();

	const options: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
	};

	const obj = new Label();
	obj.bind(options, model);

	model.set('name', 'John');

	TKUnit.assert(obj.get('text') === 'John', 'Binding does not updates target property.');

	obj.unbind('text');
	model.set('name', 'Changed');

	TKUnit.assert(obj.get('text') === 'John', 'Unbind does not remove binding.');
}

export function test_bind_NoSource_WillUse_BindingContext() {
	const model = new Observable();
	model.set('testProperty', 'testValue');

	const test = function (views: Array<View>) {
		views[0].bindingContext = model;
		views[1].bind({
			sourceProperty: 'testProperty',
			targetProperty: 'text',
		});

		const button = <Button>views[1];
		TKUnit.assertEqual(button.text, model.get('testProperty'), 'Bind method not working when no source is passed but a valid bindingContext is present.');
	};

	helper.do_PageTest_WithButton(test);
}

export function test_bindingContext_ValueSource_IsInherited() {
	const test = function (views: Array<View>) {
		const context = {};
		views[0].bindingContext = context;
		TKUnit.assert(views[1].bindingContext === context, 'bindingContext not inherited.');
	};

	helper.do_PageTest_WithButton(test);
}

export function test_bindingContext_Change_IsReflected_Properly() {
	const model = new Observable();
	model.set('testProperty', 'testValue');

	const test = function (views: Array<View>) {
		views[1].bind({
			sourceProperty: 'testProperty',
			targetProperty: 'text',
		});

		const button = <Button>views[1];
		TKUnit.assert(button.text === '', 'Bind should do nothing when no source and binding context are available.');

		views[0].bindingContext = model;
		TKUnit.assert(button.text === 'testValue', 'Binding not updated properly when a valid bindingContext is provided.');

		views[0].bindingContext = undefined;
		model.set('testProperty', 'updatedValue');
		TKUnit.assertEqual(button.text, '', 'Binding not properly detached when bindingContext is cleared.');
	};

	helper.do_PageTest_WithButton(test);
}

export function test_WhenBindingIsSetToAnElement_AndElementIsRemoved_ShouldBeCollectedByGC(done) {
	let testFinished = false;

	let page = helper.getCurrentPage();
	let stack = new StackLayout();

	let expectedValue = 'testValue';
	let sourcePropertyName = 'testProperty';
	let targetPropertyName = 'text';

	stack.on(View.loadedEvent, () => {
		const model = new Observable();
		model.set(sourcePropertyName, expectedValue);

		function createButton(bindContext) {
			let button = new Button();
			button.bind(
				{
					sourceProperty: sourcePropertyName,
					targetProperty: targetPropertyName,
				},
				bindContext
			);

			return new WeakRef(button);
		}

		const weakRef = createButton(model);

		try {
			stack.addChild(weakRef.get());
			TKUnit.waitUntilReady(() => weakRef.get().isLoaded);

			TKUnit.assertEqual(weakRef.get().text, expectedValue, 'Binding is not working properly!');
			stack.removeChild(weakRef.get());
			TKUnit.waitUntilReady(() => !weakRef.get().isLoaded);

			utils.GC();
			// Give time for the GC to kick in
			setTimeout(() => {
				utils.GC();
				TKUnit.assert(!weakRef.get(), 'UIElement is still alive!');
				testFinished = true;
			}, 100);
		} catch (e) {
			done(e);
		}
	});

	page.content = stack;

	TKUnit.waitUntilReady(() => testFinished);
	done(null);
}

export function test_OneBindableToBindMoreThanOneProperty_ToSameSource() {
	const model = new Observable();

	const firstPropertyOptions: BindingOptions = {
		sourceProperty: 'name',
		targetProperty: 'text',
	};

	const secondPropertyOptions: BindingOptions = {
		sourceProperty: 'sourceProperty',
		targetProperty: 'targetProperty',
	};

	const obj = new Label();
	obj.bind(firstPropertyOptions, model);
	obj.bind(secondPropertyOptions, model);

	model.set('name', 'John');
	model.set('sourceProperty', 'testValue');

	TKUnit.assertEqual(obj.get('text'), 'John', 'Binding does not updates target property.');
	TKUnit.assertEqual(obj.get('targetProperty'), 'testValue', 'Binding does not updates target property1.');
}

export function test_MoreThanOneBindables_BindToASameSourceAndProperty() {
	const model = new Observable();

	const bindingOptions: BindingOptions = {
		sourceProperty: 'sourceProperty',
		targetProperty: 'targetProperty',
	};

	const obj1 = new Label();
	obj1.bind(bindingOptions, model);

	const obj2 = new Label();
	obj2.bind(bindingOptions, model);

	model.set('sourceProperty', 'testValue');

	TKUnit.assertEqual(obj1.get('targetProperty'), 'testValue', 'Binding does not updates target property for first object.');
	TKUnit.assertEqual(obj2.get('targetProperty'), 'testValue', 'Binding does not updates target property for second object.');
}

class TestClass extends ViewBase {
	private _value: string;
	get value(): string {
		return this._value;
	}
	set value(v: string) {
		if (v === 'invalid') {
			throw new Error('Trying to set invalid value.');
		}
		this._value = v;
	}
}

export function test_WhenBindingSetsInvalidValue_NoExceptionIsThrown() {
	const model = new Observable();

	const options: BindingOptions = {
		sourceProperty: 'value',
		targetProperty: 'value',
	};

	const obj = new TestClass();
	obj.bind(options, model);

	model.set('value', 'valid');
	TKUnit.assert(obj.get('value') === 'valid');

	// Try set invalid value - no exception should be thrown and the value should remain the same.
	model.set('value', 'invalid');
	TKUnit.assert(obj.get('value') === 'valid');
}

export function test_binding_bindingContext_setRootContextFirst() {
	const test = function (views: Array<View>) {
		const rootContext = new Observable();
		rootContext.set('selectedItem', 'item 1');
		views[0].bindingContext = rootContext;

		const stack = <StackLayout>views[1];
		const options: BindingOptions = {
			sourceProperty: 'selectedItem',
			targetProperty: 'bindingContext',
		};
		stack.bind(options);

		TKUnit.assertEqual(stack.bindingContext, 'item 1', 'Initial binding value');
		TKUnit.assertEqual(views[2].bindingContext, 'item 1', 'Initial binding value');

		rootContext.set('selectedItem', 'item 2');

		TKUnit.assertEqual(stack.bindingContext, 'item 2', 'Changed binding value');
		TKUnit.assertEqual(views[2].bindingContext, 'item 2', 'Changed binding value');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_binding_bindingContext_setBindingFirst() {
	const test = function (views: Array<View>) {
		const rootContext = new Observable();
		rootContext.set('selectedItem', 'item 1');

		const stack = <StackLayout>views[1];
		const options: BindingOptions = {
			twoWay: true,
			sourceProperty: 'selectedItem',
			targetProperty: 'bindingContext',
		};
		stack.bind(options);

		views[0].bindingContext = rootContext;

		TKUnit.assertEqual(stack.bindingContext, 'item 1', 'Initial binding value');
		TKUnit.assertEqual(views[2].bindingContext, 'item 1', 'Initial binding value');

		rootContext.set('selectedItem', 'item 2');

		TKUnit.assertEqual(stack.bindingContext, 'item 2', 'Changed binding value');
		TKUnit.assertEqual(views[2].bindingContext, 'item 2', 'Changed binding value');
	};

	helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_Bindable_BindingContext_Number_DoesNotThrow() {
	const obj = new Label();
	obj.bindingContext = 42;
}

export function test_Bindable_BindingContext_Boolean_DoesNotThrow() {
	const obj = new Label();
	obj.bindingContext = true;
}

export function test_Bindable_BindingContext_String_DoesNotThrow() {
	const options: BindingOptions = {
		sourceProperty: 'length',
		targetProperty: 'text',
	};

	const obj = new Label();
	obj.bind(options);
	obj.set('text', 'local');
	obj.bindingContext = 'string';

	TKUnit.assert(obj.get('text') === 6, 'Expected: 6; Actual: ' + obj.get('text'));
}

export function test_getBindableOptionsFromStringFullFormat() {
	const bindingExpression = 'bindProperty, bindProperty * 2, false';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual:' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === false, 'Expected: false, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringShortFormatExpression() {
	const bindingExpression = 'bindProperty * 2';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === '$value', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual: ' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringShortFormatProperty() {
	const bindingExpression = 'bindProperty';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === undefined, 'Expected: null, Actual: ' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringTwoParamsFormat() {
	const bindingExpression = 'bindProperty, bindProperty * 2';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual:' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringFullNamedFormat() {
	const bindingExpression = 'bindProperty, expression = bindProperty * 2, twoWay = false';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual:' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === false, 'Expected: false, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringShortNamedFormatExpression() {
	const bindingExpression = 'sourceProperty = bindProperty, expression = bindProperty * 2';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual: ' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringShortNamedFormatProperty() {
	const bindingExpression = 'sourceProperty = bindProperty';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);
	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === undefined, 'Expected: null, Actual: ' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindableOptionsFromStringTwoParamsNamedFormat() {
	const bindingExpression = 'bindProperty, expression = bindProperty * 2';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assert(bindOptions.sourceProperty === 'bindProperty', 'Expected: bindProperty, Actual: ' + bindOptions.sourceProperty);
	TKUnit.assert(bindOptions.targetProperty === 'targetBindProperty', 'Expected: targetBindProperty, Actual: ' + bindOptions.targetProperty);
	TKUnit.assert(bindOptions.expression === 'bindProperty * 2', 'Expected: bindProperty * 2, Actual:' + bindOptions.expression);
	TKUnit.assert(bindOptions.twoWay === true, 'Expected: true, Actual: ' + bindOptions.twoWay);
}

export function test_getBindingOptionsFromStringWithFunctionWitnMoreParams() {
	const bindingExpression = 'bindProperty, converter(bindProperty, param1)';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assertEqual(bindOptions.sourceProperty, 'bindProperty');
	TKUnit.assertEqual(bindOptions.targetProperty, 'targetBindProperty');
	TKUnit.assertEqual(bindOptions.expression, 'converter(bindProperty, param1)');
	TKUnit.assertEqual(bindOptions.twoWay, true);
}

export function test_getBindingOptionsFromStringWithFunctionArrayParams() {
	const bindingExpression = 'bindProperty, converter(bindProperty, [param1, param2])';
	const bindOptions = bindingBuilder.getBindingOptions('targetBindProperty', bindingExpression);

	TKUnit.assertEqual(bindOptions.sourceProperty, 'bindProperty');
	TKUnit.assertEqual(bindOptions.targetProperty, 'targetBindProperty');
	TKUnit.assertEqual(bindOptions.expression, 'converter(bindProperty, [param1, param2])');
	TKUnit.assertEqual(bindOptions.twoWay, true);
}

export function test_bindingToNestedPropertyWithValueSyntax() {
	const bindingSource = new Observable();
	bindingSource.set('testProperty', 'testValue');

	const testElement = new Label();
	testElement.bind(
		{
			sourceProperty: '$value.testProperty',
			targetProperty: 'targetPropertyName',
		},
		bindingSource
	);

	TKUnit.assertEqual(testElement.get('targetPropertyName'), 'testValue');
	TKUnit.assertTrue(bindingSource['$value'] === undefined, 'We should not add $value to bindingSource.');
}

export function test_TwoElementsBindingToSameBindingContext() {
	const testFunc = function (page: Page) {
		const upperStackLabel = <Label>page.getViewById('upperStackLabel');
		const label1 = <Label>page.getViewById('label1');
		const label2 = <Label>page.getViewById('label2');

		TKUnit.assertEqual(upperStackLabel.text, label1.text, 'label1');
		TKUnit.assertEqual(upperStackLabel.text, label2.text, 'label2');
	};
	helper.navigateToModuleAndRunTest('ui/core/bindable/bindingContext_testPage', null, testFunc);
}

export function test_BindingContext_NavigatingForwardAndBack() {
	const expectedValue = 'Tralala';
	const testFunc = function (page: Page) {
		const innerTestFunc = function (childPage: Page) {
			const testTextField: TextField = <TextField>childPage.getViewById('testTextField');
			testTextField.text = expectedValue;
		};
		helper.navigateToModuleAndRunTest('ui/core/bindable/bindingContext_testPage2', page.bindingContext, innerTestFunc);
		const testLabel: Label = <Label>page.getViewById('testLabel');
		TKUnit.assertEqual(testLabel.text, expectedValue);
	};

	helper.navigateToModuleAndRunTest('ui/core/bindable/bindingContext_testPage1', null, testFunc);
}

export function test_BindingToSource_FailsAfterBindingContextChange() {
	const createLabel = function () {
		const label = new Label();

		return label;
	};
	const labelViewModel = new Observable();
	const expectedValue = 'testValue';
	labelViewModel.set('testProperty', expectedValue);

	const testFunc = function (views: Array<View>) {
		const testLabel = <Label>views[0];
		testLabel.bind({ sourceProperty: 'testProperty', targetProperty: 'text' }, labelViewModel);

		const page = <Page>views[1];
		page.bindingContext = new Observable();

		TKUnit.assertEqual(testLabel.text, expectedValue);
	};

	helper.buildUIAndRunTest(createLabel(), testFunc);
}

export function test_BindingToParentView_ShouldNotLeaveGarbageInViewModel() {
	const createStack = function () {
		const stack = new StackLayout();
		const label = new Label();
		stack.addChild(label);

		return stack;
	};
	const stackViewModel = new Observable();
	const expectedValue = 'testValue';
	stackViewModel.set('testProperty', expectedValue);

	const testFunc = function (views: Array<View>) {
		let testStack = <StackLayout>views[0];
		testStack.bindingContext = stackViewModel;

		let testLabel = <Label>testStack.getChildAt(0);
		testLabel.bind({ sourceProperty: '$parent.testProperty', targetProperty: 'text', expression: '$parent.testProperty' });

		TKUnit.assertEqual(testLabel.text, expectedValue);
		TKUnit.assertTrue(stackViewModel['$parent'] === undefined, "stackViewModel['$parent'] should be removed from parent binding context.");
		TKUnit.assertTrue(testLabel.bindingContext['$parent'] === undefined, "testLabel.bindingContext['$parent'] should be removed from parent binding context.");
	};

	helper.buildUIAndRunTest(createStack(), testFunc);
}

export function test_BindingToParentsView_ShouldNotLeaveGarbageInViewModel() {
	const createStack = function () {
		const stack = new StackLayout();
		const label = new Label();
		stack.addChild(label);

		return stack;
	};
	const stackViewModel = new Observable();
	const expectedValue = 'testValue';
	stackViewModel.set('testProperty', expectedValue);

	const testFunc = function (views: Array<View>) {
		let testStack = <StackLayout>views[0];
		testStack.bindingContext = stackViewModel;

		let testLabel = <Label>testStack.getChildAt(0);
		testLabel.bind({ sourceProperty: "$parents['StackLayout'].testProperty", targetProperty: 'text', expression: "$parents['StackLayout'].testProperty" });

		TKUnit.assertEqual(testLabel.text, expectedValue);
		TKUnit.assertTrue(stackViewModel['$parent'] === undefined, "stackViewModel['$parent'] should be removed from parent binding context.");
		TKUnit.assertTrue(testLabel.bindingContext['$parents'] === undefined, "testLabel.bindingContext['$parents'] should be removed from parent binding context.");
	};

	helper.buildUIAndRunTest(createStack(), testFunc);
}

export function test_BindingToDictionaryAtAppLevel() {
	const createLabel = function () {
		const label = new Label();

		return label;
	};
	const pageViewModel = new Observable();
	const testPropertyName = 'testValue';
	const expectedValue = 'expectedValue';
	pageViewModel.set('testProperty', testPropertyName);
	const dict = {};
	dict[testPropertyName] = expectedValue;
	appModule.getResources()['dict'] = dict;

	const testFunc = function (views: Array<View>) {
		const testLabel = <Label>views[0];
		testLabel.bind({ sourceProperty: 'testProperty', targetProperty: 'text', expression: 'dict[testProperty]' });

		const page = <Page>views[1];
		page.bindingContext = pageViewModel;

		TKUnit.assertEqual(testLabel.text, expectedValue);
		TKUnit.assertTrue(testLabel.bindingContext['dict'] === undefined, 'BindingContext should not contain properties from application resources.');
	};

	helper.buildUIAndRunTest(createLabel(), testFunc);
}

export function test_BindingConverterCalledEvenWithNullValue() {
	const createLabel = function () {
		const label = new Label();

		return label;
	};
	const pageViewModel = new Observable();
	const testPropertyValue = null;
	const expectedValue = 'collapsed';
	pageViewModel.set('testProperty', testPropertyValue);
	appModule.getResources()['converter'] = function (value) {
		if (value) {
			return 'visible';
		} else {
			return 'collapsed';
		}
	};

	const testFunc = function (views: Array<View>) {
		const testLabel = <Label>views[0];
		testLabel.bind({ sourceProperty: 'testProperty', targetProperty: 'text', expression: 'testProperty | converter' });

		const page = <Page>views[1];
		page.bindingContext = pageViewModel;

		TKUnit.assertEqual(testLabel.text, expectedValue);
	};

	helper.buildUIAndRunTest(createLabel(), testFunc);
}

export function test_UpdatingNestedPropertyViaBinding() {
	const expectedValue1 = 'Alabala';
	const expectedValue2 = 'Tralala';
	const viewModel = new Observable();
	const parentViewModel = new Observable();
	viewModel.set('parentView', parentViewModel);
	parentViewModel.set('name', expectedValue1);

	const testElement = new Label();

	testElement.bind(
		{
			sourceProperty: 'parentView.name',
			targetProperty: 'text',
			twoWay: true,
		},
		viewModel
	);

	const testElement2 = new Label();

	testElement2.bind(
		{
			sourceProperty: 'parentView.name',
			targetProperty: 'text',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(testElement.get('text'), expectedValue1);

	testElement.set('text', expectedValue2);

	TKUnit.assertEqual(parentViewModel.get('name'), expectedValue2);
	TKUnit.assertEqual(testElement2.get('text'), expectedValue2);
}

class Person extends Observable {
	private _firstName: string;
	private _lastName: string;

	public get FirstName(): string {
		return this._firstName;
	}

	public set FirstName(value: string) {
		if (this._firstName !== value) {
			this._firstName = value;
			this.notifyPropertyChange('FirstName', value);
		}
	}

	public get LastName(): string {
		return this._lastName;
	}

	public set LastName(value: string) {
		if (this._lastName !== value) {
			this._lastName = value;
			this.notifyPropertyChange('LastName', value);
		}
	}
}

class Activity extends Observable {
	private _text: string;
	private _owner: Person;

	public get Text(): string {
		return this._text;
	}

	public set Text(value: string) {
		if (this._text !== value) {
			this._text = value;
			this.notifyPropertyChange('Text', value);
		}
	}

	public get Owner(): Person {
		return this._owner;
	}

	public set Owner(value: Person) {
		if (this._owner !== value) {
			this._owner = value;
			this.notifyPropertyChange('Owner', value);
		}
	}

	constructor(text: string, firstName: string, lastName: string) {
		super();
		this._text = text;
		const owner = new Person();
		owner.FirstName = firstName;
		owner.LastName = lastName;
		this.Owner = owner;
	}
}

export function test_NestedPropertiesBinding() {
	const expectedValue = 'Default Text';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedValue, 'Default First Name', 'Default Last Name'));

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.Text',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(target1.get('targetProperty'), expectedValue);

	const newExpectedValue = 'Alabala';
	const act = new Activity(newExpectedValue, 'Default First Name', 'Default Last Name');

	viewModel.set('activity', act);

	TKUnit.assertEqual(target1.get('targetProperty'), newExpectedValue);
}

export function test_WrongNestedPropertiesBinding() {
	const expectedValue = 'Default Text';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedValue, 'Default First Name', 'Default Last Name'));
	let errorMessage;
	let traceWriter = {
		write: function (message, category, type?) {
			errorMessage = message;
		},
	};
	Trace.addWriter(traceWriter);

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertNotEqual(errorMessage, undefined);
	Trace.removeWriter(traceWriter);
}

export function test_NestedPropertiesBindingTwoTargets() {
	const expectedText = 'Default Text';
	const expectedFirstName = 'Default First Name';
	const expectedLastName = 'Default Last Name';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedText, expectedFirstName, expectedLastName));

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.Text',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'activity.Owner.FirstName',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(target1.get('targetProperty'), expectedText);
	TKUnit.assertEqual(target2.get('targetProp'), expectedFirstName);

	const newExpectedText = 'Alabala';
	const newExpectedFirstName = 'First Tralala';
	const newExpectedLastName = 'Last Tralala';
	const act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

	viewModel.set('activity', act);

	TKUnit.assertEqual(target1.get('targetProperty'), newExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), newExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndSecondChange() {
	const expectedText = 'Default Text';
	const expectedFirstName = 'Default First Name';
	const expectedLastName = 'Default Last Name';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedText, expectedFirstName, expectedLastName));

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.Text',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'activity.Owner.FirstName',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(target1.get('targetProperty'), expectedText);
	TKUnit.assertEqual(target2.get('targetProp'), expectedFirstName);

	const newExpectedText = 'Alabala';
	const newExpectedFirstName = 'First Tralala';
	const newExpectedLastName = 'Last Tralala';
	const act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

	viewModel.set('activity', act);

	TKUnit.assertEqual(target1.get('targetProperty'), newExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), newExpectedFirstName);

	const secondExpectedText = 'Second expected text';
	const secondExpectedFirstName = 'Second expected first name';
	const secondExpectedLastName = 'Second expected last name';
	const act1 = new Activity(secondExpectedText, secondExpectedFirstName, secondExpectedLastName);

	viewModel.set('activity', act1);

	TKUnit.assertEqual(target1.get('targetProperty'), secondExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), secondExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndRegularChange() {
	const expectedText = 'Default Text';
	const expectedFirstName = 'Default First Name';
	const expectedLastName = 'Default Last Name';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedText, expectedFirstName, expectedLastName));

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.Text',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'activity.Owner.FirstName',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(target1.get('targetProperty'), expectedText);
	TKUnit.assertEqual(target2.get('targetProp'), expectedFirstName);

	const newExpectedText = 'Alabala';
	const newExpectedFirstName = 'First Tralala';
	const newExpectedLastName = 'Last Tralala';
	const act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

	viewModel.set('activity', act);

	TKUnit.assertEqual(target1.get('targetProperty'), newExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), newExpectedFirstName);

	const newAct = viewModel.get('activity');
	const secondExpectedText = 'Second expected text';
	newAct.Text = secondExpectedText;
	const secondExpectedFirstName = 'Second expected First Name';
	newAct.Owner.FirstName = secondExpectedFirstName;

	TKUnit.assertEqual(target1.get('targetProperty'), secondExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), secondExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndReplacingSomeNestedObject() {
	const expectedText = 'Default Text';
	const expectedFirstName = 'Default First Name';
	const expectedLastName = 'Default Last Name';
	const viewModel = new Observable();
	viewModel.set('activity', new Activity(expectedText, expectedFirstName, expectedLastName));

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'activity.Text',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		viewModel
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'activity.Owner.FirstName',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		viewModel
	);

	TKUnit.assertEqual(target1.get('targetProperty'), expectedText);
	TKUnit.assertEqual(target2.get('targetProp'), expectedFirstName);

	const newExpectedText = 'Alabala';
	const newExpectedFirstName = 'First Tralala';
	const newExpectedLastName = 'Last Tralala';
	const act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

	viewModel.set('activity', act);

	TKUnit.assertEqual(target1.get('targetProperty'), newExpectedText);
	TKUnit.assertEqual(target2.get('targetProp'), newExpectedFirstName);

	const secondExpectedFirstName = 'Second expected first name';
	const newPerson = new Person();
	newPerson.FirstName = secondExpectedFirstName;
	newPerson.LastName = 'Last Name';

	const act1 = viewModel.get('activity');
	(<Activity>act1).Owner = newPerson;

	TKUnit.assertEqual(target2.get('targetProp'), secondExpectedFirstName);
}

export function test_NullSourcePropertyShouldNotCrash() {
	const expectedValue = 'Expected Value';
	const target = new Label();
	const convFunc = function (value) {
		return value + 'Converted';
	};
	const model = new Observable();
	model.set('field', expectedValue);
	model.set('convFunc', convFunc);
	target.bind(
		{
			sourceProperty: null,
			targetProperty: 'targetProp',
			expression: 'convFunc(field)',
		},
		model
	);

	TKUnit.assertEqual(target.get('targetProp'), convFunc(expectedValue));
}

export function test_BindingContextOfAChildElementIsNotOverwrittenBySettingTheBindingContextOfPage() {
	let testFinished = false;

	let page = helper.getCurrentPage();
	let child = new StackLayout();
	let childModel = new Observable();
	child.bindingContext = childModel;
	TKUnit.assertEqual(child.bindingContext, childModel);

	child.on(StackLayout.loadedEvent, (args) => {
		TKUnit.assertEqual(child.bindingContext, childModel);
		page.bindingContext = new Observable();
		TKUnit.assertEqual(child.bindingContext, childModel);
		child.off(StackLayout.loadedEvent);
		testFinished = true;
	});

	page.content = child;
	TKUnit.waitUntilReady(() => testFinished);
}

export function test_BindingHitsGetterTooManyTimes() {
	let counter = 0;

	class Dummy extends Observable {
		private _dummyProperty: string;

		public get dummyProperty(): string {
			counter++;

			return this._dummyProperty;
		}

		public set dummyProperty(value: string) {
			if (this._dummyProperty !== value) {
				this._dummyProperty = value;
				this.notifyPropertyChange('dummyProperty', value);
			}
		}
	}

	const model = new Dummy();
	model.dummyProperty = 'OPA';

	const bindableObj = new Label();

	bindableObj.bind({ sourceProperty: 'dummyProperty', targetProperty: 'dummyTarget' }, model);

	TKUnit.assertEqual(counter, 1, 'Property getter should be hit only once!');
}

export function test_SupportFunctionsInExpressions() {
	const model = fromObject({
		anyColor: 'red',
		isVisible: function () {
			return this.get('anyColor') === 'red';
		},
	});

	const bindableObj = new Label();

	bindableObj.bind(
		{
			sourceProperty: '$value',
			targetProperty: 'text',
			expression: "isVisible() ? 'visible' : 'collapsed'",
		},
		model
	);

	model.set('anyColor', 'blue');

	TKUnit.assertEqual(bindableObj.get('text'), 'collapsed', 'When anyColor is blue test property should be collapsed.');

	model.set('anyColor', 'red');

	TKUnit.assertEqual(bindableObj.get('text'), 'visible', 'When anyColor is red test property should be visible.');
}

export function test_$ValueSupportWithinExpression() {
	const model = fromObject({
		anyColor: 'red',
		isVisible: function () {
			return this.get('anyColor') === 'red';
		},
	});

	const bindableObj = new Label();

	bindableObj.bind(
		{
			sourceProperty: '$value',
			targetProperty: 'text',
			expression: "$value.anyColor === 'red' ? 'red' : 'blue'",
		},
		model
	);

	model.set('anyColor', 'blue');

	TKUnit.assertEqual(bindableObj.get('text'), 'blue', 'When anyColor is blue test property should be blue too.');

	model.set('anyColor', 'red');

	TKUnit.assertEqual(bindableObj.get('text'), 'red', 'When anyColor is red test property should be red too.');
	TKUnit.assertTrue(model['$value'] === undefined, 'We should not add $value to binding context.');
}

class DummyNestedClass extends Observable {
	private _secondsobject: number;
	public get secondsobject(): number {
		return this._secondsobject;
	}
	public set secondsobject(value: number) {
		if (this._secondsobject !== value) {
			this._secondsobject = value;
			this.notifyPropertyChange('secondsobject', value);
		}
	}
}

class DummyClassWithSamePropertyNames extends Observable {
	private _seconds: number;
	private _secondsobject: DummyNestedClass;
	public get seconds(): number {
		return this._seconds;
	}
	public set seconds(value: number) {
		if (this._seconds !== value) {
			this._seconds = value;
			this.notifyPropertyChange('seconds', value);
		}
	}

	public get secondsobject(): DummyNestedClass {
		return this._secondsobject;
	}
	public set secondsobject(value: DummyNestedClass) {
		if (this._secondsobject !== value) {
			this._secondsobject = value;
			this.notifyPropertyChange('secondsobject', value);
		}
	}
}

class DummyModel extends Observable {
	private _item: DummyClassWithSamePropertyNames;
	public get item(): DummyClassWithSamePropertyNames {
		return this._item;
	}

	public set item(value: DummyClassWithSamePropertyNames) {
		if (this._item !== value) {
			this._item = value;
			this.notifyPropertyChange('item', value);
		}
	}
}

export function test_BindingToPropertiesWithSameNames() {
	const model = new DummyModel();
	model.item = new DummyClassWithSamePropertyNames();
	model.item.seconds = 1;
	const secondsobject = new DummyNestedClass();
	secondsobject.secondsobject = 1;
	model.item.secondsobject = secondsobject;

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'item.seconds',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		model
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'item.secondsobject.secondsobject',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		model
	);

	model.item.set('seconds', model.item.seconds + 1);
	let newValue = (<any>model).item.secondsobject.secondsobject + 1;
	model.item.secondsobject.set('secondsobject', newValue);

	TKUnit.assertEqual(target1.get('targetProperty'), model.item.get('seconds'));
	TKUnit.assertEqual(target2.get('targetProp'), newValue);

	// calling this two times in order to ensure that adding and removing weak event listeners is working fine.
	newValue = model.item.secondsobject.secondsobject + 1;
	model.item.secondsobject.set('secondsobject', newValue);

	TKUnit.assertEqual(target1.get('targetProperty'), model.item.get('seconds'));
	TKUnit.assertEqual(target2.get('targetProp'), newValue);
}

export function test_BindingToPropertiesWithSameNamesSecondCase() {
	const model = new DummyModel();
	model.item = new DummyClassWithSamePropertyNames();
	model.item.seconds = 1;
	const secondsobject = new DummyNestedClass();
	secondsobject.secondsobject = 1;
	model.item.secondsobject = secondsobject;

	const target1 = new Label();
	target1.bind(
		{
			sourceProperty: 'item.seconds',
			targetProperty: 'targetProperty',
			twoWay: true,
		},
		model
	);

	const target2 = new Label();
	target2.bind(
		{
			sourceProperty: 'item.secondsobject.secondsobject',
			targetProperty: 'targetProp',
			twoWay: true,
		},
		model
	);

	model.item.set('seconds', model.item.seconds + 1);
	let newValue = model.item.secondsobject.secondsobject + 1;
	model.item.set('secondsobject', { secondsobject: newValue });

	TKUnit.assertEqual(target1.get('targetProperty'), model.item.get('seconds'));
	TKUnit.assertEqual(target2.get('targetProp'), newValue);

	// calling this two times in order to ensure that adding and removing weak event listeners is working fine.
	newValue = model.item.secondsobject.secondsobject + 1;
	model.item.set('secondsobject', { secondsobject: newValue });

	TKUnit.assertEqual(target1.get('targetProperty'), model.item.get('seconds'));
	TKUnit.assertEqual(target2.get('targetProp'), newValue);
}

class RelatedPropsClass extends Observable {
	private _prop1: boolean;
	private _prop2: string;
	public get prop1(): boolean {
		return this._prop1;
	}
	public set prop1(value: boolean) {
		if (this._prop1 !== value) {
			this._prop1 = value;
			this.notifyPropertyChange('prop1', value);
		}
	}

	public get prop2(): string {
		this.prop1 = !this._prop1;
		this.notifyPropertyChange('prop2', this._prop2);

		return this._prop2;
	}

	public set prop2(value: string) {
		if (this._prop2 !== value) {
			this._prop2 = value;
			this.notifyPropertyChange('prop2', value);
		}
	}
}

export function test_BindingToRelatedProps() {
	let model = new RelatedPropsClass();
	model.prop1 = false;
	model.prop2 = 'Alabala';

	let target1 = new Label();
	target1.bind({ sourceProperty: 'prop1', targetProperty: 'targetProp1' }, model);

	let target2 = new Label();
	target2.bind({ sourceProperty: 'prop2', targetProperty: 'targetProp2' }, model);

	model.prop2 = 'Tralala';

	TKUnit.assertEqual(target2.get('targetProp2'), 'Tralala');
}

export function test_only_Bindable_BindingContext_Null_DoesNotThrow() {
	const options: BindingOptions = {
		sourceProperty: 'a.b',
		targetProperty: 'text',
	};
	const obj = new Label();
	obj.bind(options);
	obj.bindingContext = fromObject({ a: 'b' });
	obj.bindingContext = null;
}

export function test_Observable_from_nested_json_binds_correctly() {
	let expectedValue = 'Test';
	let model = fromObjectRecursive({
		firstObject: {
			secondObject: {
				dummyProperty: 'text',
			},
		},
	});

	const obj = new Label();
	obj.bind(
		{
			sourceProperty: 'firstObject.secondObject.dummyProperty',
			targetProperty: 'text',
		},
		model
	);

	model.get('firstObject').get('secondObject').set('dummyProperty', expectedValue);

	TKUnit.assertEqual(obj.get('text'), expectedValue);
}

export function test_Observable_from_nested_json_binds_correctly_when_upper_object_is_changed() {
	let expectedValue = 'Test';
	let model = fromObjectRecursive({
		firstObject: {
			secondObject: {
				dummyProperty: 'text',
			},
		},
	});

	const obj = new Label();
	obj.bind(
		{
			sourceProperty: 'firstObject.secondObject.dummyProperty',
			targetProperty: 'text',
		},
		model
	);

	model.get('firstObject').set('secondObject', fromObject({ dummyProperty: expectedValue }));

	TKUnit.assertEqual(obj.get('text'), expectedValue);
}

export function test_BindingToBindingContextProperty_ShouldUseNewContext() {
	let stackLayout = new StackLayout();
	let label = new Label();
	stackLayout.addChild(label);

	label.bind({
		sourceProperty: 'context',
		targetProperty: 'bindingContext',
	});

	label.bind({
		sourceProperty: 'text',
		targetProperty: 'text',
	});

	let testBindingContext = fromObjectRecursive({
		context: {
			text: 'Alabala',
		},
	});

	stackLayout.bindingContext = testBindingContext;

	(<any>testBindingContext).context.text = 'Tralala';

	TKUnit.assertEqual(label.text, 'Tralala');
}
