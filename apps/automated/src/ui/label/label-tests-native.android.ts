import * as labelModule from '@nativescript/core/ui/label';
import { Color, CoreTypes } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

const UNEXPECTED_VALUE = 'unexpected value';

export function getNativeTextAlignment(label: labelModule.Label): string {
	let hGravity = label.android.getGravity() & android.view.Gravity.HORIZONTAL_GRAVITY_MASK;
	const alignment = label.android.getTextAlignment();

	if (hGravity === android.view.Gravity.START && alignment === android.view.View.TEXT_ALIGNMENT_VIEW_START) {
		return 'initial';
	}

	if (hGravity === android.view.Gravity.LEFT && alignment === android.view.View.TEXT_ALIGNMENT_GRAVITY) {
		return CoreTypes.TextAlignment.left;
	}

	if (hGravity === android.view.Gravity.CENTER_HORIZONTAL && alignment === android.view.View.TEXT_ALIGNMENT_CENTER) {
		return CoreTypes.TextAlignment.center;
	}

	if (hGravity === android.view.Gravity.RIGHT && alignment === android.view.View.TEXT_ALIGNMENT_GRAVITY) {
		return CoreTypes.TextAlignment.right;
	}

	return UNEXPECTED_VALUE;
}

export function getNativeBackgroundColor(label: labelModule.Label): Color {
	return AndroidHelper.getDrawableColor(label.android.getBackground());
}
