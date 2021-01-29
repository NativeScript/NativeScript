import { Observable, Frame, StackLayout } from '@nativescript/core';

export class HelloWorldModel extends Observable {
	private _counter: number;
	private _message: string;

	constructor() {
		super();

		// Initialize default values.
		this._counter = 42;
		this.updateMessage();
	}

	get message(): string {
		return this._message;
	}

	set message(value: string) {
		if (this._message !== value) {
			this._message = value;
			this.notifyPropertyChange('message', value);
		}
	}

	toggleAnimation(args) {
		const layout = args.object as StackLayout;
		if (!layout.className) {
			layout.className = 'sample-animation';
		} else {
			layout.className = undefined;
		}
	}

	onTap() {
		this._counter--;
		this.updateMessage();
	}

	viewList() {
		Frame.topmost().navigate({
			moduleName: 'list-page',
		});
	}

	private updateMessage() {
		if (this._counter <= 0) {
			this.message = 'Hoorraaay! You unlocked the NativeScript clicker achievement!';
		} else {
			this.message = `${this._counter} taps left`;
		}
	}
}
