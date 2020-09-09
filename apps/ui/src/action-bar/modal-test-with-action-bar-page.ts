import { EventData, Frame, Page } from '@nativescript/core';

export function btnClick(args: EventData) {
	(<Page>args.object).page.showModal('action-bar/modal-page-hidden-action-bar-page', {
		context: '',
		closeCallback: (arg: string) => console.log('Callback args: ' + arg),
		fullscreen: true,
	});
}

export function btnBack(args: EventData) {
	Frame.topmost().goBack();
}
