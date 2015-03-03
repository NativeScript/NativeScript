import buttonModule = require("ui/button");
import colorModule = require("color");
import utilsModule = require("utils/utils");
import enums = require("ui/enums");

export function getNativeText(button: buttonModule.Button): string {
    return button.ios.titleForState(UIControlState.UIControlStateNormal);
}

export function getNativeFontSize(button: buttonModule.Button): number {
    return button.ios.titleLabel.font.pointSize;
}

export function getNativeColor(button: buttonModule.Button): colorModule.Color {
    return utilsModule.ios.getColor(button.ios.titleColorForState(UIControlState.UIControlStateNormal));
}

export function getNativeBackgroundColor(button: buttonModule.Button): colorModule.Color {
    return utilsModule.ios.getColor(button.ios.backgroundColor);
}

export function getNativeTextAlignment(button: buttonModule.Button): string {
    switch (button.ios.titleLabel.textAlignment) {
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

export function performNativeClick(button: buttonModule.Button): void {
    button.ios.sendActionsForControlEvents(UIControlEvents.UIControlEventTouchUpInside);
}