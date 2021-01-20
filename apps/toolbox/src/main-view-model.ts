import { Observable, Frame, StackLayout } from '@nativescript/core';

export class HelloWorldModel extends Observable {
	private _selectedComponentType: string;
	private _selectedBackgroundType: string;
	private _selectedBorderType: string;
	private _boxShadow: string;

	background: string;
	borderWidth: number;
	borderRadius: number;
	appliedBoxShadow: string;

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
		this.notifyPropertyChange('animationType', args.object.animationType);
	}

	applyBoxShadow(): void {
		this.appliedBoxShadow = this._boxShadow;
		this.notifyPropertyChange('appliedBoxShadow', this.appliedBoxShadow);

		// TODO: this is a workaround to apply shadow immediately,
		// since the box-shadow logic is currently inside background.ts
		this.notifyPropertyChange('background', '');
		this.notifyPropertyChange('background', this.background);
	}

	textChange(args): void {
		this._boxShadow = args.object.text;
	}

	toggleAnimation(args) {
		console.log('toggling animation');
		const layout = args.object as StackLayout;
		if (!layout.className) {
			layout.className = 'sample-animation';
		} else {
			layout.className = undefined;
		}
	}
}
