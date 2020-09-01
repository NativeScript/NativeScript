import { topmost } from '@nativescript/core/ui/frame';

export function onTap(args) {
	topmost().goBack();
}
