import * as stack from '@nativescript/core/ui/layouts/stack-layout';
import { unsetValue } from '@nativescript/core';

export function buttonTap(args) {
	const stackLayout = <stack.StackLayout>args.object.parent;

	for (let i = 0; i < stackLayout.getChildrenCount(); i++) {
		const v = stackLayout.getChildAt(i);
		v.style.fontFamily = unsetValue;
		v.style.fontSize = unsetValue;
		v.style.fontStyle = unsetValue;
		v.style.fontWeight = unsetValue;

		v.style.color = unsetValue;
		v.style.textAlignment = unsetValue;
	}
}
