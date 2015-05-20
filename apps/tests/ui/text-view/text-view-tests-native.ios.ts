import textViewModule = require("ui/text-view");
import colorModule = require("color");
import utilsModule = require("utils/utils");
import enums = require("ui/enums");

export function getNativeText(textView: textViewModule.TextView): string {
    return textView.ios.text;
}

export function getNativeHint(textView: textViewModule.TextView): string {
    // There is no native hint
    if (textView.hint !== "") {
        return textView.ios.text;
    }

    return "";
}

export function getNativeEditable(textView: textViewModule.TextView): boolean {
    return textView.ios.editable;
}

export function getNativeFontSize(textView: textViewModule.TextView): number {
    return textView.ios.font.pointSize;
}

export function getNativeColor(textView: textViewModule.TextView): colorModule.Color {
    return utilsModule.ios.getColor(textView.ios.textColor);
}

export function getNativeBackgroundColor(textView: textViewModule.TextView): colorModule.Color {
    return utilsModule.ios.getColor(textView.ios.backgroundColor);
}

export function getNativeTextAlignment(textView: textViewModule.TextView): string {
    switch (textView.ios.textAlignment) {
        case NSTextAlignment.NSTextAlignmentLeft:
            return enums.TextAlignment.left;
            break;
        case NSTextAlignment.NSTextAlignmentCenter:
            return enums.TextAlignment.center;
            break;
        case NSTextAlignment.NSTextAlignmentRight:
            return enums.TextAlignment.right;
            break;
        default:
            return "unexpected value";
            break;
    }
}

export function typeTextNatively(textView: textViewModule.TextView, text: string): void {
    textView.ios.text = text;
    
    // Setting the text will not trigger the delegate method, so we have to do it by hand.
    textView.ios.delegate.textViewDidEndEditing(textView.ios);
}