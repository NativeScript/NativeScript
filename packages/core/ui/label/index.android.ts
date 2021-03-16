import { Label as LabelDefinition } from '.';
import { TextBase, whiteSpaceProperty } from '../text-base';
import { profile } from '../../profiling';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { CoreTypes } from '../../core-types';

export * from '../text-base';

let TextView: typeof android.widget.TextView;

@CSSType('Label')
export class Label extends TextBase implements LabelDefinition {
	nativeViewProtected: android.widget.TextView;
	nativeTextViewProtected: android.widget.TextView;

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
		if (!TextView) {
			TextView = android.widget.TextView;
		}

		return new TextView(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const textView = this.nativeTextViewProtected;
		textView.setSingleLine(true);
		textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
	}

	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		// Label initial value is no-wrap. set in initNativeView
		const newValue = value === 'initial' ? 'nowrap' : value;
		super[whiteSpaceProperty.setNative](newValue);
	}
}

Label.prototype._isSingleLine = true;
Label.prototype.recycleNativeView = 'auto';
