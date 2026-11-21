export * from './text-field-common';

import { TextFieldBase, secureProperty } from './text-field-common';
import { editableProperty, hintProperty, maxLengthProperty } from '../editable-text-base';
import type { LinuxEditable } from '../editable-text-base/index.linux';
import { textAlignmentProperty } from '../text-base';
import { CoreTypes } from '../../core-types';
import { connect } from '../../utils/gtk.linux';

/** GtkEntry. */
export class TextField extends TextFieldBase {
	createNativeView() {
		return gtk_entry_new();
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	get _editableWidget(): any {
		return this.nativeViewProtected;
	}

	public initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const entry = this.nativeViewProtected;
		(this as unknown as LinuxEditable)._disconnect.push(
			connect(entry, 'changed', () => (owner.deref() as unknown as LinuxEditable)?._onNativeTextChanged()),
			connect(entry, 'activate', () => {
				const view = owner.deref();
				if (!view) return;
				if (view.closeOnReturn) {
					view.dismissSoftInput();
				}
				view.notify({ eventName: TextField.returnPressEvent, object: view });
			}),
		);
		this._applyInputHints();
	}

	_getNativeText(): string {
		return gtk_editable_get_text(this.nativeViewProtected) ?? '';
	}

	_setNativeTextValue(text: string): void {
		gtk_editable_set_text(this.nativeViewProtected, text);
	}

	_applyInputHints(): void {
		const entry = this.nativeViewProtected;
		if (entry) {
			gtk_entry_set_input_purpose(entry, this.secure ? GtkInputPurpose.PASSWORD : (this as unknown as LinuxEditable)._inputPurpose());
			gtk_entry_set_input_hints(entry, (this as unknown as LinuxEditable)._inputHints());
		}
	}

	public setSelection(start: number, stop?: number) {
		gtk_editable_select_region(this.nativeViewProtected, start, stop ?? start);
	}

	[secureProperty.setNative](value: boolean) {
		gtk_entry_set_visibility(this.nativeViewProtected, value ? 0 : 1);
		this._applyInputHints();
	}

	[editableProperty.setNative](value: boolean) {
		gtk_editable_set_editable(this.nativeViewProtected, value ? 1 : 0);
	}

	[hintProperty.setNative](value: string) {
		gtk_entry_set_placeholder_text(this.nativeViewProtected, value ? `${value}` : null);
	}

	[maxLengthProperty.setNative](value: number) {
		gtk_entry_set_max_length(this.nativeViewProtected, value > 0 ? value : 0);
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		gtk_entry_set_alignment(this.nativeViewProtected, value === 'center' ? 0.5 : value === 'right' ? 1 : 0);
	}
}
