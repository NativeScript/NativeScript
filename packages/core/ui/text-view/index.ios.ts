import { ScrollEventData } from '../scroll-view';
import { textProperty } from '../text-base';
import { iosWritingToolsAllowedInputProperty, iosWritingToolsBehaviorProperty, TextViewBase as TextViewBaseCommon, WritingToolsAllowedInput, WritingToolsBehavior } from './text-view-common';
import { editableProperty, hintProperty, placeholderColorProperty, _updateCharactersInRangeReplacementString } from '../editable-text-base';
import { CoreTypes } from '../../core-types';
import { CSSType } from '../core/view';
import { Color } from '../../color';
import { colorProperty, borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, Length } from '../styling/style-properties';
import { layout, isRealDevice } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';

import { profile } from '../../profiling';
export { WritingToolsAllowedInput, WritingToolsBehavior } from './text-view-common';

@NativeClass
class UITextViewDelegateImpl extends NSObject implements UITextViewDelegate {
	public static ObjCProtocols = [UITextViewDelegate];

	private _owner: WeakRef<TextView>;

	public static initWithOwner(owner: WeakRef<TextView>): UITextViewDelegateImpl {
		const impl = <UITextViewDelegateImpl>UITextViewDelegateImpl.new();
		impl._owner = owner;

		return impl;
	}

	public textViewShouldBeginEditing(textView: UITextView): boolean {
		const owner = this._owner?.deref();
		if (owner) {
			return owner.textViewShouldBeginEditing(textView);
		}

		return true;
	}

	public textViewDidBeginEditing(textView: UITextView): void {
		const owner = this._owner?.deref();
		if (owner) {
			owner.textViewDidBeginEditing(textView);
		}
	}

	public textViewDidEndEditing(textView: UITextView): void {
		const owner = this._owner?.deref();
		if (owner) {
			owner.textViewDidEndEditing(textView);
		}
	}

	public textViewDidChange(textView: UITextView): void {
		const owner = this._owner?.deref();
		if (owner) {
			owner.textViewDidChange(textView);
		}
	}

	public textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, replacementString: string): boolean {
		const owner = this._owner?.deref();
		if (owner) {
			return owner.textViewShouldChangeTextInRangeReplacementText(textView, range, replacementString);
		}

		return true;
	}

	public scrollViewDidScroll(sv: UIScrollView): void {
		const owner = this._owner?.deref();
		if (owner) {
			return owner.scrollViewDidScroll(sv);
		}
	}

	public textViewWritingToolsWillBegin(textView: UITextView): void {
		const owner = this._owner?.deref();
		if (owner) {
			owner.isWritingToolsActive = true;
		}
	}

	public textViewWritingToolsDidEnd(textView: UITextView): void {
		const owner = this._owner?.deref();
		if (owner) {
			owner.isWritingToolsActive = false;
			owner.textViewDidChange(textView);
		}
	}
}

@NativeClass
class NoScrollAnimationUITextView extends UITextView {
	// see https://github.com/NativeScript/NativeScript/issues/6863
	// UITextView internally scrolls the text you are currently typing to visible when newline character
	// is typed but the scroll animation is not needed because at the same time we are expanding
	// the textview (setting its frame)
	public setContentOffsetAnimated(contentOffset: CGPoint, animated: boolean): void {
		super.setContentOffsetAnimated(contentOffset, false);
	}
}

@CSSType('TextView')
export class TextView extends TextViewBaseCommon {
	nativeViewProtected: UITextView;
	nativeTextViewProtected: UITextView;
	private _delegate: UITextViewDelegateImpl;
	private _isShowingHint: boolean;

	public _isEditing: boolean;

	private _hintColor = SDK_VERSION <= 12 || !UIColor.placeholderTextColor ? UIColor.blackColor.colorWithAlphaComponent(0.22) : UIColor.placeholderTextColor;
	private _textColor = SDK_VERSION <= 12 || !UIColor.labelColor ? null : UIColor.labelColor;

