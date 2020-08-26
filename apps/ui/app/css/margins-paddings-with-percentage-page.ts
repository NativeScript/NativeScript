import { View, getViewById, EventData, Button } from '@nativescript/core';

let isSCCWithPercentage = true;

export function pageLoaded(args: EventData) {
	setBtnText(args);
}

export function applyTap(args: EventData) {
	let page = (<View>args.object).page;
	let cssClass = isSCCWithPercentage ? 'without-percent' : 'with-percent';
	isSCCWithPercentage = !isSCCWithPercentage;
	console.log(cssClass);
	page.className = cssClass;
	setBtnText(args);
}

function setBtnText(args: EventData) {
	let parent = (<View>args.object).parent;
	if (parent) {
		var btn = <Button>getViewById(parent, 'button');
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
