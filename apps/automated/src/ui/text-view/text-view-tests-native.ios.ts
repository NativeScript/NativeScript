import * as textViewModule from '@nativescript/core/ui/text-view';
import * as colorModule from '@nativescript/core/color';
import { getColor } from '../../ui-helper';
import * as enums from '@nativescript/core/ui/enums';

export function getNativeText(textView: textViewModule.TextView): string {
	return textView.ios.text;
}

export function getNativeHint(textView: textViewModule.TextView): string {
	// There is no native hint so we use a hack and sett 22% opaque text.
	if ((<any>textView)._isShowingHint) {
		return textView.ios.text;
	}

	return '';
}

export function getNativeEditable(textView: textViewModule.TextView): boolean {
	return textView.ios.editable;
}

export function getNativeFontSize(textView: textViewModule.TextView): number {
	return textView.ios.font.pointSize;
}

export function getNativeColor(textView: textViewModule.TextView): colorModule.Color {
	return getColor(textView.ios.textColor);
}

export function getNativeBackgroundColor(textView: textViewModule.TextView): colorModule.Color {
	return getColor(textView.ios.backgroundColor);
}

export function getNativeTextAlignment(textView: textViewModule.TextView): string {
	switch (textView.ios.textAlignment) {
		case NSTextAlignment.Left:
			return enums.TextAlignment.left;
		case NSTextAlignment.Center:
			return enums.TextAlignment.center;
		case NSTextAlignment.Right:
			return enums.TextAlignment.right;
		default:
			return 'unexpected value';
	}
}

export function typeTextNatively(textView: textViewModule.TextView, text: string): void {
	textView.ios.text = text;

	// Setting the text will not trigger the delegate method, so we have to do it by hand.
	textView.ios.delegate.textViewDidEndEditing(textView.ios);
}

export function getNativeMaxLines(textView: textViewModule.TextView): number {
	return textView.ios.textContainer.maximumNumberOfLines;
}
