import { EventData, TextBase } from '@nativescript/core';

const possibleValues = ['none', 'underline', 'line-through', 'underline line-through'];

export function butonTap(args: EventData) {
	const page = (<TextBase>args.object).page;
	const lbl = <TextBase>page.getViewById('Label');
	const btn = <TextBase>page.getViewById('Button');
	const textField = <TextBase>page.getViewById('TextField');
	const textView = <TextBase>page.getViewById('TextView');

	const currentIndex = possibleValues.indexOf(lbl.textDecoration);
	const newIndex = (currentIndex + 1) % possibleValues.length;
	const newValue = <any>possibleValues[newIndex];

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
