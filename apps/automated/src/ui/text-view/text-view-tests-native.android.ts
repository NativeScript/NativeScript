import { TextView, Color, Utils, CoreTypes } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

export function getNativeText(textView: TextView): string {
	return textView.android.getText().toString();
}

export function getNativeEditable(textView: TextView): boolean {
	if (textView.android.getKeyListener()) {
		return true;
	} else {
		return false;
	}
}

export function getNativeHint(textView: TextView): string {
	return textView.android.getHint();
}

export function getNativeFontSize(textView: TextView): number {
	let density = Utils.layout.getDisplayDensity();

	return textView.android.getTextSize() / density;
}

export function getNativeColor(textView: TextView): Color {
	return new Color(textView.android.getTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(textView: TextView): Color {
	return AndroidHelper.getDrawableColor(textView.android.getBackground());
}

export function getNativeTextAlignment(textView: TextView): string {
	let gravity = textView.android.getGravity();

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

export function typeTextNatively(textView: TextView, text: string): void {
	textView.android.requestFocus();
	textView.android.setText(text);
	textView.android.clearFocus();
}

export function getNativeMaxLines(textView: TextView): number {
	return textView.android.getMaxLines();
}
