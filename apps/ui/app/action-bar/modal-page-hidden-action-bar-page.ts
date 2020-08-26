import { ShownModallyData } from '@nativescript/core';

let closeCallback: Function;

export function onShownModally(args: ShownModallyData) {
	closeCallback = args.closeCallback;
}

export function onTap() {
	closeCallback('sample text\n');
}
