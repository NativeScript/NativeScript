//@private
import * as textViewModule from "ui/text-view";
import * as colorModule from "color";

export declare function getNativeText(textView: textViewModule.TextView): string;
export declare function getNativeHint(textView: textViewModule.TextView): string;
export declare function getNativeEditable(textView: textViewModule.TextView): boolean;
export declare function getNativeFontSize(textView: textViewModule.TextView): number;
export declare function getNativeColor(textView: textViewModule.TextView): colorModule.Color;
export declare function getNativeBackgroundColor(textView: textViewModule.TextView): colorModule.Color;
export declare function getNativeTextAlignment(textView: textViewModule.TextView): string;
export declare function typeTextNatively(textView: textViewModule.TextView, text: string): void;
