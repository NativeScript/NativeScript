import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page';
import { BindingOptions } from '@nativescript/core/ui/core/bindable';
import { Observable, EventData, PropertyChangeData } from '@nativescript/core';
import { Color } from '@nativescript/core/color';
import { isIOS } from '@nativescript/core/platform';

// >> article-require-slider
import { Slider } from '@nativescript/core/ui/slider';
// << article-require-slider

// ### Binding the Progress and Slider value properties to a observable view-model property.

// >> article-binding-slider-properties
// function pageLoaded(args) {
//   var page = args.object;
//   var obj = new Observable();
//   obj.set("someProperty", 42);
//   page.bindingContext = obj;
// }
// exports.pageLoaded = pageLoaded;
// << article-binding-slider-properties

interface SliderValues {
	min?: number;
	max?: number;
	value?: number;
}

const TEST_VALUE = 50;
const MAX_TEST_VALUE = 70;
const MIN_TEST_VALUE = 10;
const VALUE_EVENT = 'valueChange';
const MIN_VALUE_EVENT = 'minValueChange';
const MAX_VALUE_EVENT = 'maxValueChange';

function attachValueChangedEvents(slider: Slider, callback: (data: EventData) => void) {
	slider.on(VALUE_EVENT, callback);
	slider.on(MIN_VALUE_EVENT, callback);
	slider.on(MAX_VALUE_EVENT, callback);
}

function detachValueChangedEvents(slider: Slider) {
	slider.off(VALUE_EVENT);
	slider.off(MIN_VALUE_EVENT);
	slider.off(MAX_VALUE_EVENT);
}

export function test_recycling() {
	helper.nativeView_recycling_test(() => new Slider());
}

