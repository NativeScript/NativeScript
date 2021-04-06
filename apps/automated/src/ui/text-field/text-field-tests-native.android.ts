import { TextField, Color, Utils, CoreTypes } from '@nativescript/core';

export function getNativeText(textField: TextField): string {
	return textField.android.getText().toString();
}

export function getNativeHint(textField: TextField): string {
	return textField.android.getHint();
}

export function getNativeSecure(textField: TextField): boolean {
	let inputType = textField.android.getInputType();

	return (inputType & android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD) === android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD || (inputType & android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD) === android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
}

export function getNativeFontSize(textField: TextField): number {
	let density = Utils.layout.getDisplayDensity();

	return textField.android.getTextSize() / density;
}

export function getNativeColor(textField: TextField): Color {
	return new Color(textField.android.getTextColors().getDefaultColor());
}

export function getNativePlaceholderColor(textField: TextField): Color {
	return new Color(textField.android.getHintTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(textField: TextField): Color {
	let bg = <any>textField.android.getBackground();
	if (bg instanceof org.nativescript.widgets.BorderDrawable) {
		return new Color(bg.getBackgroundColor());
	} else if (bg instanceof android.graphics.drawable.ColorDrawable) {
		console.log(bg);
		return new Color(bg.getColor());
	} else {
		return new Color(bg.backgroundColor);
	}
}

export function getNativeTextAlignment(textField: TextField): string {
	var gravity = textField.android.getGravity();

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

export function getNativeFocus(textField: TextField): boolean {
	//
	return true;
}

export function typeTextNatively(textField: TextField, text: string): void {
	textField.android.requestFocus();
	textField.android.setText(text);
	textField.android.clearFocus();
}

export function typeTextNativelyWithReturn(textField: TextField, text: string): void {
	//
}
