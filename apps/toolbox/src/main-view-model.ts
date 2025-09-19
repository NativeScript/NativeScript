import { Observable, Frame, StackLayout } from '@nativescript/core';

export class HelloWorldModel extends Observable {
	viewDemo(args) {
		console.log('Navigating to view demo:', args.object.text);
		Frame.topmost().navigate({
			moduleName: `pages/${args.object.text}`,
		});
	}
}
