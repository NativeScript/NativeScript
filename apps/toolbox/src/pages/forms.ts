import { Page, Observable, EventData, TextField, PropertyChangeData, TextView } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	textInput = '';
	formattedSSNInput = '';
	formattedPhoneInput = '';
	valueFormatterSSN = formatSSN;
	valueFormatterPhone = formatPhoneNumber;

	textChange(args: PropertyChangeData) {
		console.log(args.value);
		this.notifyPropertyChange('textInput', args.value);
	}

	textChangeSSN(args: PropertyChangeData) {
		console.log(args.value);
		this.notifyPropertyChange('formattedSSNInput', args.value);
	}

	textChangePhone(args: PropertyChangeData) {
		console.log(args.value);
		this.notifyPropertyChange('formattedPhoneInput', args.value);
	}

	textChangeArea(args: PropertyChangeData) {
		const textArea = args.object as TextView;
		console.log('---- AI active:', textArea.isWritingToolsActive);
		console.log('textChangeArea:', args.value);
	}
}

function formatPhoneNumber(value: string, useParens?: boolean) {
	value = value.replace(/\D/g, '');
	var size = value.length;
	if (useParens) {
		if (size > 0) {
			value = '(' + value;
		}
		if (size > 3) {
			value = value.slice(0, 4) + ') ' + value.slice(4, 11);
		}
		if (size > 6) {
			value = value.slice(0, 9) + '-' + value.slice(9);
		}
	} else {
		if (size > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 10);
		}
		if (size > 6) {
			value = value.slice(0, 7) + '-' + value.slice(7);
		}
	}
	return value;
}

function formatSSN(value: string) {
	// if input value is falsy eg if the user deletes the input, then just return
	if (!value) return value;

	// clean the input for any non-digit values
	const ssn = value.replace(/[^\d]/g, '');

	// ssnLength is used to know when to apply our formatting for the ssn
	const ssnLength = ssn.length;

	// we need to return the value with no formatting if its less then four digits
	if (ssnLength < 4) return ssn;

	// if ssnLength is greater than 4 and less the 6 we start to return
	// the formatted number
	if (ssnLength < 6) {
		return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
	}

	// finally, if the ssnLength is greater then 6, we add the last
	// bit of formatting and return it.
	return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5, 9)}`;
}
