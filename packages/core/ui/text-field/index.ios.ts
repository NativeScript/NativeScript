import { TextFieldBase, secureProperty } from './text-field-common';
import { textProperty } from '../text-base';
import { hintProperty, placeholderColorProperty, _updateCharactersInRangeReplacementString } from '../editable-text-base';
import { Color } from '../../color';
import { colorProperty, Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../styling/style-properties';
import { layout } from '../../utils';
import { profile } from '../../profiling';

export * from './text-field-common';

const zeroLength: Length = {
	value: 0,
	unit: 'px',
};

@NativeClass
class UITextFieldDelegateImpl extends NSObject implements UITextFieldDelegate {
	public static ObjCProtocols = [UITextFieldDelegate];

	private _owner: WeakRef<TextField>;
	private firstEdit: boolean;

	public static initWithOwner(owner: WeakRef<TextField>): UITextFieldDelegateImpl {
		const delegate = <UITextFieldDelegateImpl>UITextFieldDelegateImpl.new();
		delegate._owner = owner;

		return delegate;
	}

	public textFieldShouldBeginEditing(textField: UITextField): boolean {
		const owner = this._owner.get();
		if (owner) {
			return owner.textFieldShouldBeginEditing(textField);
		}

		return true;
	}

	public textFieldDidBeginEditing(textField: UITextField): void {
		const owner = this._owner.get();
		if (owner) {
			owner.textFieldDidBeginEditing(textField);
		}
	}

	public textFieldDidEndEditing(textField: UITextField) {
		const owner = this._owner.get();
		if (owner) {
			owner.textFieldDidEndEditing(textField);
		}
	}

	public textFieldShouldClear(textField: UITextField) {
		const owner = this._owner.get();
		if (owner) {
			return owner.textFieldShouldClear(textField);
		}

		return true;
	}

	public textFieldShouldReturn(textField: UITextField): boolean {
		// Called when the user presses the return button.
		const owner = this._owner.get();
		if (owner) {
			return owner.textFieldShouldReturn(textField);
		}

		return true;
	}

	public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
		const owner = this._owner.get();
		if (owner) {
			return owner.textFieldShouldChangeCharactersInRangeReplacementString(textField, range, replacementString);
		}

		return true;
	}
}

@NativeClass
class UITextFieldImpl extends UITextField {
	private _owner: WeakRef<TextField>;

	public static initWithOwner(owner: WeakRef<TextField>): UITextFieldImpl {
		const handler = <UITextFieldImpl>UITextFieldImpl.new();
		handler._owner = owner;

		return handler;
	}

	private _getTextRectForBounds(bounds: CGRect): CGRect {
		const owner = this._owner ? this._owner.get() : null;

		if (!owner) {
			return bounds;
		}

		const size = bounds.size;

		const x = layout.toDeviceIndependentPixels(owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft);
		const y = layout.toDeviceIndependentPixels(owner.effectiveBorderTopWidth + owner.effectivePaddingTop);
		const width = layout.toDeviceIndependentPixels(layout.toDevicePixels(size.width) - (owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft + owner.effectivePaddingRight + owner.effectiveBorderRightWidth));
		const height = layout.toDeviceIndependentPixels(layout.toDevicePixels(size.height) - (owner.effectiveBorderTopWidth + owner.effectivePaddingTop + owner.effectivePaddingBottom + owner.effectiveBorderBottomWidth));

		return CGRectMake(x, y, width, height);
	}

	public textRectForBounds(bounds: CGRect): CGRect {
		return this._getTextRectForBounds(bounds);
	}

	public editingRectForBounds(bounds: CGRect): CGRect {
		return this._getTextRectForBounds(bounds);
	}
}

export class TextField extends TextFieldBase {
	nativeViewProtected: UITextField;
	private _delegate: UITextFieldDelegateImpl;

	createNativeView() {
		return UITextFieldImpl.initWithOwner(new WeakRef(this));
	}

	initNativeView() {
		super.initNativeView();
		this._delegate = UITextFieldDelegateImpl.initWithOwner(new WeakRef(this));
	}

	disposeNativeView() {
		this._delegate = null;
		super.disposeNativeView();
	}

	@profile
	public onLoaded() {
		super.onLoaded();
		this.ios.delegate = this._delegate;
	}

	public onUnloaded() {
		this.ios.delegate = null;
		super.onUnloaded();
	}

	get ios(): UITextField {
		return this.nativeViewProtected;
	}

	private firstEdit: boolean;

	public textFieldShouldBeginEditing(textField: UITextField): boolean {
		this.firstEdit = true;

		return this.editable;
	}

