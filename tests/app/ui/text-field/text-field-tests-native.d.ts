//@private
import textFieldModule = require("ui/text-field");
import colorModule = require("color");

export declare function getNativeText(textField: textFieldModule.TextField): string;
export declare function getNativeHint(textField: textFieldModule.TextField): string;
export declare function getNativeSecure(textField: textFieldModule.TextField): boolean;
export declare function getNativeFontSize(textField: textFieldModule.TextField): number;
export declare function getNativeColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativePlaceholderColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativeBackgroundColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativeTextAlignment(textField: textFieldModule.TextField): string;
export declare function typeTextNatively(textField: textFieldModule.TextField, text: string): void;