import { Color, Button, Utils, Enums } from '@nativescript/core';

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
	let bg = <any>button.android.getBackground();
	if (bg instanceof org.nativescript.widgets.BorderDrawable) {
		return new Color(bg.getBackgroundColor());
	} else if (bg instanceof android.graphics.drawable.ColorDrawable) {
		console.log(bg);
		return new Color(bg.getColor());
	} else {
		return new Color(bg.backgroundColor);
	}
}

export function getNativeTextAlignment(button: Button): string {
	let gravity = button.android.getGravity();

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

export function performNativeClick(button: Button): void {
	button.android.performClick();
}
