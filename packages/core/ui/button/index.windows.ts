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
			try {
				if (typeof button._defaultOpacity === 'number' && button.nativeViewProtected) {
					(button.nativeViewProtected as any).Opacity = button._defaultOpacity;
				}
			} catch (_e) {}
			break;
		case TouchAction.down:
			button._addVisualState('highlighted');
			try {
				if (button.nativeViewProtected) {
					if (typeof button._defaultOpacity !== 'number') {
						button._defaultOpacity = (button.nativeViewProtected as any).Opacity || 1;
					}
					(button.nativeViewProtected as any).Opacity = Math.max(0, (button._defaultOpacity || 1) * 0.85);
				}
			} catch (_e) {}
			break;
	}
}


export class Button extends ButtonBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Button;
	private _delegate: any = null;
	private _delegateUsedAddListener: boolean = false;
	private _windows: Windows.UI.Xaml.Controls.Button;
	private _defaultOpacity?: number;
	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Button();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.Button {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		const that = new WeakRef(this);
		let usedAdd = false;
		try {
			this._delegate = new Windows.UI.Xaml.RoutedEventHandler((args) => {
				const owner = that.deref();
				if (!owner) {
					return;
				}
				owner.notify({ eventName: ButtonBase.tapEvent, object: owner });
			});
			nativeView.Click = this._delegate as never;
		} catch (_e) {
			this._delegate = (args: any) => {
				const owner = that.deref();
				if (!owner) return;
				owner.notify({ eventName: ButtonBase.tapEvent, object: owner });
			};
			try {
				nativeView.Click = this._delegate as never;
			} catch (_e2) {
				try {
					if (typeof (nativeView as any).addEventListener === 'function') {
						(nativeView as any).addEventListener('click', this._delegate);
						usedAdd = true;
					}
				} catch (_e3) {}
			}
		}
		this._delegateUsedAddListener = usedAdd;
		// remember default opacity for pressed-state visual
		try {
			this._defaultOpacity = (nativeView as any).Opacity || 1;
		} catch (_e) {}
	}

	public disposeNativeView(): void {
		if (this._delegate) {
			try { this.nativeViewProtected.Click = null as never; } catch (_e) {}
			if (this._delegateUsedAddListener) {
				try { (this.nativeViewProtected as any).removeEventListener('click', this._delegate); } catch (_e) {}
			}
			this._delegate = null;
			this._delegateUsedAddListener = false;
		}
		super.disposeNativeView();
	}

	@PseudoClassHandler('normal', 'highlighted', 'pressed', 'active')
	_updateButtonStateChangeHandler(subscribe: boolean) {
		console.log('Updating button state change handler for Windows is not implemented yet.'); // TODO: Implement updating button state change handler for Windows
		if (subscribe) {
			this.on(GestureTypes[GestureTypes.touch], onButtonStateChange);
		} else {
			this.off(GestureTypes[GestureTypes.touch], onButtonStateChange);
			this._removeVisualState('highlighted');
		}
	}
}
