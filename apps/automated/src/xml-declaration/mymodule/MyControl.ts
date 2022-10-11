import { StackLayout, Label, Button, EventData } from '@nativescript/core';
import { tapEvent } from '@nativescript/core/ui/button';

export class MyControl extends StackLayout {
	constructor() {
		super();

		var counter: number = 0;

		var lbl = new Label();
		var btn = new Button();
		btn.text = 'Tap me!';
		btn.on(tapEvent, (args: EventData) => {
			lbl.text = 'Tap ' + counter++;
		});

		this.addChild(lbl);
		this.addChild(btn);

		this.className = 'MyStackLayout';
	}
}
