import { EventData, TextBase } from '@nativescript/core';

const possibleValues = ['none', 'underline', 'line-through', 'underline line-through'];

export function butonTap(args: EventData) {
	let page = (<TextBase>args.object).page;
	let lbl = <TextBase>page.getViewById('Label');
	let btn = <TextBase>page.getViewById('Button');
	let textField = <TextBase>page.getViewById('TextField');
	let textView = <TextBase>page.getViewById('TextView');

	let currentIndex = possibleValues.indexOf(lbl.textDecoration);
	let newIndex = (currentIndex + 1) % possibleValues.length;
	let newValue = <any>possibleValues[newIndex];

	lbl.textDecoration = newValue;
	btn.textDecoration = newValue;
	textField.textDecoration = newValue;
	textView.textDecoration = newValue;

	if (lbl.text === 'Change text') {
		lbl.text = btn.text = textField.text = textView.text = 'Text changed';
	} else {
		lbl.text = btn.text = textField.text = textView.text = 'Change text';
	}
}
