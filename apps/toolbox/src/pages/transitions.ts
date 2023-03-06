import { Observable, EventData, Page, ShowModalOptions, SharedTransition, ModalTransition, TransitionType, Screen } from '@nativescript/core';
// import { DetailTransition } from './transitions/detail';
let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel();
}

// class SampleCustomModalTransition extends ModalTransition implements TransitionType {

// }
export class TransitionsModel extends Observable {
	open() {
		// const detailTransition = new DetailTransition(400, global.isIOS ? UIViewAnimationCurve.EaseInOut : null);
		// detailTransition.page = page;
		page.frame.navigate({
			moduleName: `pages/transitions/transitions-detail`,
			// transition: {
			// 	instance: detailTransition,
			// },
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
