export * from './text-field-common';

import { TextFieldBase, secureProperty } from './text-field-common';
import { hintProperty, editableProperty, maxLengthProperty, keyboardTypeProperty, autocapitalizationTypeProperty } from '../editable-text-base/editable-text-base-common';
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

function applyInputScope(nativeView: any, kbType: string): void {
	try {
		const scopeValue = KEYBOARD_SCOPE[kbType];
		if (scopeValue === undefined) return;
		const scope = new Windows.UI.Xaml.Input.InputScope();
		const scopeName = new Windows.UI.Xaml.Input.InputScopeName();
		(scopeName as any).NameValue = scopeValue;
		((scope as any).Names as Windows.Foundation.Collections.IVector<Windows.UI.Xaml.Input.InputScopeName>).Append(scopeName);
		nativeView.InputScope = scope;
	} catch (_e) {}
}

export class TextField extends TextFieldBase {
	declare nativeViewProtected: Windows.UI.Xaml.Controls.TextBox | Windows.UI.Xaml.Controls.PasswordBox;
	private _isSecure = false;

	public createNativeView(): any {
		return this._isSecure
			? new Windows.UI.Xaml.Controls.PasswordBox()
			: new Windows.UI.Xaml.Controls.TextBox();
	}

	[secureProperty.setNative](value: boolean) {
		if (this._isSecure === !!value) return;
		this._isSecure = !!value;

		const prev = this.nativeViewProtected as any;
		const currentText = this._isSecure ? (prev?.Password ?? '') : (prev?.Text ?? '');

		try {
			const newView: any = this._isSecure
				? new Windows.UI.Xaml.Controls.PasswordBox()
				: new Windows.UI.Xaml.Controls.TextBox();

			// Try to swap in parent visual tree
			const nativeParent = (this.parent as any)?.nativeViewProtected;
			if (nativeParent?.Children) {
				const children: any = nativeParent.Children;
				const count: number = children.Size;
				for (let i = 0; i < count; i++) {
					if (children.GetAt(i) === prev) {
						children.RemoveAt(i);
						children.Append(newView);
						break;
					}
				}
			}
			this.nativeViewProtected = newView;
			if (this._isSecure) {
				newView.Password = currentText;
			} else {
				newView.Text = currentText;
			}
		} catch (_e) {}
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
		if (nativeView) applyInputScope(nativeView, value);
	}

	//@ts-ignore
	[autocapitalizationTypeProperty.setNative](value: CoreTypes.AutocapitalizationInputType) {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) return;
		try {
			nativeView.CharacterCasing = value === 'allcharacters' ? 1 : 0;
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
