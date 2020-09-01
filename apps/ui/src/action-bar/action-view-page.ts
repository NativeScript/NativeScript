import * as frame from '@nativescript/core/ui/frame';

export function navigate(args) {
	frame.topmost().navigate('action-bar/clean-page');
}
