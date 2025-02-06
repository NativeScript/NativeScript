import { Label as LabelDefinition } from '.';
import { textAlignmentProperty, TextBase, whiteSpaceProperty } from '../text-base';
import { profile } from '../../profiling';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { CoreTypes } from '../../core-types';
import { SDK_VERSION } from '../../utils';

export * from '../text-base';

@CSSType('Label')
export class Label extends TextBase implements LabelDefinition {
	nativeViewProtected: org.nativescript.widgets.StyleableTextView;
	nativeTextViewProtected: org.nativescript.widgets.StyleableTextView;

	get textWrap(): boolean {
		return this.style.whiteSpace === 'normal';
	}
	set textWrap(value: boolean) {
		if (typeof value === 'string') {
			value = booleanConverter(value);
		}

		this.style.whiteSpace = value ? 'normal' : 'nowrap';
	}

	@profile
	public createNativeView() {
		return new org.nativescript.widgets.StyleableTextView(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const textView = this.nativeTextViewProtected;
		textView.setSingleLine(true);
		textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
		textView.setGravity(android.view.Gravity.CENTER_VERTICAL);

		if (this.hasRtlSupport) {
			// This is a default to match iOS layout direction behaviour
			textView.setTextAlignment(android.view.View.TEXT_ALIGNMENT_VIEW_START);
		}
	}

	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		// Label initial value is no-wrap. set in initNativeView
		const newValue = value === 'initial' ? 'nowrap' : value;
		super[whiteSpaceProperty.setNative](newValue);
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		// TextAlignment API has no effect unless app has rtl support defined in manifest
		// so use gravity to align text as a fallback
		if (!this.hasRtlSupport) {
			super[textAlignmentProperty.setNative](value);
		} else {
			switch (value) {
				case 'left':
				case 'justify':
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_TEXT_START);
					break;
				case 'center':
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_CENTER);
					break;
				case 'right':
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_TEXT_END);
					break;
				default:
					// initial
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_VIEW_START);
					break;
			}

			if (SDK_VERSION >= 26) {
				if (value === 'justify') {
					this.nativeTextViewProtected.setJustificationMode(android.text.Layout.JUSTIFICATION_MODE_INTER_WORD);
				} else {
					this.nativeTextViewProtected.setJustificationMode(android.text.Layout.JUSTIFICATION_MODE_NONE);
				}
			}
		}
	}
}

Label.prototype._isSingleLine = true;
Label.prototype.recycleNativeView = 'auto';
