import * as labelModule from '@nativescript/core/ui/label';
import { Color, CoreTypes } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

export function getNativeTextAlignment(label: labelModule.Label): string {
	let gravity = label.android.getGravity();

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.LEFT) {
		return CoreTypes.TextAlignment.left;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.CENTER_HORIZONTAL) {
		return CoreTypes.TextAlignment.center;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.RIGHT) {
		return CoreTypes.TextAlignment.right;
	}

	return 'unexpected value';
}

export function getNativeBackgroundColor(label: labelModule.Label): Color {
	return AndroidHelper.getDrawableColor(label.android.getBackground());
}
