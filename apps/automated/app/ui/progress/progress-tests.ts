import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as viewModule from '@nativescript/core/ui/core/view';
import { EventData, PropertyChangeData } from '@nativescript/core';
import * as color from '@nativescript/core/color';
import * as platform from '@nativescript/core/platform';

// >> article-require-progress-module
import * as progressModule from '@nativescript/core/ui/progress';
// << article-require-progress-module

export function test_default_TNS_values() {
	// >> article-create-progress-view
	var progress = new progressModule.Progress();
	// << article-create-progress-view

	TKUnit.assertEqual(progress.value, 0, 'Default progress.value');
	TKUnit.assertEqual(progress.maxValue, 100, 'Default progress.maxValue');
}

export function test_recycling() {
	helper.nativeView_recycling_test(() => new progressModule.Progress());
}

export function test_default_native_values() {
	var progress = new progressModule.Progress();

	function testAction(views: Array<viewModule.View>) {
		TKUnit.assertEqual(getNativeValue(progress), 0, 'Default native progress.value');
		TKUnit.assertEqual(getNativeMaxValue(progress), 100, 'Default native progress.maxValue');
	}

	helper.buildUIAndRunTest(progress, testAction);
}

export function test_set_TNS_value_updates_native_value() {
	var progress = new progressModule.Progress();

	function testAction(views: Array<viewModule.View>) {
		progress.value = 5;
		TKUnit.assertAreClose(getNativeValue(progress), 5, 0.001, 'Native value is different from TNS value.');
	}

	helper.buildUIAndRunTest(progress, testAction);
}

export function test_set_value_greater_than_max_should_set_value_to_max() {
	var progress = new progressModule.Progress();

	function testAction(views: Array<viewModule.View>) {
		progress.maxValue = 10;
		progress.value = 20;
		TKUnit.assertEqual(progress.value, 10, 'progress.value');
	}

	helper.buildUIAndRunTest(progress, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.
if (platform.Device.os === platform.platformNames.ios) {
	exports.test_set_color = function () {
		var progress = new progressModule.Progress();
		progress.color = new color.Color('red');

		function testAction(views: Array<viewModule.View>) {
			TKUnit.assertEqual(progress.color.ios.CGColor, progress.ios.progressTintColor.CGColor, 'progress.color');
		}

		helper.buildUIAndRunTest(progress, testAction);
	};

	exports.test_set_backgroundColor = function () {
		var progress = new progressModule.Progress();
		progress.backgroundColor = new color.Color('red');

		function testAction(views: Array<viewModule.View>) {
			TKUnit.assertEqual((<color.Color>progress.backgroundColor).ios.CGColor, progress.ios.trackTintColor.CGColor, 'progress.color');
		}

		helper.buildUIAndRunTest(progress, testAction);
	};
}

export function test_set_maxValue_should_adjust_value() {
	var progress = new progressModule.Progress();

	// >> article-set-value
	progress.maxValue = 255;
	progress.value = 16;
	// << article-set-value

	function testAction(views: Array<viewModule.View>) {
		progress.maxValue = 10;

		TKUnit.assertEqual(progress.maxValue, 10, 'progress.maxValue');
		TKUnit.assertEqual(progress.value, 10, 'progress.value');
	}

	helper.buildUIAndRunTest(progress, testAction);
}

export function test_property_changed_event_when_setting_maxValue_with_adjust() {
	var progress = new progressModule.Progress();
	progress.maxValue = 100;
	progress.value = 50;

	function testAction(views: Array<viewModule.View>) {
		var changedProperties = {};
		var allChanges = 0;
		progress.on('valueChange', function (data: EventData) {
			allChanges++;
			changedProperties[(<PropertyChangeData>data).propertyName] = true;
		});

		progress.on('maxValueChange', function (data: EventData) {
			allChanges++;
			changedProperties[(<PropertyChangeData>data).propertyName] = true;
		});

		// Act
		progress.maxValue = 40;
		progress.off('valueChange');
		progress.off('maxValueChange');

		// Assert
		TKUnit.assert(changedProperties['maxValue'], "Property changed for 'maxValue' not called.");
		TKUnit.assert(changedProperties['value'], "Property changed for 'value' not called.");
		TKUnit.assertEqual(allChanges, 2, 'Property changed callbacks.');
	}

	helper.buildUIAndRunTest(progress, testAction);
}

function getNativeValue(progress: progressModule.Progress): number {
	if (progress.android) {
		return progress.android.getProgress();
	} else if (progress.ios) {
		return progress.ios.progress * progress.maxValue;
	}
}

function getNativeMaxValue(progress: progressModule.Progress): number {
	if (progress.android) {
		return progress.android.getMax();
	} else if (progress.ios) {
		// there is no max value in ios - the range is always [0, 1]
		return progress.maxValue;
	}
}
