import * as observable from '@nativescript/core/data/observable';
import * as view from '@nativescript/core/ui/core/view';
import * as label from '@nativescript/core/ui/label';

var count = 0;
export function buttonTap2(args: observable.EventData) {
	count++;

	var parent = (<view.View>args.object).parent;
	if (parent) {
		var lbl = parent.getViewById<label.Label>('Label1');
		if (lbl) {
			lbl.text = 'You clicked ' + count + ' times!';
		}
	}
}
