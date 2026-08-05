export * from './absolute-layout-common';

import { AbsoluteLayoutBase, leftProperty, topProperty } from './absolute-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

// Canvas does NOT lay out its children — position comes entirely from Canvas.Left/Top attached properties.
// (Previously this call was missing, causing all children to pile up at 0,0 and breaking the animation-curves demo.)
// Prefer the static setter; fall back to SetValue(Canvas.*Property) if the runtime doesn't project it.
function setCanvasAttachedProperty(prop: 'Left' | 'Top', native: any, value: number) {
	try {
		const Canvas = Microsoft.UI.Xaml.Controls.Canvas as any;
		if (!Canvas || !native) {
			return;
		}
		const setter = 'Set' + prop; // SetLeft / SetTop
		if (typeof Canvas[setter] === 'function') {
			Canvas[setter](native, value);
			return;
		}
		const dp = Canvas[prop + 'Property']; // LeftProperty / TopProperty
		if (dp && typeof native.SetValue === 'function') {
			native.SetValue(dp, value);
		}
	} catch (_e) {}
}

(View.prototype as any)[leftProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('Left', native, value);
	}
};

(View.prototype as any)[topProperty.setNative] = function (value: number) {
	const native = (this as any).nativeViewProtected as any;
	if (native) {
		setCanvasAttachedProperty('Top', native, value);
	}
};

export class AbsoluteLayout extends AbsoluteLayoutBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Canvas;
	private _windows: Microsoft.UI.Xaml.Controls.Canvas;

	constructor() {
		super();
		// WinRT deferred to createNativeView() — keeps constructor pure-JS.
	}

	public createNativeView() {
		this._windows = new Microsoft.UI.Xaml.Controls.Canvas();
		return this._windows;
	}
	
}
