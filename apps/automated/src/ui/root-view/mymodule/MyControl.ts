import { EventData } from '@nativescript/core';
import * as stackLayoutModule from '@nativescript/core/ui/layouts/stack-layout';
import * as label from '@nativescript/core/ui/label';
import * as button from '@nativescript/core/ui/button';

export class MyControl extends stackLayoutModule.StackLayout {
	constructor() {
		super();

		let counter: number = 0;

		const lbl = new label.Label();
		lbl.id = 'my-test-label';
		const btn = new button.Button();
		btn.text = 'Tap me!';
		btn.on(button.Button.tapEvent, (args: EventData) => {
			lbl.text = 'Tap ' + counter++;
		});

		this.addChild(lbl);
		this.addChild(btn);

		this.className = 'MyStackLayout';
	}
}