	public textFieldDidBeginEditing(textField: UITextField): void {
		this.notify({ eventName: TextField.focusEvent, object: this });
	}

	public textFieldDidEndEditing(textField: UITextField) {
		if (this.updateTextTrigger === 'focusLost') {
			textProperty.nativeValueChange(this, textField.text);
		}

		this.dismissSoftInput();
	}

	public textFieldShouldClear(textField: UITextField) {
		this.firstEdit = false;
		textProperty.nativeValueChange(this, '');

		return true;
	}

	public textFieldShouldReturn(textField: UITextField): boolean {
		// Called when the user presses the return button.
		if (this.closeOnReturn) {
			this.dismissSoftInput();
		}
		this.notify({ eventName: TextField.returnPressEvent, object: this });

		return true;
	}

	public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
		if (this.secureWithoutAutofill && !textField.secureTextEntry) {
			/**
			 * Helps avoid iOS 12+ autofill strong password suggestion prompt
			 * Discussed in several circles but for example:
			 * https://github.com/expo/expo/issues/2571#issuecomment-473347380
			 */
			textField.secureTextEntry = true;
		}
		const delta = replacementString.length - range.length;
		if (delta > 0) {
			if (textField.text.length + delta > this.maxLength) {
				return false;
			}
		}

		if (this.updateTextTrigger === 'textChanged') {
			if (textField.secureTextEntry && this.firstEdit) {
				textProperty.nativeValueChange(this, replacementString);
			} else {
				if (range.location <= textField.text.length) {
					const newText = NSString.stringWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
					textProperty.nativeValueChange(this, newText);
				}
			}
		}

		if (this.formattedText) {
			_updateCharactersInRangeReplacementString(this.formattedText, range.location, range.length, replacementString);
		}

		this.firstEdit = false;

		return true;
	}

	[hintProperty.getDefault](): string {
		return this.nativeTextViewProtected.placeholder;
	}
	[hintProperty.setNative](value: string) {
		this._updateAttributedPlaceholder();
	}

	[secureProperty.getDefault](): boolean {
		return this.nativeTextViewProtected.secureTextEntry;
	}
	[secureProperty.setNative](value: boolean) {
		this.nativeTextViewProtected.secureTextEntry = value;
	}

	[colorProperty.getDefault](): { textColor: UIColor; tintColor: UIColor } {
		return {
			textColor: this.nativeTextViewProtected.textColor,
			tintColor: this.nativeTextViewProtected.tintColor,
		};
	}
	[colorProperty.setNative](value: Color | { textColor: UIColor; tintColor: UIColor }) {
		if (value instanceof Color) {
			let color = value instanceof Color ? value.ios : value;
			this.nativeTextViewProtected.textColor = color;
			this.nativeTextViewProtected.tintColor = color;
		} else {
			this.nativeTextViewProtected.textColor = value.textColor;
			this.nativeTextViewProtected.tintColor = value.tintColor;
		}
	}

	[placeholderColorProperty.getDefault](): UIColor {
		return null;
	}
	[placeholderColorProperty.setNative](value: UIColor | Color) {
		this._updateAttributedPlaceholder();
	}

	_updateAttributedPlaceholder(): void {
		let stringValue = this.hint;
		if (stringValue === null || stringValue === void 0) {
			stringValue = '';
		} else {
			stringValue = stringValue + '';
		}
		if (stringValue === '') {
			// we do not use empty string since initWithStringAttributes does not return proper value and
			// nativeView.attributedPlaceholder will be null
			stringValue = ' ';
		}
		const attributes: any = {};
		if (this.style.placeholderColor) {
			attributes[NSForegroundColorAttributeName] = this.style.placeholderColor.ios;
		}
		const attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(stringValue, attributes);
		this.nativeTextViewProtected.attributedPlaceholder = attributedPlaceholder;
	}

	[paddingTopProperty.getDefault](): Length {
		return zeroLength;
	}
	[paddingTopProperty.setNative](value: Length) {
		// Padding is realized via UITextFieldImpl.textRectForBounds method
	}

	[paddingRightProperty.getDefault](): Length {
		return zeroLength;
	}
	[paddingRightProperty.setNative](value: Length) {
		// Padding is realized via UITextFieldImpl.textRectForBounds method
	}

	[paddingBottomProperty.getDefault](): Length {
		return zeroLength;
	}
	[paddingBottomProperty.setNative](value: Length) {
		// Padding is realized via UITextFieldImpl.textRectForBounds method
	}

	[paddingLeftProperty.getDefault](): Length {
		return zeroLength;
	}
	[paddingLeftProperty.setNative](value: Length) {
		// Padding is realized via UITextFieldImpl.textRectForBounds method
	}
}
