import * as TKUnit from '../../tk-unit';
import { isIOS, isAndroid, Utils, Placeholder, CreateViewEventData, View } from '@nativescript/core';
import * as helper from '../../ui-helper';

function creatingView(args) {
	let nativeView;
	if (__APPLE__) {
		nativeView = UITextView.new();
		nativeView.text = 'Native';
	} else if (isAndroid) {
		nativeView = new android.widget.TextView(Utils.android.getApplicationContext());
		nativeView.setText('Native');
	}

	args.view = nativeView;
}

exports.creatingView = creatingView;
// << article-creating-view

export function test_placeholder_creatingView() {
	const p = new Placeholder();
	p.on(Placeholder.creatingViewEvent, (args: CreateViewEventData) => {
		let nativeView;
		if (isIOS) {
			nativeView = UITextView.new();
			nativeView.text = 'Native';
		} else if (isAndroid) {
			nativeView = new android.widget.TextView(Utils.android.getApplicationContext());
			nativeView.setText('Native');
		}

		args.view = nativeView;
	});

	function testAction(views: Array<View>) {
		if (isIOS) {
			TKUnit.assert(p.nativeViewProtected instanceof UITextView, 'nativeView property should be UITextView. Current value: ' + p.nativeViewProtected);
		} else if (isAndroid) {
			TKUnit.assert(p.nativeViewProtected instanceof android.widget.TextView, 'Native view should be android.widget.TextView. Current value: ' + p.nativeViewProtected);
		}
	}

	helper.buildUIAndRunTest(p, testAction);
}

export function test_placeholder_will_not_crash_wihout_creatingView() {
	const p = new Placeholder();

	function testAction(views: Array<View>) {
		if (__APPLE__) {
			TKUnit.assert(p.ios === undefined, 'ios property should be undefined. Current value: ' + p.ios);
		} else if (isAndroid) {
			TKUnit.assert(p.android === undefined, 'android view should be undefined. Current value: ' + p.android);
		}
	}

	helper.buildUIAndRunTest(p, testAction);
}
