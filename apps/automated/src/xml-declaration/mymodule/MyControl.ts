import { StackLayout, Label, Button, EventData } from '@nativescript/core';

export class MyControl extends StackLayout {
	constructor() {
		super();

		let counter: number = 0;

		const lbl = new Label();
		const btn = new Button();
		btn.text = 'Tap me!';
		btn.on(Button.tapEvent, (args: EventData) => {
			lbl.text = 'Tap ' + counter++;
		});

		this.addChild(lbl);
		this.addChild(btn);

		this.className = 'MyStackLayout';
	}
}
