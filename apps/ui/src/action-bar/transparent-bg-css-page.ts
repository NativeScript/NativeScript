import { Frame } from '@nativescript/core';

export function navigate() {
	Frame.topmost().navigate('action-bar/clean-page');
}
