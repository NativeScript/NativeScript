import * as TKUnit from '../../tk-unit';
// >> article-creating-view
import { isIOS, isAndroid } from '@nativescript/core/platform';
import * as utils from '@nativescript/core/utils/utils';
import * as helper from '../../ui-helper';
import * as viewModule from '@nativescript/core/ui/core/view';

// >> article-require-placeholder-module
import * as placeholderModule from '@nativescript/core/ui/placeholder';
// << article-require-placeholder-module

function creatingView(args) {
	let nativeView;
	if (isIOS) {
		nativeView = UITextView.new();
		nativeView.text = 'Native';
	} else if (isAndroid) {
		nativeView = new android.widget.TextView(utils.ad.getApplicationContext());
		nativeView.setText('Native');
	}

	args.view = nativeView;
}

exports.creatingView = creatingView;
// << article-creating-view

export function test_placeholder_creatingView() {
	const p = new placeholderModule.Placeholder();
	p.on(placeholderModule.Placeholder.creatingViewEvent, (args: placeholderModule.CreateViewEventData) => {
		let nativeView;
		if (isIOS) {
			nativeView = UITextView.new();
			nativeView.text = 'Native';
		} else if (isAndroid) {
			nativeView = new android.widget.TextView(utils.ad.getApplicationContext());
			nativeView.setText('Native');
		}

		args.view = nativeView;
	});

	function testAction(views: Array<viewModule.View>) {
		if (isIOS) {
			TKUnit.assert(p.nativeViewProtected instanceof UITextView, 'nativeView property should be UITextView. Current value: ' + p.nativeViewProtected);
		} else if (isAndroid) {
			TKUnit.assert(p.nativeViewProtected instanceof android.widget.TextView, 'Native view should be android.widget.TextView. Current value: ' + p.nativeViewProtected);
		}
	}

	helper.buildUIAndRunTest(p, testAction);
}

export function test_placeholder_will_not_crash_wihout_creatingView() {
	const p = new placeholderModule.Placeholder();

	function testAction(views: Array<viewModule.View>) {
		if (isIOS) {
			TKUnit.assert(p.ios === undefined, 'ios property should be undefined. Current value: ' + p.ios);
		} else if (isAndroid) {
			TKUnit.assert(p.android === undefined, 'android view should be undefined. Current value: ' + p.android);
		}
	}

	helper.buildUIAndRunTest(p, testAction);
}
