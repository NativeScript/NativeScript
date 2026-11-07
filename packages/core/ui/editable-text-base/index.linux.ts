export * from './editable-text-base-common';

import { EditableTextBase as EditableTextBaseCommon, keyboardTypeProperty, autocapitalizationTypeProperty, autocorrectProperty } from './editable-text-base-common';
import { textProperty } from '../text-base';
import { CoreTypes } from '../../core-types';
import { connect } from '../../utils/gtk.linux';

/** Linux members of EditableTextBase used by TextField and TextView (the public typings don't declare them). */
export interface LinuxEditable {
	_disconnect: (() => void)[];
	_onNativeTextChanged(): void;
	_inputPurpose(): GtkInputPurpose;
	_inputHints(): GtkInputHints;
}

/**
 * Shared by TextField (GtkEntry) and TextView (GtkTextView): text changes flow back
 * through textProperty.nativeValueChange, focus raises focus / blur.
 */
export abstract class EditableTextBase extends EditableTextBaseCommon implements LinuxEditable {
	_disconnect: (() => void)[] = [];
	// set while JS writes the native text, so the change signal doesn't echo it back
	protected _changeFromCode = false;

	/** Widget that takes keyboard focus and input hints. */
	abstract get _editableWidget(): any;
	abstract _getNativeText(): string;
	abstract _setNativeTextValue(text: string): void;
	abstract _applyInputHints(): void;

	public initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const focus: any = gtk_event_controller_focus_new();
		gtk_widget_add_controller(this._editableWidget, focus);
		this._disconnect.push(
			connect(focus, 'enter', () => owner.deref()?._onFocus()),
			connect(focus, 'leave', () => owner.deref()?._onBlur()),
		);
	}

	public disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		super.disposeNativeView();
	}

	_setLinuxText(text: string, _markup: boolean): void {
		if (this._getNativeText() === text) {
			return;
		}
		this._changeFromCode = true;
		try {
			this._setNativeTextValue(text);
		} finally {
			this._changeFromCode = false;
		}
	}

	/** Native text changed by the user. */
	_onNativeTextChanged(): void {
		if (this._changeFromCode) {
			return;
		}
		let text = this._getNativeText();
		if (this.maxLength > 0 && text.length > this.maxLength) {
			text = text.substring(0, this.maxLength);
			this._setLinuxText(text, false);
		}
		if (this.updateTextTrigger === 'textChanged') {
			if (this.valueFormatter) {
				const formatted = this.valueFormatter(text);
				if (formatted !== text) {
					this._setLinuxText(formatted, false);
				}
				text = formatted;
			}
			textProperty.nativeValueChange(this, text);
		}
		if (this.width === 'auto') {
			this.requestLayout();
		}
	}

	_onFocus(): void {
		this.notify({ eventName: EditableTextBase.focusEvent, object: this });
	}

	_onBlur(): void {
		if (this.updateTextTrigger === 'focusLost') {
			textProperty.nativeValueChange(this, this._getNativeText());
		}
		this.notify({ eventName: EditableTextBase.blurEvent, object: this });
	}

	public focus(): boolean {
		return !!gtk_widget_grab_focus(this._editableWidget);
	}

	public dismissSoftInput() {
		const widget = this._editableWidget;
		const root: any = widget && gtk_widget_get_root(widget);
		if (root && gtk_widget_has_focus(widget)) {
			gtk_root_set_focus(root, null);
		}
	}

	_inputPurpose(): GtkInputPurpose {
		switch (this.keyboardType) {
			case 'number':
			case 'decimal':
				return GtkInputPurpose.NUMBER;
			case 'integer':
				return GtkInputPurpose.DIGITS;
			case 'phone':
				return GtkInputPurpose.PHONE;
			case 'url':
				return GtkInputPurpose.URL;
			case 'email':
				return GtkInputPurpose.EMAIL;
			default:
				return GtkInputPurpose.FREE_FORM;
		}
	}

	_inputHints(): GtkInputHints {
		let hints = this.autocorrect === false ? GtkInputHints.NO_SPELLCHECK : this.autocorrect ? GtkInputHints.SPELLCHECK : GtkInputHints.NONE;
		switch (this.autocapitalizationType) {
			case 'words':
				hints |= GtkInputHints.UPPERCASE_WORDS;
				break;
			case 'sentences':
				hints |= GtkInputHints.UPPERCASE_SENTENCES;
				break;
			case 'allcharacters':
				hints |= GtkInputHints.UPPERCASE_CHARS;
				break;
		}
		return hints;
	}

	public _setInputType(_inputType: number): void {
		this._applyInputHints();
	}

	public setSelection(start: number, stop?: number) {}

	[keyboardTypeProperty.setNative](value: CoreTypes.KeyboardInputType) {
		this._applyInputHints();
	}

	[autocapitalizationTypeProperty.setNative](value: CoreTypes.AutocapitalizationInputType) {
		this._applyInputHints();
	}

	[autocorrectProperty.setNative](value: boolean) {
		this._applyInputHints();
	}
}
