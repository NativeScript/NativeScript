import { View, unsetValue, eachDescendant, StackLayout } from '@nativescript/core';

export function resetStyles(args) {
	var stackLayout = <StackLayout>args.object.parent;
	eachDescendant(stackLayout, function (v: View) {
		v.style.fontFamily = unsetValue;
		v.style.fontSize = unsetValue;
		v.style.fontStyle = unsetValue;
		v.style.fontWeight = unsetValue;
		v.style.color = unsetValue;
		v.style.textAlignment = unsetValue;

		return true;
	});
}
