import * as view from '@nativescript/core/ui/core/view';
import * as observable from '@nativescript/core/data/observable';
import * as label from '@nativescript/core/ui/label';
import * as button from '@nativescript/core/ui/button';
import * as textField from '@nativescript/core/ui/text-field';
import * as textView from '@nativescript/core/ui/text-view';

export function butonTap(args: observable.EventData) {
	const btnChange = <view.View>args.object;
	const lbl = <label.Label>btnChange.parent.getViewById('Label');
	const btn = <button.Button>btnChange.parent.getViewById('Button');
	const textField = <textField.TextField>btnChange.parent.getViewById('TextField');
	const textView = <textView.TextView>btnChange.parent.getViewById('TextView');

	if (lbl.style.whiteSpace === 'normal') {
		lbl.style.whiteSpace = 'nowrap';
		btn.style.whiteSpace = 'nowrap';
		textField.style.whiteSpace = 'nowrap';
		textView.style.whiteSpace = 'nowrap';
	} else if (lbl.style.whiteSpace === 'nowrap') {
		lbl.style.whiteSpace = 'normal';
		btn.style.whiteSpace = 'normal';
		textField.style.whiteSpace = 'normal';
		textView.style.whiteSpace = 'normal';
	}
}
