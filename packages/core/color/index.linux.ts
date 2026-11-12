import { ColorBase } from './color-common';
import type { IColor } from './color-types';

export class Color extends ColorBase implements IColor {
	/** CSS color for GTK style sheets. */
	get linux(): string {
		return `rgba(${this.r},${this.g},${this.b},${(this.a / 255).toFixed(3)})`;
	}
}
