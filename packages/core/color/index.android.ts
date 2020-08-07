import * as common from './color-common';

export class Color extends common.Color {
	get android(): number {
		return this.argb >> 0;
	}
}
