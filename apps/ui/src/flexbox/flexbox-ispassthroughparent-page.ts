export function onStackLayoutTapped(args) {
	console.log('The StackLayout is tapped (called method: onStackLayoutTapped)');
	// Some visual action to execute when the tap is triggered
	args.object.backgroundColor = !args.object.backgroundColor || args.object.backgroundColor.toString() !== '#FFFF00' ? '#FFFF00' : '#FFFFFF';
}

export function onFlexLayoutTap(args) {
	console.log('The FlexboxLayout is tapped (called method: onFlexLayoutTap)');
	// Some visual action to execute when the tap is triggered
	args.object.backgroundColor = !args.object.backgroundColor || args.object.backgroundColor.toString() !== '#FFFF00' ? '#FFFF00' : '#FFFFFF';
}
