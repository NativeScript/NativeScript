import * as labelModule from '@nativescript/core/ui/label';
import { Color, CoreTypes } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

const UNEXPECTED_VALUE = 'unexpected value';

export function getNativeTextAlignment(label: labelModule.Label): string {
	const alignment = label.android.getTextAlignment();

	if (alignment === android.view.View.TEXT_ALIGNMENT_VIEW_START) {
		return 'initial';
	}

	if (alignment === android.view.View.TEXT_ALIGNMENT_TEXT_START) {
		return CoreTypes.TextAlignment.left;
	}

	if (alignment === android.view.View.TEXT_ALIGNMENT_CENTER) {
		return CoreTypes.TextAlignment.center;
	}

	if (alignment === android.view.View.TEXT_ALIGNMENT_TEXT_END) {
		return CoreTypes.TextAlignment.right;
	}

	label.android.setTextAlignment(android.view.View.TEXT_ALIGNMENT_TEXT_END);

	return UNEXPECTED_VALUE;
}

export function getNativeTextAlignmentWithoutRtlSupport(label: labelModule.Label): string {
	let hGravity = label.android.getGravity() & android.view.Gravity.HORIZONTAL_GRAVITY_MASK;

	if (hGravity === android.view.Gravity.START) {
		return 'initial';
	}

	if (hGravity === android.view.Gravity.LEFT) {
		return CoreTypes.TextAlignment.left;
	}

	if (hGravity === android.view.Gravity.CENTER_HORIZONTAL) {
		return CoreTypes.TextAlignment.center;
	}

	if (hGravity === android.view.Gravity.RIGHT) {
		return CoreTypes.TextAlignment.right;
	}

	return UNEXPECTED_VALUE;
}

export function getNativeBackgroundColor(label: labelModule.Label): Color {
	return AndroidHelper.getDrawableColor(label.android.getBackground());
}
