import { Button, EventData } from '@nativescript/core';

const states = [
	{ class: '', text: 'default elevation' },
	{ class: 'elevation-10', text: 'elevetion 10' },
	{ class: 'elevation-10 pressed-z-10', text: 'elevetion 10 pressed-z 10' },
	{ class: 'elevation-0', text: 'elevetion 0' },
];
let currentState = 0;

export function buttonTap(args: EventData) {
	let btn: Button = args.object as Button;
	currentState++;
	if (currentState >= states.length) {
		currentState = 0;
	}
	btn.className = states[currentState].class;
	btn.text = states[currentState].text;
}
