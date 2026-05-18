export * from './text-view-common';

import { TextViewBase } from './text-view-common';
import { hintProperty, editableProperty, maxLengthProperty, keyboardTypeProperty } from '../editable-text-base/editable-text-base-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import type { CoreTypes } from '../../core-types';

const KEYBOARD_SCOPE: Record<string, number> = {
	number: 29,
	datetime: 29,
	phone: 3,
	email: 7,
	url: 14,
	integer: 29,
};

export class TextView extends TextViewBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.TextBox;

	createNativeView(): any {
		const textBox = new Windows.UI.Xaml.Controls.TextBox();
		(textBox as any).AcceptsReturn = true;
		(textBox as any).TextWrapping = 1; // Wrap
		(textBox as any).VerticalScrollBarVisibility = 1; // Auto
		return textBox;
	}

	[hintProperty.setNative](value: string) {
		const nativeView = this.nativeViewProtected as any;
		if (nativeView && typeof nativeView.PlaceholderText !== 'undefined') {
			nativeView.PlaceholderText = value ?? '';
		}
	}

	[editableProperty.setNative](value: boolean) {
		const nativeView = this.nativeViewProtected as any;
		if (nativeView && typeof nativeView.IsReadOnly !== 'undefined') {
			nativeView.IsReadOnly = !value;
		}
	}

	[maxLengthProperty.setNative](value: number) {
		const nativeView = this.nativeViewProtected as any;
		if (nativeView && typeof nativeView.MaxLength !== 'undefined') {
			nativeView.MaxLength = value ?? 0;
		}
	}

	//@ts-ignore
	[keyboardTypeProperty.setNative](value: CoreTypes.KeyboardInputType) {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) return;
		try {
			const scopeValue = KEYBOARD_SCOPE[value];
			if (scopeValue === undefined) return;
			const scope = new Windows.UI.Xaml.Input.InputScope();
			const scopeName = new Windows.UI.Xaml.Input.InputScopeName();
			(scopeName as any).NameValue = scopeValue;
			((scope as any).Names as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.Input.InputScopeName>).Append(scopeName);
			nativeView.InputScope = scope;
		} catch (_e) {}
	}

	//@ts-ignore
	[colorProperty.setNative](value: Color | null) {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) return;
		try {
			if (value instanceof Color) {
				nativeView.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(value.windows);
			}
		} catch (_e) {}
	}
}
