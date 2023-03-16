import { Color as ColorBase } from './color-common';

export class Color extends ColorBase {
	get android(): number {
		return this.argb >> 0;
	}
}
