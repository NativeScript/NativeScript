import { EventData, Button } from '@nativescript/core';

export function goToSecond(args: EventData) {
	console.log('---> goToSecond Page');
	const button = <Button>args.object;
	button.page.frame.navigate('tabs/second-page');
}

export function goBack(args: EventData) {
	console.log('---> goBack');
	const button = <Button>args.object;
	button.page.frame.goBack();
}
