export * from './slider-common';

import { SliderBase } from './slider-common';

export class Slider extends SliderBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Slider;
	public createNativeView() {
		const slider = new Windows.UI.Xaml.Controls.Slider();
		return slider;
	}
}
