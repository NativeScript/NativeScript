import { Page, Observable, EventData, Dialogs } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SampleData();
}

export class SampleData extends Observable {
	dialogAlert() {
		Dialogs.alert('Hello');
	}
	dialogAlertWithOptions() {
		Dialogs.alert({
			title: 'Hello',
			message: 'Oh hi!',
			okButtonText: 'Nice',
		});
	}
	dialogConfirm() {
		Dialogs.confirm('Is it?').then((ok) => {
			Dialogs.alert('Ok then!');
		});
	}

	dialogLogin() {
		Dialogs.login('Login').then((result) => {
			console.log(result);
		});
	}
	dialogAction() {
		Dialogs.action('Actions', 'Cancel', ['Test', 'Testing']).then((result) => {
			console.log(result);
		});
	}
}
