//@private
import * as buttonModule from '@nativescript/core/ui/button';
import * as colorModule from '@nativescript/core/color';

export declare function getNativeText(button: buttonModule.Button): string;
export declare function getNativeTextWrap(button: buttonModule.Button): boolean;
export declare function getNativeFontSize(button: buttonModule.Button): number;
export declare function getNativeColor(button: buttonModule.Button): colorModule.Color;
export declare function getNativeBackgroundColor(button: buttonModule.Button): colorModule.Color;
export declare function getNativeTextAlignment(button: buttonModule.Button): string;
export declare function performNativeClick(button: buttonModule.Button): void;
