import { Observable, EventData, Page, ShowModalOptions, SharedTransition, ModalTransition, PageTransition, Screen } from '@nativescript/core';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel();
}

// class SampleCustomModalTransition extends ModalTransition implements TransitionType {

// }
export class TransitionsModel extends Observable {
	open() {
		page.frame.navigate({
			moduleName: `pages/transitions/transitions-detail`,
			transition: {
				instance: SharedTransition.configure({
					page,
					instance: new PageTransition(),
					incomingViewStart: {
						duration: 5000,
					},
					dismissViewEnd: {
						duration: 5000,
					},
				}),
			},
		});
	}

	openModal() {
		page.showModal('pages/transitions/transitions-modal', {
			context: {},
			transition: {
				instance: SharedTransition.configure({
					page,
					instance: new ModalTransition(),
					incomingViewStart: {
						y: 200,
						duration: 1000,
					},
					dismissViewEnd: {
						y: 100,
						duration: 500,
					},
				}),
			},
			closeCallback(args) {
				console.log('close modal callback', args);
			},
		} as ShowModalOptions);
	}
}
