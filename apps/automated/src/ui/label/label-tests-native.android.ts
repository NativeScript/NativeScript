import * as labelModule from '@nativescript/core/ui/label';
import { CoreTypes } from '@nativescript/core';
import * as colorModule from '@nativescript/core/color';

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

export function getNativeBackgroundColor(label: labelModule.Label): colorModule.Color {
	let bg = <any>label.android.getBackground();
	if (bg instanceof org.nativescript.widgets.BorderDrawable) {
		return new colorModule.Color(bg.getBackgroundColor());
	} else if (bg instanceof android.graphics.drawable.ColorDrawable) {
		return new colorModule.Color(bg.getColor());
	} else {
		return new colorModule.Color(bg.backgroundColor);
	}
}
