export * from './editable-text-base-common';

import { EditableTextBase as EditableTextBaseCommon, autofillTypeProperty, keyboardTypeProperty, returnKeyTypeProperty, editableProperty, autocapitalizationTypeProperty, autocorrectProperty, hintProperty, placeholderColorProperty, maxLengthProperty } from './editable-text-base-common';
import { View } from '../core/view';

export * from './editable-text-base-common';

export abstract class EditableTextBase extends EditableTextBaseCommon {
	public nativeViewProtected: Windows.UI.Xaml.Controls.TextBox | Windows.UI.Xaml.Controls.PasswordBox;

	public dismissSoftInput() {
		try {
			if (this.nativeViewProtected) {
				(this.nativeViewProtected as any).IsEnabled = false;
				(this.nativeViewProtected as any).IsEnabled = true;
			}
		} catch (_e) {}
	}

	public focus(): boolean {
		const result = super.focus();
		try {
			if (result && this.nativeViewProtected && typeof (this.nativeViewProtected as any).Focus === 'function') {
				(this.nativeViewProtected as any).Focus(Windows.UI.Xaml.FocusState.Programmatic);
			}
		} catch (_e) {}

		return result;
	}

	[keyboardTypeProperty.getDefault](): string {
		// No reliable cross-platform default; return empty
		return '';
	}
	[keyboardTypeProperty.setNative](_value: string) {
		// Handled by TextField implementation using InputScope
	}

	[autofillTypeProperty.setNative](_value: any) {
		// UWP autofill is limited; no-op
	}

	[returnKeyTypeProperty.getDefault]() {
		return 'done';
	}
	[returnKeyTypeProperty.setNative](_value: any) {
		// No-op on Windows TextBox
	}

	[editableProperty.setNative](value: boolean) {
		try {
			if (this.nativeViewProtected && typeof (this.nativeViewProtected as any).IsReadOnly !== 'undefined') {
				(this.nativeViewProtected as any).IsReadOnly = !value;
			}
		} catch (_e) {}
	}

	[autocapitalizationTypeProperty.setNative](_value: any) {
		// No direct equivalent on Windows TextBox
	}

	[autocorrectProperty.setNative](_value: any) {
		// No direct equivalent on Windows TextBox
	}

	[hintProperty.setNative](value: string) {
		try {
			if (this.nativeViewProtected && typeof (this.nativeViewProtected as any).PlaceholderText !== 'undefined') {
				(this.nativeViewProtected as any).PlaceholderText = value ?? '';
			}
		} catch (_e) {}
	}

	[maxLengthProperty.setNative](value: number) {
		try {
			if (this.nativeViewProtected && typeof (this.nativeViewProtected as any).MaxLength !== 'undefined') {
				(this.nativeViewProtected as any).MaxLength = value ?? 0;
			}
		} catch (_e) {}
	}
}
