export * from './absolute-layout-common';

import { AbsoluteLayoutBase, leftProperty, topProperty } from './absolute-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

function setCanvasAttachedProperty(setterName: string, native: any, value: number) {
	try {
		const Canvas = Windows.UI.Xaml.Controls.Canvas as any;
		if (Canvas && typeof Canvas[setterName] === 'function') {
		//	Canvas[setterName](native, value);
		}
	} catch (_e) {}
}

// Attach native setters on View so Canvas attached properties apply to native elements
(View.prototype as any)[leftProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('SetLeft', native, value);
	}
};

(View.prototype as any)[topProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('SetTop', native, value);
	}
};

export class AbsoluteLayout extends AbsoluteLayoutBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Canvas;
	private _windows: Windows.UI.Xaml.Controls.Canvas;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Canvas();
	}

	public createNativeView() {
		return this._windows;
	}
	
}
