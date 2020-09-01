import * as textFieldModule from '@nativescript/core/ui/text-field';
import * as colorModule from '@nativescript/core/color';
import * as utilsModule from '@nativescript/core/utils/utils';
import * as enums from '@nativescript/core/ui/enums';

export function getNativeText(textField: textFieldModule.TextField): string {
	return textField.android.getText().toString();
}

export function getNativeHint(textField: textFieldModule.TextField): string {
	return textField.android.getHint();
}

export function getNativeSecure(textField: textFieldModule.TextField): boolean {
	var inputType = textField.android.getInputType();

	return (inputType & android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD) === android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD || (inputType & android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD) === android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
}

export function getNativeFontSize(textField: textFieldModule.TextField): number {
	var density = utilsModule.layout.getDisplayDensity();

	return textField.android.getTextSize() / density;
}

export function getNativeColor(textField: textFieldModule.TextField): colorModule.Color {
	return new colorModule.Color(textField.android.getTextColors().getDefaultColor());
}

export function getNativePlaceholderColor(textField: textFieldModule.TextField): colorModule.Color {
	return new colorModule.Color(textField.android.getHintTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(textField: textFieldModule.TextField): colorModule.Color {
	var bkg = <any>textField.android.getBackground();
	if (bkg instanceof org.nativescript.widgets.BorderDrawable) {
		return new colorModule.Color((<org.nativescript.widgets.BorderDrawable>bkg).getBackgroundColor());
	} else {
		return new colorModule.Color(bkg.backgroundColor);
	}
}

export function getNativeTextAlignment(textField: textFieldModule.TextField): string {
	var gravity = textField.android.getGravity();

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.LEFT) {
		return enums.TextAlignment.left;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.CENTER_HORIZONTAL) {
		return enums.TextAlignment.center;
	}

	if ((gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK) === android.view.Gravity.RIGHT) {
		return enums.TextAlignment.right;
	}

	return 'unexpected value';
}

export function getNativeFocus(textField: textFieldModule.TextField): boolean {
	//
	return true;
}

export function typeTextNatively(textField: textFieldModule.TextField, text: string): void {
	textField.android.requestFocus();
	textField.android.setText(text);
	textField.android.clearFocus();
}

export function typeTextNativelyWithReturn(textField: textFieldModule.TextField, text: string): void {
	//
}
