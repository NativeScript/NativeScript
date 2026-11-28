import { EventData, Page, Button, Label, ShownModallyData } from '@nativescript/core';

let closeCallback: Function;

export function onShownModally(args: ShownModallyData) {
	closeCallback = args.closeCallback;
}

export function onTap() {
	closeCallback('sample text\n');
}

export function change(args) {
	const button: Button = <Button>args.object;

	const page: Page = <Page>button.parent;

	console.log('---------------------page-------------------------');
	console.log(page);
	const label: Label = <Label>page.getViewById('label1');
	label.text = 'fooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo';

	const label2: Label = <Label>page.getViewById('label2');
	label2.text = 'foooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo';
}
