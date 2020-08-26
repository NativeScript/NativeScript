import { Label } from '@nativescript/core/ui/label';
import { Page } from '@nativescript/core/ui/page';

export function onNavigateTo(args) {
	updateText(args.object);
}

export function changeFlatPropertyValue(args) {
	const page = <Page>args.object.page;
	page.actionBar.flat = !page.actionBar.flat;
	updateText(page);
}

function updateText(page: Page) {
	const label = <Label>page.getViewById('flatPropertyValue');
	label.text = 'Action bar flat property is set to: ' + page.actionBar.flat;
}
