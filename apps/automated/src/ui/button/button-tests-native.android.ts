import { Color, Button, Utils, CoreTypes } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

export function getNativeText(button: Button): string {
	return button.android.getText();
}

export function getNativeTextWrap(button: Button): boolean {
	return (<android.widget.Button>button.android).getLineCount() === 1;
}

export function getNativeFontSize(button: Button): number {
	let density = Utils.layout.getDisplayDensity();

	return button.android.getTextSize() / density;
}

export function getNativeColor(button: Button): Color {
	return new Color(button.android.getTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(button: Button): Color {
	return AndroidHelper.getDrawableColor(button.android.getBackground());
}

export function getNativeTextAlignment(button: Button): string {
	let gravity = button.android.getGravity();

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

export function performNativeClick(button: Button): void {
	button.android.performClick();
}
