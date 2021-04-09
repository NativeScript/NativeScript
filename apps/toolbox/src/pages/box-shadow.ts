import { Observable, EventData, Page } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new BoxShadowModel();
}

export class BoxShadowModel extends Observable {
	private _selectedComponentType: string = 'buttons';
	private _selectedBackgroundType: string;
	private _selectedBorderType: string;
	private _selectedAnimation: string;
	private _boxShadow: string = '0 10 15 -3 rgba(200, 0, 0, 0.4)';
	// private _boxShadow: string = '5 5 1 1 rgba(255, 0, 0, .9)';
	// private _boxShadow: string = '5 5 5 10 rgba(255, 0, 0, .9)';

	background: string;
	borderWidth: number;
	borderRadius: number;
	appliedBoxShadow: string;

	get boxShadow(): string {
		return this._boxShadow;
	}

	constructor() {
		super();
	}

	get selectedComponentType(): string {
		return this._selectedComponentType;
	}

	set selectedComponentType(value: string) {
		if (this._selectedComponentType !== value) {
			this._selectedComponentType = value;
			this.notifyPropertyChange('selectedComponentType', value);
		}
	}

	get selectedBackgroundType(): string {
		return this._selectedBackgroundType;
	}

	set selectedBackgroundType(value: string) {
		if (this._selectedBackgroundType !== value) {
			this._selectedBackgroundType = value;
			this.notifyPropertyChange('selectedBackgroundType', value);
			switch (value) {
				case 'solid':
					this.background = '#65ADF1';
					break;
				case 'gradient':
					this.background = 'linear-gradient(to top, #65ADF1, white)';
					break;
				case 'transparent':
					this.background = 'transparent';
					break;
				default:
					break;
			}
			this.notifyPropertyChange('background', this.background);
		}
	}

	get selectedBorderType(): string {
		return this._selectedBorderType;
	}

	set selectedBorderType(value: string) {
		this._selectedBorderType = value;
		this.notifyPropertyChange('selectedBorderType', value);
		switch (value) {
			case 'solid':
				this.borderWidth = this.borderWidth ? 0 : 2;
				break;
			case 'rounded':
				this.borderRadius = this.borderRadius ? 0 : 10;
				break;
			case 'none':
				this.borderRadius = 0;
				this.borderWidth = 0;
				break;
			default:
				break;
		}
		this.notifyPropertyChange('borderRadius', this.borderRadius);
		this.notifyPropertyChange('borderWidth', this.borderWidth);
	}

	selectComponentType(args): void {
		this.selectedComponentType = args.object.componentType;
	}

	selectBackgroundType(args): void {
		this.selectedBackgroundType = args.object.backgroundType;
	}

	selectBorderType(args): void {
		this.selectedBorderType = args.object.borderType;
	}

	selectAnimationType(args): void {
		this._selectedAnimation = args.object.animationType;
	}

	applyBoxShadow(): void {
		if (!this._boxShadow) {
			this._boxShadow = '';
		}
		this.appliedBoxShadow = this._boxShadow;
		this.notifyPropertyChange('appliedBoxShadow', this.appliedBoxShadow);
	}

	textChange(args): void {
		this._boxShadow = args.object.text;
	}

	toggleAnimation(args) {
		const view = args.object;
		const animationDuration = 500;
		if (this._selectedAnimation === 'width') {
			const originalWidth = args.object.getActualSize().width;
			view
				.animate({
					width: originalWidth / 2,
					duration: animationDuration,
				})
				.then(() =>
					view.animate({
						width: originalWidth,
						duration: animationDuration,
					})
				)
				.catch((err) => {
					console.error('animation error', err);
				});
		} else if (this._selectedAnimation === 'height') {
			const originalHeight = args.object.getActualSize().height;
			view
				.animate({
					height: originalHeight / 2,
					duration: animationDuration,
				})
				.then(() =>
					view.animate({
						height: originalHeight,
						duration: animationDuration,
					})
				)
				.catch((err) => {
					console.error('animation error', err);
				});
		} else {
			view
				.animate({
					opacity: this._selectedAnimation === 'opacity' ? 0 : 1,
					scale: this._selectedAnimation === 'scale' ? { x: 0.5, y: 0.6 } : { x: 1, y: 1 },
					rotate: this._selectedAnimation === 'rotate' ? 180 : 0,
					translate: this._selectedAnimation === 'translate' ? { x: 100, y: 100 } : { x: 0, y: 0 },
					duration: 500,
				})
				.then(() =>
					view.animate({
						opacity: 1,
						scale: { x: 1, y: 1 },
						rotate: 0,
						translate: { x: 0, y: 0 },
						duration: 500,
					})
				)
				.catch((err) => {
					console.error('animation error', err);
				});
		}
	}
}
