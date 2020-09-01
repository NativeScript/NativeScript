import { Frame } from '@nativescript/core';

export function navigate() {
	Frame.topmost().goBack();
}
