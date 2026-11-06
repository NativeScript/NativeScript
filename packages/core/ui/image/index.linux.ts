export * from './image-common';

import { ImageBase } from './image-common';

// TODO(linux): placeholder until the GTK implementation lands
export class Image extends ImageBase {
	createNativeView() {
		return gtk_label_new('Image');
	}
}
