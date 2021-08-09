import * as stack from '@nativescript/core/ui/layouts/stack-layout';
import { unsetValue } from '@nativescript/core';

export function buttonTap(args) {
	var stackLayout = <stack.StackLayout>args.object.parent;

	for (var i = 0; i < stackLayout.getChildrenCount(); i++) {
		var v = stackLayout.getChildAt(i);
		v.style.fontFamily = unsetValue;
		v.style.fontSize = unsetValue;
		v.style.fontStyle = unsetValue;
		v.style.fontWeight = unsetValue;

		v.style.color = unsetValue;
		v.style.textAlignment = unsetValue;
	}
}
