import * as textViewModule from '@nativescript/core/ui/text-view';
import * as colorModule from '@nativescript/core/color';
import * as utilsModule from '@nativescript/core/utils/utils';
import * as enums from '@nativescript/core/ui/enums';

export function getNativeText(textView: textViewModule.TextView): string {
	return textView.android.getText().toString();
}

export function getNativeEditable(textView: textViewModule.TextView): boolean {
	if (textView.android.getKeyListener()) {
		return true;
	} else {
		return false;
	}
}

export function getNativeHint(textView: textViewModule.TextView): string {
	return textView.android.getHint();
}

export function getNativeFontSize(textView: textViewModule.TextView): number {
	var density = utilsModule.layout.getDisplayDensity();

	return textView.android.getTextSize() / density;
}

export function getNativeColor(textView: textViewModule.TextView): colorModule.Color {
	return new colorModule.Color(textView.android.getTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(textView: textViewModule.TextView): colorModule.Color {
	var bkg = <any>textView.android.getBackground();
	if (bkg instanceof org.nativescript.widgets.BorderDrawable) {
		return new colorModule.Color((<org.nativescript.widgets.BorderDrawable>bkg).getBackgroundColor());
	} else {
		return new colorModule.Color(bkg.backgroundColor);
	}
}

export function getNativeTextAlignment(textView: textViewModule.TextView): string {
	var gravity = textView.android.getGravity();

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

export function typeTextNatively(textView: textViewModule.TextView, text: string): void {
	textView.android.requestFocus();
	textView.android.setText(text);
	textView.android.clearFocus();
}

export function getNativeMaxLines(textView: textViewModule.TextView): number {
	return textView.android.getMaxLines();
}
