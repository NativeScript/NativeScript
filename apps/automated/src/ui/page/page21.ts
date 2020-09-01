import { ShownModallyData } from '@nativescript/core';

export function onShownModally(args: ShownModallyData) {
	args.context.childPage = args.object;
	args.context.close = args.closeCallback;

	setTimeout(() => {
		(<any>args.object).bindingContext = [0, 1];
	}, 200);
}
