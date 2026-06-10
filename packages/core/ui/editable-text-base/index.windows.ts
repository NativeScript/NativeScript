export * from './editable-text-base-common';

import { EditableTextBase as EditableTextBaseCommon, autofillTypeProperty, keyboardTypeProperty, returnKeyTypeProperty, editableProperty, autocapitalizationTypeProperty, autocorrectProperty, hintProperty, placeholderColorProperty, maxLengthProperty } from './editable-text-base-common';
import { textProperty, resetSymbol } from '../text-base';

export * from './editable-text-base-common';

export abstract class EditableTextBase extends EditableTextBaseCommon {
	public nativeViewProtected: Microsoft.UI.Xaml.Controls.TextBox | Microsoft.UI.Xaml.Controls.PasswordBox;

	// Guards against the native TextChanged firing while we write text from JS (avoids loops).
	private _changeFromCode = false;
	private _textChangeDelegate: any = null; // held so the handler isn't GC'd (would go dead)

	public initNativeView(): void {
		super.initNativeView();
		this._attachTextChangeListener();
	}

	// Wires the native text-change event so typing flows back into the framework (valueFormatter,
	// `textChange`). Re-callable because TextField swaps its native view on `secure`.
	public _attachTextChangeListener(): void {
		const nv = this.nativeViewProtected;
		if (!nv) {
			return;
		}
		const ref = new WeakRef(this);
		const asTextBox = nv as Microsoft.UI.Xaml.Controls.TextBox;
		const asPassword = nv as Microsoft.UI.Xaml.Controls.PasswordBox;
		if (typeof asTextBox.Text !== 'undefined') {
			this._textChangeDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.TextChangedEventHandler', (sender: any) => {
				const owner = ref.deref();
				if (owner) owner._onNativeTextChanged((sender as Microsoft.UI.Xaml.Controls.TextBox).Text ?? '');
			});
			asTextBox.TextChanged = this._textChangeDelegate;
		} else if (typeof asPassword.Password !== 'undefined') {
			this._textChangeDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', (sender: any) => {
				const owner = ref.deref();
				if (owner) owner._onNativeTextChanged((sender as Microsoft.UI.Xaml.Controls.PasswordBox).Password ?? '');
			});
			asPassword.PasswordChanged = this._textChangeDelegate;
		}
	}

	private _onNativeTextChanged(rawText: string): void {
		if (this._changeFromCode) {
			return;
		}

		let value = rawText;
		const formatter = this.valueFormatter;
		if (typeof formatter === 'function') {
			// valueFormatter is user code — guard it so a throw can't break native input.
			let formatted = rawText;
			try {
				formatted = formatter(rawText);
			} catch (_e) {}
			if (formatted !== rawText) {
				const asTextBox = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
				const asPassword = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.PasswordBox;
				this._changeFromCode = true;
				try {
					if (typeof asTextBox.Text !== 'undefined') {
						asTextBox.Text = formatted;
						asTextBox.SelectionStart = formatted.length; // keep the caret at the end
					} else if (typeof asPassword.Password !== 'undefined') {
						asPassword.Password = formatted;
					}
				} finally {
					this._changeFromCode = false;
				}
			}
			value = formatted;
		}

		textProperty.nativeValueChange(this, value);
	}

	//@ts-ignore — guard native writes so our own TextChanged handler ignores them.
	[textProperty.setNative](value: string | symbol) {
		this._changeFromCode = true;
		try {
			this._setNativeText(value === resetSymbol);
		} finally {
			this._changeFromCode = false;
		}
	}

	public dismissSoftInput() {
		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			// Toggling focusability is the only way to drop focus from a TextBox/PasswordBox.
			nativeView.IsEnabled = false;
			nativeView.IsEnabled = true;
		}
	}

	public focus(): boolean {
		const result = super.focus();
		if (result && this.nativeViewProtected) {
			this.nativeViewProtected.Focus(Microsoft.UI.Xaml.FocusState.Programmatic);
		}

		return result;
	}

	[keyboardTypeProperty.getDefault](): string {
		return '';
	}
	[keyboardTypeProperty.setNative](_value: string) {
		// Handled by TextField implementation using InputScope
	}

	[autofillTypeProperty.setNative](_value: any) {}

	[returnKeyTypeProperty.getDefault]() {
		return 'done';
	}
	[returnKeyTypeProperty.setNative](_value: any) {}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[editableProperty.setNative](value: boolean) {
		// IsReadOnly only exists on TextBox; on a (secure) PasswordBox this is a no-op.
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.IsReadOnly !== 'undefined') {
			nativeView.IsReadOnly = !value;
		}
	}

	[autocapitalizationTypeProperty.setNative](_value: any) {}

	[autocorrectProperty.setNative](_value: any) {}

	[hintProperty.setNative](value: string) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.PlaceholderText !== 'undefined') {
			nativeView.PlaceholderText = value ?? '';
		}
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[maxLengthProperty.setNative](value: number) {
		const nativeView = this.nativeViewProtected as Microsoft.UI.Xaml.Controls.TextBox;
		if (typeof nativeView.MaxLength !== 'undefined') {
			nativeView.MaxLength = value ?? 0;
		}
	}
}
