import { Page, TextField } from '@nativescript/core';

export function setText(args) {
	let page = args;

	if (page.constructor.name !== 'Page') {
		page = args.object.page;
		setTextFieldText(page, 'inXml', 'in xml');
	}

	setTextFieldText(page, 'maxLenghtFromCodeBehindWithText', 'from code behind');
	setTextFieldText(page, 'useInput', '');
	setTextFieldText(page, 'maxLenghtFromCodeBehind', '');
}

export function pageLoaded(args) {
	const page = args.object;
	setText(page);
}

function setTextFieldText(page: Page, name: string, text: string) {
	const textField = <TextField>page.getViewById(name);

	if (name === 'maxLenghtFromCodeBehind' || name === 'maxLenghtFromCodeBehindWithText') {
		textField.maxLength = 3;
	}

	textField.text = text;
}
