import { Page, EventData, fromObject, Dialogs } from '@nativescript/core';

export function navigatingTo(args) {
	const page = <Page>args.object;

	page.bindingContext = fromObject({
		context: args.context,
		onTap: function () {
			Dialogs.alert('it works!');
		},
		openNestedFrames: function () {
			page.showModal('modal-view/nested-modal-tab', {
				context: 'Nested Modal Tab',
				fullscreen: true,
				closeCallback: () => {
					console.log('nested-modal.openNestedModal');
				},
			});
		},
	});
}

export function onLoaded(args: EventData) {
	console.log('nested-nested-modal.onLoaded');
}

export function onUnloaded() {
	console.log('nested-nested-modal.onUnloaded');
}
