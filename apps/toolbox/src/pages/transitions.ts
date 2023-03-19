import { Observable, EventData, Page, ShowModalOptions, SharedTransition, ModalTransition, PageTransition } from '@nativescript/core';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel();
}

// class SampleCustomModalTransition extends ModalTransition implements TransitionType {

// }
// SharedTransition.DEBUG = true;
export class TransitionsModel extends Observable {
	open() {
		page.frame.navigate({
			moduleName: `pages/transitions/transitions-detail`,
			transition: SharedTransition.custom(new PageTransition(), {
				interactive: {
					dismiss: {
						finishThreshold: 0.5,
					},
				},
				// toPageStart: {
				// 	duration: 1000,
				// },
				// fromPageEnd: {
				// 	duration: 500,
				// },
			}),
		});
	}

	openModal() {
		page.showModal('pages/transitions/transitions-modal', {
			transition: SharedTransition.custom(new ModalTransition(), {
				interactive: {
					dismiss: {
						finishThreshold: 0.5,
					},
				},
				toPageStart: {
					y: 200,
					// duration: 400,
				},
				fromPageEnd: {
					y: 100,
					// duration: 500,
				},
			}),
			closeCallback(args) {
				// console.log('close modal callback', args);
			},
		} as ShowModalOptions);
	}
}
