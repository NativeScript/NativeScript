import { View } from '@nativescript/core';

export function tapLabel(args) {
	const clicked: View = args.object;
	const graffiti = clicked as any;
	clicked.animate({
		height: graffiti.toggle ? 64 : 128,
		duration: 200,
		curve: 'easeOut',
	});
	graffiti.toggle = !graffiti.toggle;
}
