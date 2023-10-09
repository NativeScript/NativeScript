import { Label as LabelDefinition } from '.';
import { TextBase, whiteSpaceProperty } from '../text-base';
import { StyleableTextView } from '../text-base/styleable-text-view';
import { profile } from '../../profiling';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { CoreTypes } from '../../core-types';

export * from '../text-base';

@CSSType('Label')
export class Label extends TextBase implements LabelDefinition {
	nativeViewProtected: StyleableTextView;
	nativeTextViewProtected: StyleableTextView;

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
		const styleableTextView = new StyleableTextView(this._context);
		styleableTextView.owner = new WeakRef(this);
		return styleableTextView;
	}

	public initNativeView(): void {
		super.initNativeView();
		const textView = this.nativeTextViewProtected;
		textView.setSingleLine(true);
		textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
		textView.setGravity(android.view.Gravity.CENTER_VERTICAL);
	}

	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		// Label initial value is no-wrap. set in initNativeView
		const newValue = value === 'initial' ? 'nowrap' : value;
		super[whiteSpaceProperty.setNative](newValue);
	}
}

Label.prototype._isSingleLine = true;
Label.prototype.recycleNativeView = 'auto';
