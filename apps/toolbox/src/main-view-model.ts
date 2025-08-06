import { Observable, Frame, StackLayout, AndroidOverflowInsetData } from '@nativescript/core';

export class HelloWorldModel extends Observable {
	viewDemo(args) {
		Frame.topmost().navigate({
			moduleName: `pages/${args.object.text}`,
		});
	}

	onInset(args: AndroidOverflowInsetData) {
		args.inset.top += 10; // add 10px to the top inset
		args.inset.bottom += 10; // add 10px to the bottom inset
		args.inset.left += 10; // add 10px to the left inset
		args.inset.right += 10; // add 10px to the right inset

		args.inset.topConsumed = true; // consume the top inset
		args.inset.bottomConsumed = true; // consume the bottom inset
		args.inset.leftConsumed = true; // consume the left inset
		args.inset.rightConsumed = true; // consume the right inset
	}
}
