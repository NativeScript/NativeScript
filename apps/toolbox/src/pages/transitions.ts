import { Observable, EventData, Page, ShowModalOptions, SharedTransition, ModalTransition, PageTransition, FadeTransition, SlideTransition } from '@nativescript/core';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel();
}

export class TransitionsModel extends Observable {
	open(args: EventData) {
		const type = (<any>args.object).type;
		let moduleName: string;
		switch (type) {
			case '1':
				moduleName = `pages/transitions/transition-example`;
				break;
			case '2':
				moduleName = `pages/transitions/transition-page-modal-example`;
				break;
		}
		page.frame.navigate({
			moduleName,
			transition: SharedTransition.custom(new PageTransition(), {
				interactive: {
					dismiss: {
						finishThreshold: 0.5,
					},
				},
			}),
		});
	}
}
