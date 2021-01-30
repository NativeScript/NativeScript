import { Observable, Frame } from '@nativescript/core';

export class HelloWorldModel extends Observable {
	viewDemo(args) {
		Frame.topmost().navigate({
			moduleName: `${args.object.text}`,
		});
	}
}
