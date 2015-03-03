//@private
import buttonModule = require("ui/button");
import colorModule = require("color");

export declare function getNativeText(button: buttonModule.Button) : string;
export declare function getNativeFontSize(button: buttonModule.Button): number;
export declare function getNativeColor(button: buttonModule.Button): colorModule.Color;
export declare function getNativeBackgroundColor(button: buttonModule.Button): colorModule.Color;
export declare function getNativeTextAlignment(button: buttonModule.Button): string;
export declare function performNativeClick(button: buttonModule.Button): void;

