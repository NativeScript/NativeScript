import labelModule = require("ui/label");
import enums = require("ui/enums");

export function getNativeTextAlignment(label: labelModule.Label): string {
    switch (label.ios.textAlignment) {
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