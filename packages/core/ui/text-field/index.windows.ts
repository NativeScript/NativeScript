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

function applyInputScope(nativeView: Microsoft.UI.Xaml.Controls.TextBox, kbType: string): void {
	const scopeValue = KEYBOARD_SCOPE[kbType];
	if (scopeValue === undefined) {
		return;
	}
	const scope = new Microsoft.UI.Xaml.Input.InputScope();
	const scopeName = new Microsoft.UI.Xaml.Input.InputScopeName(scopeValue);
	// Names is typed as `IVector | array`; the runtime hands back the IVector, so building
	// the collection can throw across the bridge — keep this guarded.
	try {
		(scope.Names as Windows.Foundation.Collections.IVector<Microsoft.UI.Xaml.Input.InputScopeName>).Append(scopeName);
		nativeView.InputScope = scope;
	} catch (_e) {}
}

export class TextField extends TextFieldBase {
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.TextBox | Microsoft.UI.Xaml.Controls.PasswordBox;
	private _isSecure = false;
	private _keyDownDelegate: Microsoft.UI.Xaml.Input.KeyEventHandler | null = null;

	// Declared so TS sees it through the common base; re-attached after the secure view swap.
	declare _attachTextChangeListener: () => void;

	public createNativeView(): Microsoft.UI.Xaml.Controls.TextBox | Microsoft.UI.Xaml.Controls.PasswordBox {
		// `secure` is parsed before the native view is created; pick the correct control up-front.
		if (this.secure != null) {
			this._isSecure = !!this.secure;
		}
		return this._isSecure ? new Microsoft.UI.Xaml.Controls.PasswordBox() : new Microsoft.UI.Xaml.Controls.TextBox();
	}

	public initNativeView(): void {
		super.initNativeView(); // wires TextChanged/PasswordChanged from editable-text-base
		this._attachReturnKeyListener();
	}

	public _attachReturnKeyListener(): void {
		const nv = this.nativeViewProtected;
		if (!nv) {
			return;
		}
		const ref = new WeakRef(this);
		this._keyDownDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.Input.KeyEventHandler', (_sender: any, e: Microsoft.UI.Xaml.Input.KeyRoutedEventArgs) => {
			if (e.Key === Windows.System.VirtualKey.Enter) {
				const owner = ref.deref();
				if (owner) owner.notify({ eventName: TextFieldBase.returnPressEvent, object: owner });
			}
		});
		// AddHandler(KeyDownEvent) throws E_INVALIDARG (0x80070057) in the runtime's RoutedEvent
		// projection — an uncaught throw jams frame navigation. Fall back to instance KeyDown.
		try {
			nv.AddHandler(Microsoft.UI.Xaml.UIElement.KeyDownEvent, this._keyDownDelegate, true);
		} catch (_e) {
			try {
				(nv as Microsoft.UI.Xaml.UIElement).KeyDown = this._keyDownDelegate;
			} catch (_e2) {}
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[secureProperty.setNative](value: boolean) {
		if (this._isSecure === !!value) {
			return;
		}
		this._isSecure = !!value;

		const prev = this.nativeViewProtected;
		// Carry the value across the swap from the JS model (source of truth), not off `prev`.
		const currentText = this.text ?? '';

		const newView = this._isSecure ? new Microsoft.UI.Xaml.Controls.PasswordBox() : new Microsoft.UI.Xaml.Controls.TextBox();

		// Must swap in the ACTUAL visual parent (not the NS parent's nativeViewProtected) —
		// using the NS parent's Border missed the real container and the swap silently no-op'd,
		// leaving secure fields as cleartext TextBoxes.
		const visualParent = prev?.Parent;
		let swapped = false;
		if (visualParent) {
			const children = (visualParent as Microsoft.UI.Xaml.Controls.Panel).Children;
			if (children && typeof children.Size === 'number') {
				for (let i = 0; i < children.Size; i++) {
					if (children.GetAt(i) === prev) {
						children.RemoveAt(i);
						children.InsertAt(i, newView); // preserve position
						swapped = true;
						break;
					}
				}
			}
			if (!swapped) {
				const contentHost = visualParent as Microsoft.UI.Xaml.Controls.ContentControl;
				if (contentHost.Content === prev) {
					contentHost.Content = newView;
					swapped = true;
				}
			}
			if (!swapped) {
				const borderHost = visualParent as Microsoft.UI.Xaml.Controls.Border;
				if (borderHost.Child === prev) {
					borderHost.Child = newView;
					swapped = true;
				}
			}
		}
		this.nativeViewProtected = newView;
		if (this._isSecure) {
			(newView as Microsoft.UI.Xaml.Controls.PasswordBox).Password = currentText;
		} else {
			(newView as Microsoft.UI.Xaml.Controls.TextBox).Text = currentText;
		}
		this._attachTextChangeListener();
		this._attachReturnKeyListener();
	}

	[hintProperty.setNative](value: string) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.PlaceholderText !== 'undefined') {
			nativeView.PlaceholderText = value ?? '';
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[editableProperty.setNative](value: boolean) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.IsReadOnly !== 'undefined') {
			nativeView.IsReadOnly = !value;
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[maxLengthProperty.setNative](value: number) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.MaxLength !== 'undefined') {
			nativeView.MaxLength = value ?? 0;
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[keyboardTypeProperty.setNative](value: CoreTypes.KeyboardInputType) {
		if (this.nativeViewProtected) {
			applyInputScope(this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox, value);
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[autocapitalizationTypeProperty.setNative](value: CoreTypes.AutocapitalizationInputType) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.CharacterCasing !== 'undefined') {
			nativeView.CharacterCasing = value === 'allcharacters' ? 1 : 0;
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[colorProperty.setNative](value: Color | null) {
		const nativeView = this.nativeViewProtected;
		if (nativeView && value instanceof Color) {
			nativeView.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
		}
	}
}
