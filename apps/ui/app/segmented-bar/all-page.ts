import * as frame from '@nativescript/core/ui/frame';

export function navigate() {
	frame.topmost().navigate('segmented-bar/clean-page');
}
