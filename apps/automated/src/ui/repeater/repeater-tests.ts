import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { Application, Label, Page, StackLayout, WrapLayout, LayoutBase, View, GestureTypes, Repeater, ObservableArray } from '@nativescript/core';

var FEW_ITEMS = [0, 1, 2];
var MANY_ITEMS = [];
for (var i = 0; i < 100; i++) {
	MANY_ITEMS[i] = i;
}

export function test_recycling() {
	const setters = new Map<string, StackLayout>();
	setters.set('itemsLayout', new StackLayout());
	helper.nativeView_recycling_test(() => new Repeater(), null, null, setters);
}

export function test_set_items_to_array_loads_all_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		// >> article-repeater-with-array
		var colors = ['red', 'green', 'blue'];
		repeater.items = colors;
		// << article-repeater-with-array

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assert(getChildAtText(repeater, 0) === 'red', 'Item not created for index 0');
		TKUnit.assert(getChildAtText(repeater, 1) === 'green', 'Item not created for index 1');
		TKUnit.assert(getChildAtText(repeater, 2) === 'blue', 'Item not created for index 2');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_items_to_array_creates_views() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.items = FEW_ITEMS;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_refresh_after_adding_items_to_array_loads_new_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		var colors = ['red', 'green', 'blue'];
		repeater.items = colors;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), colors.length, 'views count.');
		// >> artcle-array-push-element
		colors.push('yellow');
		// Manually trigger the update so that the new color is shown.
		repeater.refresh();
		// << artcle-array-push-element
		// TKUnit.wait(ASYNC);
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), colors.length, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_refresh_reloads_all_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		var testStarted = false;

		var itemsToBind = <Array<any>>FEW_ITEMS;

		repeater.items = itemsToBind;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		testStarted = true;

		itemsToBind[0] = 'red';
		itemsToBind[1] = 'green';
		itemsToBind[2] = 'blue';

		repeater.refresh();

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assert(getChildAtText(repeater, 0) === 'red', 'Item not created for index 0');
		TKUnit.assert(getChildAtText(repeater, 1) === 'green', 'Item not created for index 1');
		TKUnit.assert(getChildAtText(repeater, 2) === 'blue', 'Item not created for index 2');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_null_clears_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.items = FEW_ITEMS;
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, 'views count.');

		repeater.items = null;
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 0, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itemsLayout_accepted() {
	// >> article-repeater-layout
	var repeater = new Repeater();
	var stackLayout = new StackLayout();
	stackLayout.orientation = 'horizontal';
	repeater.itemsLayout = stackLayout;
	// << article-repeater-layout

	function testAction(views: Array<View>) {
		repeater.items = FEW_ITEMS;
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assert((<StackLayout>repeater.itemsLayout).orientation === 'horizontal', 'views count.');
		TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_undefiend_clears_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.items = FEW_ITEMS;
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, 'views count.');

		repeater.items = undefined;
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 0, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_different_source_loads_new_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.items = [1, 2, 3];
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 3, 'views count.');

		repeater.items = ['a', 'b', 'c', 'd'];
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 4, 'views count.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_items_to_observable_array_loads_all_items() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		// >> article-repeater-observablearray
		var colors = new ObservableArray(['red', 'green', 'blue']);
		repeater.items = colors;
		// << article-repeater-observablearray

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assert(getChildAtText(repeater, 0) === 'red', 'Item not created for index 0');
		TKUnit.assert(getChildAtText(repeater, 1) === 'green', 'Item not created for index 1');
		TKUnit.assert(getChildAtText(repeater, 2) === 'blue', 'Item not created for index 2');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_add_to_observable_array_refreshes_the_Repeater() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		var colors = new ObservableArray(['red', 'green', 'blue']);
		repeater.items = colors;

		TKUnit.assertEqual(getChildrenCount(repeater), 3, 'getChildrenCount');

		// >> article-push-to-observablearray
		colors.push('yellow');
		// The Repeater will be updated automatically.
		// << article-push-to-observablearray
		TKUnit.assertEqual(getChildrenCount(repeater), 4, 'getChildrenCount');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_remove_from_observable_array_refreshes_the_Repeater() {
	var repeater = new Repeater();
	var data = new ObservableArray([1, 2, 3]);

	function testAction(views: Array<View>) {
		repeater.items = data;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 3, 'getChildrenCount');

		data.pop();
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 2, 'getChildrenCount');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_splice_observable_array_refreshes_the_Repeater() {
	var repeater = new Repeater();
	var data = new ObservableArray(['a', 'b', 'c']);

	function testAction(views: Array<View>) {
		repeater.items = data;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 3, 'getChildrenCount');

		// Remove the first 2 elements and add
		data.splice(0, 2, 'd', 'e', 'f');
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 4, 'getChildrenCount');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_usingAppLevelConvertersInRepeaterItems() {
	var repeater = new Repeater();

	var dateConverter = function (value, format) {
		var result = format;
		var day = value.getDate();
		result = result.replace('DD', month < 10 ? '0' + day : day);
		var month = value.getMonth() + 1;
		result = result.replace('MM', month < 10 ? '0' + month : month);
		result = result.replace('YYYY', value.getFullYear());

		return result;
	};

	Application.getResources()['dateConverter'] = dateConverter;

	var data = new ObservableArray();

	data.push({ date: new Date() });

	function testAction(views: Array<View>) {
		repeater.itemTemplate = '<Label id="testLabel" text="{{ date, date | dateConverter(\'DD.MM.YYYY\') }}" />';
		repeater.items = data;

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assertEqual(getChildAtText(repeater, 0), dateConverter(new Date(), 'DD.MM.YYYY'), 'element');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_BindingRepeaterToASimpleArray() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.itemTemplate = '<Label id="testLabel" text="{{ $value }}" />';
		repeater.items = [1, 2, 3];

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assertEqual(getChildAtText(repeater, 0), '1', 'first element text');
		TKUnit.assertEqual(getChildAtText(repeater, 1), '2', 'second element text');
		TKUnit.assertEqual(getChildAtText(repeater, 2), '3', 'third element text');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_ItemTemplateFactoryFunction() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.itemTemplate = () => {
			var label = new Label();
			label.id = 'testLabel';
			label.bind({ sourceProperty: '$value', targetProperty: 'text', twoWay: false });

			return label;
		};
		repeater.items = [1, 2, 3];

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assertEqual(getChildAtText(repeater, 0), '1', 'first element text');
		TKUnit.assertEqual(getChildAtText(repeater, 1), '2', 'second element text');
		TKUnit.assertEqual(getChildAtText(repeater, 2), '3', 'third element text');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export function test_BindingRepeaterToASimpleArrayWithExpression() {
	var repeater = new Repeater();

	function testAction(views: Array<View>) {
		repeater.itemTemplate = '<Label id="testLabel" text="{{ $value, $value + \' some static text\' }}" />';
		repeater.items = [1, 2, 3];

		TKUnit.waitUntilReady(() => repeater.isLayoutValid);

		TKUnit.assertEqual(getChildAtText(repeater, 0), '1 some static text', 'first element text');
		TKUnit.assertEqual(getChildAtText(repeater, 1), '2 some static text', 'second element text');
		TKUnit.assertEqual(getChildAtText(repeater, 2), '3 some static text', 'third element text');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

export var test_RepeaterItemsGestureBindings = function () {
	var testFunc = function (page: Page) {
		var repeater = <Repeater>page.getViewById('repeater');
		var hasObservers = false;
		var eachChildCallback = function (childItem: View) {
			if (childItem instanceof Label) {
				var gestureObservers = childItem.getGestureObservers(GestureTypes.tap);
				hasObservers = gestureObservers ? gestureObservers.length > 0 : false;
			} else if (childItem instanceof LayoutBase) {
				childItem.eachChildView(eachChildCallback);
			}

			return true;
		};

		repeater.eachChildView(eachChildCallback);

		TKUnit.assertEqual(hasObservers, true, 'Every item should have tap observer!');
	};

	helper.navigateToModuleAndRunTest('ui/repeater/repeaterItems-bindingToGestures-page', null, testFunc);
};

export var test_RepeaterItemsParentBindingsShouldWork = function () {
	var testFunc = function (page: Page) {
		var repeater = <Repeater>page.getViewById('repeater');
		var expectedText = page.bindingContext['parentViewProperty'];
		var testPass = false;
		var eachChildCallback = function (childItem: View) {
			if (childItem instanceof Label) {
				testPass = (<Label>childItem).text === expectedText;
				if (testPass === false) {
					return false;
				}
			} else if (childItem instanceof LayoutBase) {
				childItem.eachChildView(eachChildCallback);
			}

			return true;
		};

		repeater.eachChildView(eachChildCallback);

		TKUnit.assertEqual(testPass, true, 'Every item should have text bound to Page binding context!');
	};

	helper.navigateToModuleAndRunTest('ui/repeater/repeaterItems-bindingToGestures-page', null, testFunc);
};

export function test_ChildrenAreNotCreatedUntilTheRepeaterIsLoaded() {
	var repeater = new Repeater();

	repeater.itemsLayout = new WrapLayout();
	TKUnit.assertEqual(getChildrenCount(repeater), 0, 'Repeater should not create its children until loaded.');

	repeater.itemTemplate = '<Label id="testLabel" text="{{ $value, $value + \' some static text\' }}" />';
	TKUnit.assertEqual(getChildrenCount(repeater), 0, 'Repeater should not create its children until loaded.');

	repeater.items = [1, 2, 3];
	TKUnit.assertEqual(getChildrenCount(repeater), 0, 'Repeater should not create its children until loaded.');

	function testAction(views: Array<View>) {
		TKUnit.waitUntilReady(() => repeater.isLayoutValid);
		TKUnit.assertEqual(getChildrenCount(repeater), 3, 'Repeater should have created its children when loaded.');
	}

	helper.buildUIAndRunTest(repeater, testAction);
}

/*
export function test_no_memory_leak_when_items_is_regular_array(done) {
    var createFunc = function (): Repeater {
        var repeater = new Repeater();
        repeater.items = FEW_ITEMS;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    }, done);
}

export function test_no_memory_leak_when_items_is_observable_array(done) {
    // Keep the reference to the observable array to test the weakEventListener
    var colors = new ObservableArray(["red", "green", "blue"]);

    var createFunc = function (): Repeater {
        var repeater = new Repeater();
        repeater.items = colors;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    }, done);
}
*/
function getChildrenCount(repeater: Repeater): number {
	return repeater.itemsLayout.getChildrenCount();
}

function getChildAt(repeater: Repeater, index: number): View {
	return repeater.itemsLayout.getChildAt(index);
}

function getChildAtText(repeater: Repeater, index: number): string {
	return (<Label>getChildAt(repeater, index)).text + '';
}
