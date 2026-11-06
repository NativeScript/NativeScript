export * from './slider-common';

import { SliderBase } from './slider-common';

// TODO(linux): placeholder until the GTK implementation lands
export class Slider extends SliderBase {
	createNativeView() {
		return gtk_label_new('Slider');
	}
}
