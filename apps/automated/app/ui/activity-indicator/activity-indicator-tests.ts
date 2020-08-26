import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as viewModule from '@nativescript/core/ui/core/view';
import * as imageModule from '@nativescript/core/ui/image';
import * as platform from '@nativescript/core/platform';
import * as color from '@nativescript/core/color';

// >> activity-indicator-require
import * as activityIndicatorModule from '@nativescript/core/ui/activity-indicator';
// << activity-indicator-require

export function test_recycling() {
	helper.nativeView_recycling_test(() => new activityIndicatorModule.ActivityIndicator());
}

export function test_default_TNS_values() {
	// >> activity-indicator-create
	var indicator = new activityIndicatorModule.ActivityIndicator();
	// << activity-indicator-create

	TKUnit.assertEqual(indicator.busy, false, 'Default indicator.busy');
}

export function test_default_native_values() {
	var indicator = new activityIndicatorModule.ActivityIndicator();

	indicator.width = 50;
	indicator.height = 50;

	function testAction(views: Array<viewModule.View>) {
		TKUnit.assertEqual(getNativeBusy(indicator), false, 'Default native indicator.busy');
	}

	helper.buildUIAndRunTest(indicator, testAction);
}

export function test_set_TNS_value_updates_native_value() {
	var indicator = new activityIndicatorModule.ActivityIndicator();
	indicator.width = 50;
	indicator.height = 50;

	function testAction(views: Array<viewModule.View>) {
		indicator.busy = true;
		TKUnit.waitUntilReady(() => getNativeBusy(indicator) === true);
		TKUnit.assertEqual(getNativeBusy(indicator), true, 'Native value is different from TNS value.');
	}

	helper.buildUIAndRunTest(indicator, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.
if (platform.Device.os === platform.platformNames.ios) {
	exports.test_set_color = function () {
		var ai = new activityIndicatorModule.ActivityIndicator();
		ai.color = new color.Color('red');

		function testAction(views: Array<viewModule.View>) {
			TKUnit.assertEqual(ai.color.ios.CGColor, ai.nativeViewProtected.color.CGColor, 'ai.color');
		}

		helper.buildUIAndRunTest(ai, testAction);
	};
}

// This method is only for the code snippet
/* tslint:disable:no-unused-variable */
function binding_busy_to_image() {
	/* tslint:enable:no-unused-variable */

	// >> activity-indicator-loading
	var image = new imageModule.Image();
	var indicator = new activityIndicatorModule.ActivityIndicator();
	indicator.width = 100;
	indicator.height = 100;

	// Bind the busy property of the indicator to the isLoading property of the image
	indicator.bind(
		{
			sourceProperty: 'isLoading',
			targetProperty: 'busy',
		},
		image
	);
	// << activity-indicator-loading
}

function getNativeBusy(indicator: activityIndicatorModule.ActivityIndicator): boolean {
	if (indicator.android) {
		return indicator.android.getVisibility() === android.view.View.VISIBLE;
	} else if (indicator.ios) {
		if ((indicator.ios as any).isAnimating) {
			return (indicator.ios as any).isAnimating();
		} else {
			return (indicator.ios as UIActivityIndicatorView).animating;
		}
	}
}
