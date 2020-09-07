import { EventData, Frame, Button, ScrollView, TextView, Color, View } from '@nativescript/core';

let red = new Color('red');
let green = new Color('green');

export function onToggle(args: EventData) {
	let button = <Button>args.object;
	let target = button.page.getViewById<View>('target');
	let debugConsole = button.page.getViewById<TextView>('debugConsole');
	let scrollView = button.page.getViewById<ScrollView>('scrollView');

	if (button.text === 'Color') {
		target[button.id] = target[button.id] ? undefined : red;
		debugConsole.text += `> border-color: ${target.borderColor}\n`;
	} else if (button.text === 'Width') {
		target[button.id] = target[button.id] ? 0 : 10;
		debugConsole.text += `> border-width: ${target.borderWidth}\n`;
	} else if (button.text === 'Radius') {
		target[button.id] = target[button.id] ? 0 : 10;
		debugConsole.text += `> border-radius: ${target.borderRadius}\n`;
	} else if (button.text === 'BGColor') {
		target.backgroundColor = target.backgroundColor ? undefined : green;
		debugConsole.text += `> background-color: ${target.backgroundColor}\n`;
	} else if (button.text === 'BGImage') {
		target.backgroundImage = target.backgroundImage ? undefined : `~/resources/images/test2.png`;
		debugConsole.text += `> background-image: ${target.backgroundImage}\n`;
	} else if (button.text === 'BGGradient') {
		const gradient = 'linear-gradient(to right, purple, red)';
		target.backgroundImage = typeof target.backgroundImage === 'object' ? undefined : gradient;
		debugConsole.text += `> background-image: ${gradient} \n`;
	}

	scrollView.scrollToVerticalOffset(scrollView.scrollableHeight, true);
}
