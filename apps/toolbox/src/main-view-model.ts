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
			view: this.getPopup('#EA5936', 110, -30, 500),
			options: {
				shadeCover: {
					color: '#FFF',
					opacity: 0.7,
					tapToClose: true,
				},
				enterAnimation: {
					opacity: 1,
					scale: { x: 1, y: 1 },
					translate: { x: 0, y: 0 },
					duration: 500,
					curve: AnimationCurve.easeIn,
				},
				exitAnimation: {
					opacity: 0,
					translate: { x: 500, y: 0 },
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
			view: this.getPopup('#232652', 110, 0, 0, 500),
			options: {
				shadeCover: {
					color: 'pink',
					opacity: 0.7,
					tapToClose: false,
					height: 350,
					animation: {
						exitTo: {
							scaleX: 0,
						},
					},
				},
				enterAnimation: {
					opacity: 1,
					scale: { x: 1, y: 1 },
					translate: { x: 0, y: 0 },
					curve: AnimationCurve.easeOut,
				},
				exitAnimation: {
					opacity: 0,
					translate: { x: 0, y: 500 },
				},
			},
		},
		{
			view: this.getPopup('#E1E4E8', 110, 30, -300, -300),
			options: {
				shadeCover: {
					color: '#ffffdd',
					opacity: 0.5,
					tapToClose: true,
					height: 400,
					ignoreShadeRestore: true,
					animation: {
						enterFrom: {
							translateX: -1000,
							rotate: 360,
							duration: 0.5,
						},
						exitTo: {
							rotate: -180,
							duration: 0.5,
						},
					},
				},
				enterAnimation: {
					opacity: 1,
					scale: { x: 1, y: 1 },
					translate: { x: 0, y: 0 },
					curve: AnimationCurve.easeInOut,
				},
				exitAnimation: {
					opacity: 0,
					translate: { x: 300, y: 300 },
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

	getPopup(color: string, size: number, offset: number, translateX: number = 0, translateY: number = 0): View {
		const layout = new StackLayout();
		layout.height = size;
		layout.width = size;
		layout.marginTop = offset;
		layout.marginLeft = offset;
		layout.translateY = translateY;
		layout.translateX = translateX;
		layout.backgroundColor = color;
		layout.borderRadius = 10;
		layout.opacity = 0;
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
