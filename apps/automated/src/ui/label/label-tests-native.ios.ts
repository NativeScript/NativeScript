import * as labelModule from '@nativescript/core/ui/label';
import { Enums } from '@nativescript/core';
import * as colorModule from '@nativescript/core/color';
import { getColor } from '../../ui-helper';

export function getNativeTextAlignment(label: labelModule.Label): string {
	switch (label.ios.textAlignment) {
		case NSTextAlignment.Left:
			return Enums.TextAlignment.left;
		case NSTextAlignment.Center:
			return Enums.TextAlignment.center;
		case NSTextAlignment.Right:
			return Enums.TextAlignment.right;
		default:
			return 'unexpected value';
	}
}

export function getNativeBackgroundColor(label: labelModule.Label): colorModule.Color {
	var layer = (<UILabel>label.ios).layer;
	if (!layer || !layer.backgroundColor) {
		return undefined;
	}
	var uiColor = UIColor.colorWithCGColor(layer.backgroundColor);

	return getColor(uiColor);
}