export function test_set_TNS_value_updates_native_value() {
	// >> article-creating-slider
	const slider = new Slider();
	// << article-creating-slider

	function testAction(views: Array<View>) {
		slider.value = TEST_VALUE;
		TKUnit.assertEqual(getNativeValue(slider), TEST_VALUE, 'Native value is different from TNS value.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_native_value_updates_TNS_value() {
	const slider = new Slider();
	function testAction(views: Array<View>) {
		setNativeValue(slider, TEST_VALUE);
		TKUnit.assertEqual(slider.value, TEST_VALUE, 'Native value is different from TNS value.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_native_value_triggers_propertyChanged() {
	const slider = new Slider();
	function testAction(views: Array<View>) {
		let valueChanged = false;
		let allChanges = 0;

		slider.on(VALUE_EVENT, function (data: EventData) {
			allChanges++;
			const propertyData = <PropertyChangeData>data;
			if (propertyData && propertyData.propertyName === 'value' && propertyData.value === TEST_VALUE) {
				valueChanged = true;
			}
		});

		setNativeValue(slider, TEST_VALUE);

		slider.off(VALUE_EVENT);

		TKUnit.assert(valueChanged, 'Property changed for value not called.');
		TKUnit.assertEqual(allChanges, 1, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.
if (isIOS) {
	exports.test_set_color = function () {
		const slider = new Slider();
		slider.color = new Color('red');

		function testAction(views: Array<View>) {
			TKUnit.assertEqual(slider.color.ios.CGColor, slider.ios.thumbTintColor.CGColor, 'slider.color');
		}

		helper.buildUIAndRunTest(slider, testAction);
	};

	exports.test_set_backgroundColor = function () {
		const slider = new Slider();
		slider.backgroundColor = new Color('red');

		function testAction(views: Array<View>) {
			TKUnit.assertEqual((<Color>slider.backgroundColor).ios.CGColor, slider.ios.minimumTrackTintColor.CGColor, 'slider.backgroundColor');
		}

		helper.buildUIAndRunTest(slider, testAction);
	};
}

export function test_default_TNS_values() {
	const slider = new Slider();
	TKUnit.assertEqual(slider.value, 0, 'Default slider.value');
	TKUnit.assertEqual(slider.minValue, 0, 'Default slider.minValue');
	TKUnit.assertEqual(slider.maxValue, 100, 'Default slider.maxValue');
}

export function test_default_native_values() {
	const slider = new Slider();

	function testAction(views: Array<View>) {
		TKUnit.assertEqual(getNativeValue(slider), 0, 'Default native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), 100, 'Default native slider.maxValue');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_values_change_native_values() {
	const slider = new Slider();
	slider.minValue = 0;
	slider.value = 0;
	slider.maxValue = 10;
	function testAction(views: Array<View>) {
		TKUnit.assertEqual(getNativeValue(slider), 0, '1: wrong native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), 10, '1: Wrong native slider.maxValue');

		slider.value = 5;
		TKUnit.assertEqual(getNativeValue(slider), 5, '2: wrong native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), 10, '2: Wrong native slider.maxValue');

		slider.minValue = 10;
		TKUnit.assertEqual(getNativeValue(slider), isIOS ? 10 : 0, '3: wrong native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), isIOS ? 10 : 0, '3: Wrong native slider.maxValue');

		slider.maxValue = 20;
		TKUnit.assertEqual(getNativeValue(slider), isIOS ? 10 : 0, '4: wrong native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), isIOS ? 20 : 10, '4: Wrong native slider.maxValue');

		slider.value = 15;
		TKUnit.assertEqual(getNativeValue(slider), isIOS ? 15 : 5, '5: wrong native slider.value');
		TKUnit.assertEqual(getNativeMaxValue(slider), isIOS ? 20 : 10, '5: Wrong native slider.maxValue');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_min_max_value() {
	const slider = new Slider();
	slider.minValue = MIN_TEST_VALUE;
	slider.maxValue = MAX_TEST_VALUE;
	slider.value = TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_min_value_max() {
	const slider = new Slider();
	slider.minValue = MIN_TEST_VALUE;
	slider.value = TEST_VALUE;
	slider.maxValue = MAX_TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_max_min_value() {
	const slider = new Slider();
	slider.maxValue = MAX_TEST_VALUE;
	slider.minValue = MIN_TEST_VALUE;
	slider.value = TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_max_value_min() {
	const slider = new Slider();
	slider.maxValue = MAX_TEST_VALUE;
	slider.value = TEST_VALUE;
	slider.minValue = MIN_TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_min_max() {
	const slider = new Slider();
	slider.value = TEST_VALUE;
	slider.minValue = MIN_TEST_VALUE;
	slider.maxValue = MAX_TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_max_min() {
	const slider = new Slider();
	slider.value = TEST_VALUE;
	slider.maxValue = MAX_TEST_VALUE;
	slider.minValue = MIN_TEST_VALUE;

	function testAction(views: Array<View>) {
		assertSliderValuesDefault(slider);
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_less_than_min_should_set_value_to_min() {
	const slider = new Slider();

	function testAction(views: Array<View>) {
		slider.value = -10;
		assertSliderValues(slider, { value: 0 });
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_greater_than_max_should_set_value_to_max() {
	const slider = new Slider();

	function testAction(views: Array<View>) {
		slider.maxValue = 10;
		slider.value = 20;
		assertSliderValues(slider, { value: 10 });
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_maxValue_should_adjust_value() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		slider.maxValue = 40;

		TKUnit.assertEqual(slider.maxValue, 40, 'slider.maxValue');
		TKUnit.assertEqual(slider.value, 40, 'slider.value');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_maxValue_should_adjust_value_but_respect_minValue() {
	const slider = new Slider();

	// >> article-setting-slider-values
	slider.maxValue = 120;
	slider.value = 80;
	slider.minValue = 50;
	// << article-setting-slider-values

	function testAction(views: Array<View>) {
		slider.maxValue = 30;
		assertSliderValues(slider, { min: 50, max: 50, value: 50 });
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_minValue_should_adjust_value() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		slider.minValue = 60;
		assertSliderValues(slider, { min: 60, value: 60 });
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_minValue_should_adjust_value_and_maxValue() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		const newMin = 120;
		slider.minValue = newMin;
		assertSliderValues(slider, { min: newMin, max: newMin, value: newMin });
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_minValue_no_adjust() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		const changedProperties = {};
		let allChanges = 0;
		attachValueChangedEvents(slider, (data: PropertyChangeData) => {
			allChanges++;
			changedProperties[data.propertyName] = true;
		});

		// Act
		slider.minValue = 10;
		detachValueChangedEvents(slider);

		// Assert
		TKUnit.assert(changedProperties['minValue'], 'Property changed for minValue not called.');
		TKUnit.assertEqual(allChanges, 1, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_minValue_with_adjust() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		const changedProperties = {};
		let allChanges = 0;
		attachValueChangedEvents(slider, (data: PropertyChangeData) => {
			allChanges++;
			changedProperties[data.propertyName] = true;
		});

		// Act
		slider.minValue = 60;
		detachValueChangedEvents(slider);

		// Assert
		TKUnit.assert(changedProperties['value'], "Property changed for 'value' not called.");
		TKUnit.assert(changedProperties['minValue'], "Property changed for 'minValue' not called.");
		TKUnit.assertEqual(allChanges, 2, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_maxValue_no_adjust() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		const changedProperties = {};
		let allChanges = 0;
		attachValueChangedEvents(slider, (data: PropertyChangeData) => {
			allChanges++;
			changedProperties[data.propertyName] = true;
		});

		// Act
		slider.maxValue = 200;
		detachValueChangedEvents(slider);

		// Assert
		TKUnit.assert(changedProperties['maxValue'], 'Property changed for maxValue not called.');
		TKUnit.assertEqual(allChanges, 1, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_maxValue_with_adjust() {
	const slider = new Slider();
	slider.maxValue = 100;
	slider.value = 50;
	slider.minValue = 0;

	function testAction(views: Array<View>) {
		const changedProperties = {};
		let allChanges = 0;
		attachValueChangedEvents(slider, (data: PropertyChangeData) => {
			allChanges++;
			changedProperties[data.propertyName] = true;
		});

		// Act
		slider.maxValue = 40;
		slider.off(Observable.propertyChangeEvent);

		// Assert
		TKUnit.assert(changedProperties['value'], "Property changed for 'value' not called.");
		TKUnit.assert(changedProperties['maxValue'], "Property changed for 'maxValue' not called.");
		TKUnit.assertEqual(allChanges, 2, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_binding_value_to_model() {
	const slider = new Slider();

	function testAction(views: Array<View>) {
		// >> article-binding-value-property
		const model = new Observable();
		model.set('age', 21);
		const options: BindingOptions = {
			sourceProperty: 'age',
			targetProperty: 'value',
		};
		slider.bind(options, model);
		// slider.value is now 21
		// >> (hide)
		TKUnit.assertEqual(slider.value, 21, 'slider.value');
		// << (hide)
		model.set('age', 22);
		// slider.value is now 22
		// >> (hide)
		TKUnit.assertEqual(slider.value, 22, 'slider.value');
		// << (hide)
		// << article-binding-value-property
	}

	helper.buildUIAndRunTest(slider, testAction);
}

export function test_binding_value_to_bindingContext() {
	const slider = new Slider();

	function testAction(views: Array<View>) {
		const page = <Page>views[1];

		const model = new Observable();
		model.set('age', 21);
		page.bindingContext = model;

		const options: BindingOptions = {
			sourceProperty: 'age',
			targetProperty: 'value',
		};
		slider.bind(options);

		TKUnit.assertEqual(slider.value, 21, 'slider.value');
		model.set('age', 22);
		TKUnit.assertEqual(slider.value, 22, 'slider.value');
	}

	helper.buildUIAndRunTest(slider, testAction);
}

function assertSliderValuesDefault(slider: Slider) {
	return assertSliderValues(slider, { min: MIN_TEST_VALUE, max: MAX_TEST_VALUE, value: TEST_VALUE });
}

function assertSliderValues(slider: Slider, { min, max, value }: SliderValues) {
	// tslint:disable
	min !== undefined && TKUnit.assertEqual(slider.minValue, min, 'slider.minValue');
	max !== undefined && TKUnit.assertEqual(slider.maxValue, max, 'slider.maxValue');
	value !== undefined && TKUnit.assertEqual(slider.value, value, 'slider.value');
	// tslint:enable
}

function getNativeValue(slider: Slider): number {
	if (slider.android) {
		return slider.android.getProgress();
	} else if (slider.ios) {
		return slider.ios.value;
	}
}

function getNativeMaxValue(slider: Slider): number {
	if (slider.android) {
		return slider.android.getMax();
	} else if (slider.ios) {
		return slider.ios.maximumValue;
	}
}

function setNativeValue(slider: Slider, value: number) {
	if (slider.android) {
		const seekBar = <android.widget.SeekBar>slider.android;
		seekBar.setProgress(value);
	} else if (slider.ios) {
		slider.ios.value = value;

		// setting value trough code does not send notification, so simulate that manually.
		slider.ios.sendActionsForControlEvents(UIControlEvents.ValueChanged);
	}
}
