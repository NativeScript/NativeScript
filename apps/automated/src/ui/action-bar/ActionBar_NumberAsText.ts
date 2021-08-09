import { Frame } from '@nativescript/core/ui/frame';

export function buttonTap(args) {
	Frame.topmost().goBack();
}
