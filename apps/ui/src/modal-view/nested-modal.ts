import { Page, ShownModallyData, EventData, fromObject, Dialogs } from '@nativescript/core';

export function onShowingModally(args: ShownModallyData) {
	console.log('nested-modal.onShowingModally, context: ' + args.context);
	const page = <Page>args.object;

	page.bindingContext = fromObject({
		context: args.context,
		onTap: function () {
			Dialogs.alert('it works!');
		},
	});
}

export function onShownModally(args: ShownModallyData) {
	console.log('nested-modal.onShownModally, context: ' + args.context);
}

export function onLoaded(args: EventData) {
	console.log('nested-modal.onLoaded');
}

export function onUnloaded() {
	console.log('nested-modal.onUnloaded');
}
