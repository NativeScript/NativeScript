import { EventData, TextBase, parseCSSShadow } from '@nativescript/core';

// prettier-ignore
const possibleValues = [
	'2 10 4 rgb(255, 100, 100)',
	'2 10 2 rgba(10, 10, 10, 0.5)',
	'1 1 1 #55a',
	'2 2 2 #333',
	'0 0 1 yellow',
	'-1 -1 1 #333',
	''
];
let currentIndex = 0;

export function buttonTap(args: EventData) {
	const page = (<TextBase>args.object).page;
	const lbl = <TextBase>page.getViewById('Label');
	const btn = <TextBase>page.getViewById('Button');
	const textField = <TextBase>page.getViewById('TextField');
	const textView = <TextBase>page.getViewById('TextView');

	const newIndex = currentIndex++ % possibleValues.length;
	const newValue = possibleValues[newIndex];

	lbl.textShadow = parseCSSShadow(newValue);
	btn.textShadow = parseCSSShadow(newValue);
	textField.textShadow = parseCSSShadow(newValue);
	textView.textShadow = parseCSSShadow(newValue);

	if (lbl.text === 'Change text') {
		lbl.text = btn.text = textField.text = textView.text = 'Text changed';
	} else {
		lbl.text = btn.text = textField.text = textView.text = 'Change text';
	}
}
