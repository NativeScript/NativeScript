import * as frame from '@nativescript/core/ui/frame';

export function onNavBtnTap(args) {
	frame.topmost().goBack();
}
