import textFieldModule = require("ui/text-field");
import colorModule = require("color");
import utilsModule = require("utils/utils");
import enums = require("ui/enums");
import background = require("ui/styling/background");

export function getNativeText(textField: textFieldModule.TextField): string {
    return textField.android.getText().toString();
}

export function getNativeHint(textField: textFieldModule.TextField): string {
    return textField.android.getHint();
}

export function getNativeSecure(textField: textFieldModule.TextField): boolean {
    var inputType = textField.android.getInputType();
    return (((inputType & android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD) === android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD) || ((inputType & android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD) === android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD));
}

export function getNativeFontSize(textField: textFieldModule.TextField): number {
    var density = utilsModule.layout.getDisplayDensity();
    return textField.android.getTextSize() / density;
}

export function getNativeColor(textField: textFieldModule.TextField): colorModule.Color {
    return new colorModule.Color(textField.android.getTextColors().getDefaultColor());
}

export function getNativeBackgroundColor(textField: textFieldModule.TextField): colorModule.Color {
    var bkg = <any>textField.android.getBackground();
    var color;
    if (bkg instanceof background.ad.BorderDrawable) {
        return (<background.ad.BorderDrawable>bkg).background.color;
    }
    else {
        return new colorModule.Color(bkg.backgroundColor)
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

    return "unexpected value";
}

export function typeTextNatively(textField: textFieldModule.TextField, text: string): void {
    textField.android.requestFocus();
    textField.android.setText(text);
    textField.android.clearFocus();
}