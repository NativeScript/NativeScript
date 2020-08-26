import { EventData, TextBase } from '@nativescript/core';

const values = [3, 7, 13];

export function buttonTap(args: EventData) {
	let page = (<TextBase>args.object).page;
	let lbl = <TextBase>page.getViewById('label');
	let btn = <TextBase>page.getViewById('button');
	let tv = <TextBase>page.getViewById('textView');
	let ft = <TextBase>page.getViewById('formattedText');

	let index = values.indexOf(lbl.lineHeight);
	let newIndex = (index + 1) % values.length;
	let newValue = values[newIndex];

	lbl.lineHeight = newValue;
	btn.lineHeight = newValue;
	tv.lineHeight = newValue;
	ft.lineHeight = newValue;
}