	createNativeView() {
		const textView = NoScrollAnimationUITextView.new();
		if (!textView.font) {
			textView.font = UIFont.systemFontOfSize(12);
		}

		return textView;
	}

	initNativeView() {
		super.initNativeView();
		this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(this));
		this.nativeTextViewProtected.delegate = this._delegate;
	}

	disposeNativeView() {
		this._delegate = null;
		super.disposeNativeView();
	}

	// @ts-ignore
	get ios(): UITextView {
		return this.nativeViewProtected;
	}

	public textViewShouldBeginEditing(textView: UITextView): boolean {
		if (this._isShowingHint) {
			this.showText();
		}

		return this.editable;
	}

	public textViewDidBeginEditing(textView: UITextView): void {
		this._isEditing = true;
		this.notify({ eventName: TextView.focusEvent, object: this });
	}

	public textViewDidEndEditing(textView: UITextView): void {
		if (this.updateTextTrigger === 'focusLost') {
			textProperty.nativeValueChange(this, textView.text);
		}

		this._isEditing = false;
		this.dismissSoftInput();
		this._refreshHintState(this.hint, textView.text);
	}

	public textViewDidChange(textView: UITextView): void {
		if (!this.isWritingToolsActive || this.enableWritingToolsEvents) {
			if (this.updateTextTrigger === 'textChanged') {
				textProperty.nativeValueChange(this, textView.text);
			}
			this.requestLayout();
		}
	}

	public textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, replacementString: string): boolean {
		const delta = replacementString.length - range.length;
		if (delta > 0) {
			if (textView.text.length + delta > this.maxLength) {
				return false;
			}
		}

		if (replacementString === '\n') {
			this.notify({ eventName: TextView.returnPressEvent, object: this });
		}

		if (this.formattedText) {
			_updateCharactersInRangeReplacementString(this.formattedText, range.location, range.length, replacementString);
		}

		return true;
	}

	public scrollViewDidScroll(sv: UIScrollView): void {
		const contentOffset = this.nativeViewProtected.contentOffset;
		this.notify(<ScrollEventData>{
			object: this,
			eventName: 'scroll',
			scrollX: contentOffset.x,
			scrollY: contentOffset.y,
		});
	}

	public _refreshHintState(hint: string, text: string) {
		if (this.formattedText) {
			return;
		}

		if (text !== null && text !== undefined && text !== '') {
			this.showText();
		} else if (!this._isEditing && hint !== null && hint !== undefined && hint !== '') {
			this.showHint(hint);
		} else {
			this._isShowingHint = false;
			this.nativeTextViewProtected.text = '';
		}
	}

	private _refreshColor() {
		if (this._isShowingHint) {
			const placeholderColor = this.style.placeholderColor;
			const color = this.style.color;

			if (placeholderColor) {
				this.nativeTextViewProtected.textColor = placeholderColor.ios;
			} else if (color) {
				// Use semi-transparent version of color for back-compatibility
				this.nativeTextViewProtected.textColor = color.ios.colorWithAlphaComponent(0.22);
			} else {
				this.nativeTextViewProtected.textColor = this._hintColor;
			}
		} else {
			const color = this.style.color;

			if (color) {
				this.nativeTextViewProtected.textColor = color.ios;
				this.nativeTextViewProtected.tintColor = color.ios;
			} else {
				this.nativeTextViewProtected.textColor = this._textColor;
				this.nativeTextViewProtected.tintColor = this._textColor;
			}
		}
	}

	public showHint(hint: string) {
		const nativeView = this.nativeTextViewProtected;

		this._isShowingHint = true;
		this._refreshColor();

		const hintAsString: string = hint === null || hint === undefined ? '' : hint.toString();
		nativeView.text = hintAsString;
	}

	public showText() {
		this._isShowingHint = false;
		this._setNativeText();
		this._refreshColor();
		this.requestLayout();
	}

	[textProperty.getDefault](): string {
		return '';
	}
	[textProperty.setNative](value: string) {
		this._refreshHintState(this.hint, value);
	}

	[hintProperty.getDefault](): string {
		return '';
	}
	[hintProperty.setNative](value: string) {
		this._refreshHintState(value, this.text);
	}

	[editableProperty.getDefault](): boolean {
		return this.nativeTextViewProtected.editable;
	}
	[editableProperty.setNative](value: boolean) {
		this.nativeTextViewProtected.editable = value;
	}

	[colorProperty.setNative](color: Color) {
		this._refreshColor();
	}
	[placeholderColorProperty.setNative](value: Color) {
		this._refreshColor();
	}

	[borderTopWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.top,
			unit: 'px',
		};
	}
	[borderTopWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[borderRightWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.right,
			unit: 'px',
		};
	}
	[borderRightWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[borderBottomWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.bottom,
			unit: 'px',
		};
	}
	[borderBottomWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}

	[borderLeftWidthProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.left,
			unit: 'px',
		};
	}
	[borderLeftWidthProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.top,
			unit: 'px',
		};
	}
	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: top,
			left: inset.left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.right,
			unit: 'px',
		};
	}
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: inset.left,
			bottom: inset.bottom,
			right: right,
		};
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.bottom,
			unit: 'px',
		};
	}
	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: inset.left,
			bottom: bottom,
			right: inset.right,
		};
	}
	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return {
			value: this.nativeTextViewProtected.textContainerInset.left,
			unit: 'px',
		};
	}
	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		const inset = this.nativeTextViewProtected.textContainerInset;
		const left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
		this.nativeTextViewProtected.textContainerInset = {
			top: inset.top,
			left: left,
			bottom: inset.bottom,
			right: inset.right,
		};
	}

	[iosWritingToolsBehaviorProperty.setNative](value: WritingToolsBehavior) {
		if (SDK_VERSION >= 18 && isRealDevice()) {
			this.nativeTextViewProtected.writingToolsBehavior = this._writingToolsBehaviorType(value);
		}
	}

	[iosWritingToolsAllowedInputProperty.setNative](value: Array<WritingToolsAllowedInput>) {
		if (SDK_VERSION >= 18 && isRealDevice()) {
			let writingToolsInput = null;
			for (const inputType of value) {
				writingToolsInput = (writingToolsInput != null ? writingToolsInput : 0) + this._writingToolsAllowedType(inputType);
			}
			if (writingToolsInput === null) {
				writingToolsInput = UIWritingToolsResultOptions.Default;
			}
			this.nativeTextViewProtected.allowsEditingTextAttributes = true;
			this.nativeTextViewProtected.allowedWritingToolsResultOptions = writingToolsInput;
		}
	}

	private _writingToolsBehaviorType(value: WritingToolsBehavior) {
		switch (value) {
			case WritingToolsBehavior.Complete:
				return UIWritingToolsBehavior.Complete;
			case WritingToolsBehavior.Default:
				return UIWritingToolsBehavior.Default;
			case WritingToolsBehavior.Limited:
				return UIWritingToolsBehavior.Limited;
			case WritingToolsBehavior.None:
				return UIWritingToolsBehavior.None;
		}
	}

	private _writingToolsAllowedType(value: WritingToolsAllowedInput) {
		switch (value) {
			case WritingToolsAllowedInput.Default:
				return UIWritingToolsResultOptions.Default;
			case WritingToolsAllowedInput.List:
				return UIWritingToolsResultOptions.List;
			case WritingToolsAllowedInput.PlainText:
				return UIWritingToolsResultOptions.PlainText;
			case WritingToolsAllowedInput.RichText:
				return UIWritingToolsResultOptions.RichText;
		}
	}
}

TextView.prototype.recycleNativeView = 'auto';
