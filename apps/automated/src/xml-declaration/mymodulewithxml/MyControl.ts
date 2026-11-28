import * as observable from '@nativescript/core/data/observable';
import * as view from '@nativescript/core/ui/core/view';
import * as label from '@nativescript/core/ui/label';

let count = 0;
export function buttonTap2(args: observable.EventData) {
	count++;

	const parent = (<view.View>args.object).parent;
	if (parent) {
		const lbl = parent.getViewById<label.Label>('Label1');
		if (lbl) {
			lbl.text = 'You clicked ' + count + ' times!';
		}
	}
}
