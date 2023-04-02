import { Observable, EventData, Page, ShowModalOptions, SharedTransition, ModalTransition, PageTransition, FadeTransition, SlideTransition, PropertyChangeData } from '@nativescript/core';
let page: Page;
// SharedTransition.DEBUG = true;
export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new TransitionsModel();
}

let updatedSegmentValue: number;
if (typeof updatedSegmentValue === 'undefined') {
	updatedSegmentValue = 0;
}
export class TransitionsModel extends Observable {
	segmentSelectedIndex = updatedSegmentValue;

	items = [
		{
			title: 'Homer',
			dynamicTag: 'dynamic1',
		},
		{
			title: 'Marge',
			dynamicTag: 'dynamic2',
		},
		{
			title: 'Bart',
			dynamicTag: 'dynamic3',
		},
		{
			title: 'Lisa',
			dynamicTag: 'dynamic4',
		},
		{
			title: 'Maggie',
			dynamicTag: 'dynamic5',
		},
	];

	constructor() {
		super();
		this.on(Observable.propertyChangeEvent, (data: PropertyChangeData) => {
			if (data.propertyName === 'segmentSelectedIndex') {
				console.log('change segmentSelectedIndex--');
				console.log(data.value);
				updatedSegmentValue = data.value;
				this.segmentSelectedIndex = data.value;
			}
		});
	}

	open(args) {
		const moduleName = `pages/transitions/transition-example-detail`;
		const context: any = {
			example2: !!args.object.example2,
			example3: !!args.object.example3,
			dynamicTag: args.object.dynamicTag,
		};
		page.frame.navigate({
			moduleName,
			context,
			transition: SharedTransition.custom(new PageTransition(), {
				interactive: {
					dismiss: {
						finishThreshold: 0.5,
					},
				},
				pageEnd: {
					sharedTransitionTags: {
						shape1: {
							// purple should appear "below" other shapes during transition
							zIndex: 0,
						},
						shape2: {
							zIndex: 1,
						},
						shape3: {
							zIndex: 3,
						},
						shape4: {
							// should appear "below" shape3
							zIndex: 2,
						},
					},
				},
				// pageEnd: {
				// 	duration: 3000
				// },
				// pageReturn: {
				// 	duration: 1000
				// }
			}),
		});

		// Try modals as well:
		// context.isModal = true;
		// page.showModal(moduleName, {
		//	context,
		// 	transition: SharedTransition.custom(new ModalTransition(), {
		// 		interactive: {
		// 			dismiss: {
		// 				finishThreshold: 0.5,
		// 			},
		// 		},
		// 		pageStart: {
		// 			y: 200,
		// 			// duration: 400,
		// 		},
		// 		pageReturn: {
		// 			y: 100,
		// 			// duration: 500,
		// 		},
		// 	}),
		// 	closeCallback(args) {
		// 		// console.log('close modal callback', args);
		// 	},
		// } as ShowModalOptions);
	}

	onItemTap(args) {
		const item = this.items[args.index];
		console.log(item);
		this.open({
			object: {
				example3: true,
				dynamicTag: item.dynamicTag,
			},
		});
	}
}
