import { unsetValue, Button, View, eachDescendant, StackLayout } from '@nativescript/core';

export function resetStyles(args) {
	var stackLayout = <StackLayout>args.object.parent.parent;
	eachDescendant(stackLayout, function (v: View) {
		v.style.fontFamily = unsetValue;
		v.style.fontSize = unsetValue;
		v.style.fontStyle = unsetValue;
		v.style.fontWeight = unsetValue;
		v.style.color = unsetValue;
		v.style.textAlignment = unsetValue;
		v.style.paddingLeft = unsetValue;
		v.style.paddingRight = unsetValue;
		v.style.paddingTop = unsetValue;
		v.style.paddingBottom = unsetValue;
		v.style.borderTopColor = unsetValue;
		v.style.borderRightColor = unsetValue;
		v.style.borderBottomColor = unsetValue;
		v.style.borderLeftColor = unsetValue;
		v.style.borderTopWidth = unsetValue;
		v.style.borderRightWidth = unsetValue;
		v.style.borderBottomWidth = unsetValue;
		v.style.borderLeftWidth = unsetValue;
		v.style.borderTopLeftRadius = unsetValue;
		v.style.borderTopRightRadius = unsetValue;
		v.style.borderBottomRightRadius = unsetValue;
		v.style.borderBottomLeftRadius = unsetValue;

		return true;
	});
}

export function issue_ng_1453_loaded(args) {
	var btn = <Button>args.object;
	setTimeout(() => {
		btn.className = 'ui-tests-app-issue-ng-1453-base ui-tests-app-issue-ng-1453-yellow';
	}, 2000);
}
