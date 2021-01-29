import { Observable, Frame, View, StackLayout, getRootLayout, EventData, RootLayout, RootLayoutOptions } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';

export class HelloWorldModel extends Observable {
	viewDemo(args) {
		Frame.topmost().navigate({
			moduleName: `${args.object.text}`,
		});
	}
}
