import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { Switch, Color, Observable, PropertyChangeData, EventData, View, BindingOptions } from '@nativescript/core';

// ### Binding the Switch checked property and Button isEanbled property to a observable view-model property.

// >> article-binding-switch-property
export function pageLoaded(args) {
	var page = args.object;
	var obj = new Observable();
	obj.set('someProperty', false);
	page.bindingContext = obj;
}
// << article-binding-switch-property

export function test_recycling() {
	helper.nativeView_recycling_test(() => new Switch());
}

export function test_default_TNS_values() {
	// >> article-create-switch
	var mySwitch = new Switch();
	// << article-create-switch
	TKUnit.assertEqual(mySwitch.checked, false, 'Default switch.checked');
}

export function test_default_native_values() {
	var mySwitch = new Switch();

	function testAction(views: Array<View>) {
		TKUnit.assertEqual(getNativeValue(mySwitch), false, 'Default native switch.checked');
	}

	helper.buildUIAndRunTest(mySwitch, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.

export function test_set_color() {
	if (__APPLE__) {
		var mySwitch = new Switch();
		mySwitch.color = new Color('red');

		function testAction(views: Array<View>) {
			TKUnit.assert(mySwitch.color.ios.isEqual(mySwitch.ios.thumbTintColor), 'mySwitch.color');
		}

		helper.buildUIAndRunTest(mySwitch, testAction);
	}
}

export function test_set_backgroundColor() {
	if (__APPLE__) {
		var mySwitch = new Switch();
		mySwitch.backgroundColor = new Color('red');

		function testAction(views: Array<View>) {
			TKUnit.assert(CGColorEqualToColor((<Color>mySwitch.backgroundColor).ios.CGColor, mySwitch.ios.onTintColor.CGColor), 'mySwitch.color');
		}

		helper.buildUIAndRunTest(mySwitch, testAction);
	}
}

export function test_set_TNS_checked_updates_native_checked() {
	var mySwitch = new Switch();
	function testAction(views: Array<View>) {
		// >> article-setting-checked-property
		mySwitch.checked = true;
		// << article-setting-checked-property
		TKUnit.assertEqual(getNativeValue(mySwitch), true, 'Native checked is different from TNS checked.');
	}

	helper.buildUIAndRunTest(mySwitch, testAction);
}

export function test_set_native_checked_updates_TNS_checked() {
	var mySwitch = new Switch();
	function testAction(views: Array<View>) {
		setNativeValue(mySwitch, true);
		TKUnit.assertEqual(mySwitch.checked, true, 'Native checked is different from TNS checked.');
	}

	helper.buildUIAndRunTest(mySwitch, testAction);
}

export function test_set_native_checked_triggers_propertyChanged() {
	var mySwitch = new Switch();
	function testAction(views: Array<View>) {
		var checkedChanged = false;
		var allChanges = 0;
		mySwitch.on('checkedChange', function (data: EventData) {
			allChanges++;
			var propertyData = <PropertyChangeData>data;
			if (propertyData && propertyData.propertyName === 'checked' && propertyData.value === true) {
				checkedChanged = true;
			}
		});

		setNativeValue(mySwitch, true);

		mySwitch.off('checkedChange');

		TKUnit.assert(checkedChanged, 'Property changed for checked not called.');
		TKUnit.assertEqual(allChanges, 1, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(mySwitch, testAction);
}

export function test_binding_value_to_model() {
	var mySwitch = new Switch();

	function testAction(views: Array<View>) {
		// >> aricle-binding-checked-property
		var model = new Observable();
		model.set('enabled', true);
		var options: BindingOptions = {
			sourceProperty: 'enabled',
			targetProperty: 'checked',
		};
		mySwitch.bind(options, model);
		// mySwitch.checked is now true
		// >> (hide)
		TKUnit.assertEqual(mySwitch.checked, true, 'mySwitch.checked');
		// << (hide)
		model.set('enabled', false);
		// mySwitch.checked is now false
		// >> (hide)
		TKUnit.assertEqual(mySwitch.checked, false, 'mySwitch.checked');
		// << (hide)
		// << aricle-binding-checked-property
	}

	helper.buildUIAndRunTest(mySwitch, testAction);
}

function getNativeValue(mySwitch: Switch): boolean {
	if (__ANDROID__) {
		const nativeView: android.widget.Switch = mySwitch.nativeViewProtected;

		return nativeView.isChecked();
	} else if (mySwitch.ios) {
		return mySwitch.ios.on;
	}
}

function setNativeValue(mySwitch: Switch, value: boolean) {
	if (__ANDROID__) {
		const nativeView: android.widget.Switch = mySwitch.nativeViewProtected;
		nativeView.setChecked(value);
	} else if (mySwitch.ios) {
		mySwitch.ios.on = value;

		// setting value trough code does not send notification, so simulate that manually.
		mySwitch.ios.sendActionsForControlEvents(UIControlEvents.ValueChanged);
	}
}
