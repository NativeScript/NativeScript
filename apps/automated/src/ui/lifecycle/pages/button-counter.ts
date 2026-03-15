import * as button from '@nativescript/core/ui/button';
import { colorProperty, backgroundInternalProperty, fontInternalProperty } from '@nativescript/core';

export class Button extends button.Button {
	nativeBackgroundRedraws = 0;
	backgroundInternalSetNativeCount = 0;
	fontInternalSetNativeCount = 0;
	colorSetNativeCount = 0;
	colorPropertyChangeCount = 0;

	constructor() {
		super();
		this.style.on('colorChange', () => this.colorPropertyChangeCount++);
	}

	[backgroundInternalProperty.setNative](value) {
		this.backgroundInternalSetNativeCount++;

		return (super[backgroundInternalProperty.setNative] as any).call(this, value);
	}
	[fontInternalProperty.setNative](value) {
		this.fontInternalSetNativeCount++;

		return (super[fontInternalProperty.setNative] as any).call(this, value);
	}
	_redrawNativeBackground(value: any): void {
		this.nativeBackgroundRedraws++;
		super._redrawNativeBackground(value);
	}
	[colorProperty.setNative](value) {
		this.colorSetNativeCount++;

		return (super[colorProperty.setNative] as any).call(this, value);
	}
}
Button.prototype.recycleNativeView = 'never';
