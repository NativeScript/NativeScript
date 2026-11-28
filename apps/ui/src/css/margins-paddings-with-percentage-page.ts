import { View, getViewById, EventData, Button } from '@nativescript/core';

let isSCCWithPercentage = true;

export function pageLoaded(args: EventData) {
	setBtnText(args);
}

export function applyTap(args: EventData) {
	const page = (<View>args.object).page;
	const cssClass = isSCCWithPercentage ? 'without-percent' : 'with-percent';
	isSCCWithPercentage = !isSCCWithPercentage;
	console.log(cssClass);
	page.className = cssClass;
	setBtnText(args);
}

function setBtnText(args: EventData) {
	const parent = (<View>args.object).parent;
	if (parent) {
		const btn = <Button>getViewById(parent, 'button');
		if (btn) {
			if (isSCCWithPercentage) {
				btn.text = 'css with %';
			} else {
				btn.text = 'css without %';
			}

			console.log(btn.text);
		}
	}
}
