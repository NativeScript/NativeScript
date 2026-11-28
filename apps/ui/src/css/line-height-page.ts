import { EventData, TextBase } from '@nativescript/core';

const values = [3, 7, 13];

export function buttonTap(args: EventData) {
	const page = (<TextBase>args.object).page;
	const lbl = <TextBase>page.getViewById('label');
	const btn = <TextBase>page.getViewById('button');
	const tv = <TextBase>page.getViewById('textView');
	const ft = <TextBase>page.getViewById('formattedText');

	const index = values.indexOf(lbl.lineHeight);
	const newIndex = (index + 1) % values.length;
	const newValue = values[newIndex];

	lbl.lineHeight = newValue;
	btn.lineHeight = newValue;
	tv.lineHeight = newValue;
	ft.lineHeight = newValue;
}
