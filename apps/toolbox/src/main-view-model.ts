import { Observable, Frame, View, StackLayout, getRootLayout, EventData } from '@nativescript/core';

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

	onTap() {
		this._counter--;
		this.updateMessage();
	}

	view1 = this.getPopup('#EA5936', 110, 0);
	view2 = this.getPopup('#232652', 110, 20);
	view3 = this.getPopup('#E1E4E8', 110, 40);
	popupViews = [this.view1, this.view2, this.view3];

	open(args: EventData): void {
		getRootLayout()
			.open(this.popupViews[(<any>args.object).popupIndex], {
				shade: {
					color: '#FFFFFF',
					opacity: 0.5,
					tapToClose: true,
				},
			})
			.then(() => console.log('opened'))
			.catch((ex) => console.error(ex));
	}

	bringToFront(args: EventData): void {
		getRootLayout()
			.bringToFront(this.popupViews[(<any>args.object).popupIndex])
			.then(() => console.log('brought to front'))
			.catch((ex) => console.error(ex));
	}

	close(args: EventData): void {
		getRootLayout()
			.close(this.popupViews[(<any>args.object).popupIndex])
			.then(() => console.log('closed'))
			.catch((ex) => console.error(ex));
	}

	getPopup(color: string, size: number, offset: number): View {
		const layout = new StackLayout();
		layout.height = size;
		layout.width = size;
		layout.translateY = offset;
		layout.translateX = offset;
		layout.backgroundColor = color;
		layout.borderRadius = 10;
		return layout;
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
