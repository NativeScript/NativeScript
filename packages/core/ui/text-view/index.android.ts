import { TextViewBase as TextViewBaseCommon, maxLinesProperty } from './text-view-common';
import { CSSType } from '../core/view';

export * from '../text-base';

@CSSType('TextView')
export class TextView extends TextViewBaseCommon {
	public _configureEditText(editText: android.widget.EditText) {
		editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
		editText.setGravity(android.view.Gravity.TOP | android.view.Gravity.START);
	}

	public resetNativeView(): void {
		super.resetNativeView();
		this.nativeTextViewProtected.setGravity(android.view.Gravity.TOP | android.view.Gravity.START);
	}

	[maxLinesProperty.getDefault](): number {
		return 0;
	}

	[maxLinesProperty.setNative](value: number) {
		if (value <= 0) {
			this.nativeTextViewProtected.setMaxLines(Number.MAX_VALUE);

			return;
		}

		this.nativeTextViewProtected.setMaxLines(value);
	}
}

TextView.prototype.recycleNativeView = 'auto';
