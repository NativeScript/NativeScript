import { Page } from '@nativescript/core/ui/page';
import { Label } from '@nativescript/core/ui/label';

function createCloseCallback(label: Label, context?: string): (username: string, password: string) => void {
	return function (username: string, password: string) {
		let result = username + '/' + password;
		result = context ? context + '/' + result : result;
		console.log(result);
		label.text = result;
	};
}

function openModal(page: Page, label: Label, context: string) {
	page.showModal('modal-view/login-page', {
		context,
		closeCallback: createCloseCallback(label, context),
		fullscreen: false,
	});
}

export function onTap(args) {
	const page = <Page>args.object.page;
	const label = page.getViewById<Label>('label');
	var fullscreen = (<any>args.object).text.indexOf('(full-screen)') !== -1;

	page.showModal('modal-view/login-page', {
		context: 'context',
		closeCallback: createCloseCallback(label),
		fullscreen,
	});
}

export function onTapStretched(args) {
	const page = <Page>args.object.page;
	const label = page.getViewById<Label>('label');

	page.showModal('modal-view/login-page', {
		context: 'context',
		closeCallback: createCloseCallback(label),
		fullscreen: false,
		animated: false,
		stretched: true,
	});
}

export function onTapSecondModalInCB(args) {
	const page = <Page>args.object.page;
	const label = page.getViewById<Label>('label');
	page.showModal('modal-view/login-page', {
		context: 'First',
		closeCallback: (username: string, password: string) => {
			const result = 'First/' + username + '/' + password;
			console.log(result);
			label.text = result;

			// Open second modal in the close callback of the first one.
			openModal(page, label, 'Second');
		},
	});
}

export function onTapSecondModalInTimer(args) {
	const page = <Page>args.object.page;
	const label = page.getViewById<Label>('label');
	openModal(page, label, 'First');

	// Open second modal 1s after the first one.
	setTimeout(() => openModal(page, label, 'Second'), 1000);
}
