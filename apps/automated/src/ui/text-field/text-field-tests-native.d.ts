//@private
import * as textFieldModule from '@nativescript/core/ui/text-field';
import * as colorModule from '@nativescript/core/color';

export declare function getNativeText(textField: textFieldModule.TextField): string;
export declare function getNativeHint(textField: textFieldModule.TextField): string;
export declare function getNativeSecure(textField: textFieldModule.TextField): boolean;
export declare function getNativeFontSize(textField: textFieldModule.TextField): number;
export declare function getNativeColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativePlaceholderColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativeBackgroundColor(textField: textFieldModule.TextField): colorModule.Color;
export declare function getNativeTextAlignment(textField: textFieldModule.TextField): string;
export declare function getNativeFocus(textField: textFieldModule.TextField): boolean;
export declare function typeTextNatively(textField: textFieldModule.TextField, text: string): void;
export declare function typeTextNativelyWithReturn(textField: textFieldModule.TextField, text: string): void;
