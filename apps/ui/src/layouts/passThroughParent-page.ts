import { EventData, Page, Label } from '@nativescript/core';

const setLabelTextAndLog = (args, text: string) => {
	const page = <Page>args.object.page;
	const label = <Label>page.getViewById('resultLabel');
	label.set('text', text);
	console.log('on button tap');
};

export function onTap(args: EventData) {
	setLabelTextAndLog(args, 'onButtonTapResult');
}

export function clearResult(args: EventData) {
	setLabelTextAndLog(args, 'none');
}

export function onOuterWrapLayoutTap(args) {
	setLabelTextAndLog(args, 'onOuterWrapLayoutTapResult');
}

export function onStackLayoutThrowTap(args: EventData) {
	setLabelTextAndLog(args, 'Should not tap layout with IsPassThroughParentEnabled=true');
	// throw new Error("Should not tap layout with IsPassThroughParentEnabled=true");
}

export function onUserInteractionDisabledTap(args: EventData) {
	setLabelTextAndLog(args, 'Should not tap button with IsUserInteractionEnabled=false');
	// throw new Error("Should not tap button with IsUserInteractionEnabled=false");
}

export function onDisabledThrowTap(args: EventData) {
	setLabelTextAndLog(args, 'Should not tap button with IsEnabled=false');
	// throw new Error("Should not tap button with IsEnabled=false");
}
