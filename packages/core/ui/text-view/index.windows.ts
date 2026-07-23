export * from './text-view-common';

import { TextViewBase } from './text-view-common';
import { keyboardTypeProperty } from '../editable-text-base/editable-text-base-common';
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
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.TextBox;

	createNativeView(): Microsoft.UI.Xaml.Controls.TextBox {
		const textBox = new Microsoft.UI.Xaml.Controls.TextBox();
		textBox.AcceptsReturn = true;
		textBox.TextWrapping = 2 as never; // Wrap=2
		(textBox as any).VerticalScrollBarVisibility = 1; // Auto
		return textBox;
	}

	//@ts-ignore
	[keyboardTypeProperty.setNative](value: CoreTypes.KeyboardInputType) {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) return;
		const scopeValue = KEYBOARD_SCOPE[value];
		if (scopeValue === undefined) return;
		const scope = new Microsoft.UI.Xaml.Input.InputScope();
		const scopeName = new Microsoft.UI.Xaml.Input.InputScopeName(scopeValue);
		// Names is typed as `IVector | array`; the runtime hands back the IVector, so
		// building the collection can throw across the bridge — keep this guarded.
		try {
			(scope.Names as Windows.Foundation.Collections.IVector<Microsoft.UI.Xaml.Input.InputScopeName>).Append(scopeName);
			nativeView.InputScope = scope;
		} catch (_e) {}
	}

	//@ts-ignore
	[colorProperty.setNative](value: Color | null) {
		if (this.nativeViewProtected && value instanceof Color) {
			this.nativeViewProtected.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
		}
	}
}
