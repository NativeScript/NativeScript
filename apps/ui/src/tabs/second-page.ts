import { EventData, Button } from '@nativescript/core';

export function goToFirst(args: EventData) {
	console.log('---> goToFirst Page');
	const button = <Button>args.object;
	button.page.frame.navigate('tabs/first-page');
}

export function goBack(args: EventData) {
	console.log('---> goBack');
	const button = <Button>args.object;
	button.page.frame.goBack();
}
