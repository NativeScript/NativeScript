import { Page, Observable, EventData, Dialogs, ShowModalOptions } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new StatusBarModel();
}

export class StatusBarModel extends Observable {
	onOpenModal() {
		page.showModal('pages/status-bar/status-bar-modal', {
			fullscreen: true,
			ios: {
				statusBarStyle: 'dark',
			},
			closeCallback(args) {
				// console.log('close modal callback', args);
			},
		} as ShowModalOptions);
	}
}
