import { View } from '@nativescript/core';

export function tapLabel(args) {
	const clicked: View = args.object;
	const graffiti = clicked as any;
	clicked.animate({
		height: graffiti.toggle ? 'auto' : 128,
		color: graffiti.toggle ? 'red': 'yellow',
		borderRadius: graffiti.toggle ? 0: 40,
		duration: 700,
		curve: 'ease',
	});
	graffiti.toggle = !graffiti.toggle;
}
