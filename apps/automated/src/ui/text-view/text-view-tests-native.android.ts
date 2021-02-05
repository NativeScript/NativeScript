import { TextView, Color, Utils, Enums } from '@nativescript/core';

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
	let bg = <any>textView.android.getBackground();
	if (bg instanceof org.nativescript.widgets.BorderDrawable) {
		return new Color(bg.getBackgroundColor());
	} else if (bg instanceof android.graphics.drawable.ColorDrawable) {
		return new Color(bg.getColor());
	} else {
		return new Color(bg.backgroundColor);
	}
}

export function getNativeTextAlignment(textView: TextView): string {
	let gravity = textView.android.getGravity();

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.LEFT) {
		return Enums.TextAlignment.left;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.CENTER_HORIZONTAL) {
		return Enums.TextAlignment.center;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.RIGHT) {
		return Enums.TextAlignment.right;
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
