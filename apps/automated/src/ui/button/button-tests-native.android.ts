import * as buttonModule from '@nativescript/core/ui/button';
import * as colorModule from '@nativescript/core/color';
import * as utilsModule from '@nativescript/core/utils/utils';
import * as enums from '@nativescript/core/ui/enums';

export function getNativeText(button: buttonModule.Button): string {
	return button.android.getText();
}

export function getNativeTextWrap(button: buttonModule.Button): boolean {
	return (<android.widget.Button>button.android).getLineCount() === 1;
}

export function getNativeFontSize(button: buttonModule.Button): number {
	var density = utilsModule.layout.getDisplayDensity();

	return button.android.getTextSize() / density;
}

export function getNativeColor(button: buttonModule.Button): colorModule.Color {
	return new colorModule.Color(button.android.getTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(button: buttonModule.Button): colorModule.Color {
	var bkg = <any>button.android.getBackground();
	if (bkg instanceof org.nativescript.widgets.BorderDrawable) {
		return new colorModule.Color((<org.nativescript.widgets.BorderDrawable>bkg).getBackgroundColor());
	} else {
		return new colorModule.Color(bkg.backgroundColor);
	}
}

export function getNativeTextAlignment(button: buttonModule.Button): string {
	var gravity = button.android.getGravity();

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

export function performNativeClick(button: buttonModule.Button): void {
	button.android.performClick();
}
