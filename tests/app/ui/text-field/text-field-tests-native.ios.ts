import textFieldModule = require("ui/text-field");
import colorModule = require("color");
import utilsModule = require("utils/utils");
import enums = require("ui/enums");

export function getNativeText(textField: textFieldModule.TextField): string {
    return textField.ios.text;
}

export function getNativeHint(textField: textFieldModule.TextField): string {
    return textField.ios.placeholder;
}

export function getNativeSecure(textField: textFieldModule.TextField): boolean {
    return textField.ios.secureTextEntry;
}

export function getNativeFontSize(textField: textFieldModule.TextField): number {
    return textField.ios.font.pointSize;
}

export function getNativeColor(textField: textFieldModule.TextField): colorModule.Color {
    return utilsModule.ios.getColor(textField.ios.textColor);
}

export function getNativeBackgroundColor(textField: textFieldModule.TextField): colorModule.Color {
    return utilsModule.ios.getColor(textField.ios.backgroundColor);
}

export function getNativeTextAlignment(textField: textFieldModule.TextField): string {
    switch (textField.ios.textAlignment) {
        case NSTextAlignment.Left:
            return enums.TextAlignment.left;
        case NSTextAlignment.Center:
            return enums.TextAlignment.center;
        case NSTextAlignment.Right:
            return enums.TextAlignment.right;
        default:
            return "unexpected value";
    }
}

export function typeTextNatively(textField: textFieldModule.TextField, text: string): void {
    textField.ios.text = text;
    
    // Setting the text will not trigger the delegate method, so we have to do it by hand.
    textField.ios.delegate.textFieldDidEndEditing(textField.ios);
}
