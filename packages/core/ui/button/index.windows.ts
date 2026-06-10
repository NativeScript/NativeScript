export * from './button-common';

import { ButtonBase } from './button-common';
import { PseudoClassHandler } from '../core/view';
import { TouchGestureEventData, TouchAction, GestureTypes } from '../gestures';

function onButtonStateChange(args: any) {
	const button = args.object as Button;

	switch (args.action) {
		case TouchAction.up:
		case TouchAction.cancel:
			button._removeVisualState('highlighted');
			if (typeof button._defaultOpacity === 'number' && button.nativeViewProtected) {
				button.nativeViewProtected.Opacity = button._defaultOpacity;
			}
			break;
		case TouchAction.down:
			button._addVisualState('highlighted');
			if (button.nativeViewProtected) {
				if (typeof button._defaultOpacity !== 'number') {
					button._defaultOpacity = button.nativeViewProtected.Opacity || 1;
				}
				button.nativeViewProtected.Opacity = Math.max(0, (button._defaultOpacity || 1) * 0.85);
			}
			break;
	}
}


export class Button extends ButtonBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Button;
	private _delegate: any = null;
	private _windows: Microsoft.UI.Xaml.Controls.Button;
	private _defaultOpacity?: number;

	public createNativeView() {
		this._windows = new Microsoft.UI.Xaml.Controls.Button();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.Button {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		const that = new WeakRef(this);
		this._delegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => {
			const owner = that.deref();
			if (owner) owner.notify({ eventName: ButtonBase.tapEvent, object: owner });
		});
		nativeView.Click = this._delegate as never;
		this._defaultOpacity = nativeView.Opacity || 1;
	}

	public disposeNativeView(): void {
		if (this._delegate) {
			this.nativeViewProtected.Click = null as never;
			this._delegate = null;
		}
		super.disposeNativeView();
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		if (subscribe) {
			this.on(GestureTypes[GestureTypes.touch], onButtonStateChange);
		} else {
			this.off(GestureTypes[GestureTypes.touch], onButtonStateChange);
			this._removeVisualState('highlighted');
		}
	}
}
