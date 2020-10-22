import { Observable, Frame, View, StackLayout, getRootLayout, EventData, RootLayout, RootLayoutOptions } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';

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

	popupViews: { view: View; options: RootLayoutOptions; extra?: any }[] = [
		{
			view: this.getPopup('#EA5936', 110, -30),
			options: {
				shadeCover: {
					color: '#FFF',
					opacity: 0.7,
					tapToClose: true,
				},
				animation: {
					enterFrom: {
						opacity: 0,
						translateY: 500,
						duration: 500,
					},
					exitTo: {
						opacity: 0,
						duration: 300,
					},
				},
			},
			extra: {
				customExitAnimation: {
					opacity: 0,
					translate: { x: 0, y: -500 },
				},
			},
		},
		{
			view: this.getPopup('#232652', 110, 0),
			options: {
				shadeCover: {
					color: 'pink',
					opacity: 0.7,
					tapToClose: false,
					animation: {
						exitTo: {
							scaleX: 0,
						},
					},
				},
			},
		},
		{
			view: this.getPopup('#E1E4E8', 110, 30),
			options: {
				shadeCover: {
					color: '#ffffdd',
					opacity: 0.5,
					tapToClose: true,
					ignoreShadeRestore: true,
					animation: {
						enterFrom: {
							translateX: -1000,
							duration: 500,
						},
						exitTo: {
							rotate: -180,
							duration: 500,
						},
					},
				},
				animation: {
					enterFrom: {
						rotate: 180,
						duration: 300,
					},
					exitTo: {
						rotate: 180,
						opacity: 0,
						duration: 300,
						curve: AnimationCurve.spring,
					},
				},
			},
		},
	];

	open(args: EventData): void {
		getRootLayout()
			.open(this.popupViews[(<any>args.object).popupIndex].view, this.popupViews[(<any>args.object).popupIndex].options)
			.then(() => console.log('opened'))
			.catch((ex) => console.error(ex));
	}

	bringToFront(args: EventData): void {
		getRootLayout()
			.bringToFront(this.popupViews[(<any>args.object).popupIndex].view, true)
			.then(() => console.log('brought to front'))
			.catch((ex) => console.error(ex));
	}

	close(args: EventData): void {
		if (this.popupViews[(<any>args.object).popupIndex]?.extra?.customExitAnimation) {
			getRootLayout()
				.close(this.popupViews[(<any>args.object).popupIndex].view, this.popupViews[(<any>args.object).popupIndex].extra.customExitAnimation)
				.then(() => console.log('closed with custom exit animation'))
				.catch((ex) => console.error(ex));
		} else {
			getRootLayout()
				.close(this.popupViews[(<any>args.object).popupIndex].view)
				.then(() => console.log('closed'))
				.catch((ex) => console.error(ex));
		}
	}

	getPopup(color: string, size: number, offset: number): View {
		const layout = new StackLayout();
		layout.height = size;
		layout.width = size;
		layout.marginTop = offset;
		layout.marginLeft = offset;
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
