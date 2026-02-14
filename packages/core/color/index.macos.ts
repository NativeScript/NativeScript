import { ColorBase } from './color-common';
import type { IColor } from './color-types';

export class Color extends ColorBase implements IColor {
	private _macos: NSColor;

	get ios(): any {
		if (!this._macos) {
			this._macos = NSColor.colorWithSRGBRedGreenBlueAlpha(this.r / 255, this.g / 255, this.b / 255, this.a / 255);
		}

		return this._macos;
	}

	public static fromIosColor(value: any): Color {
		if (!value) {
			return null;
		}

		const color = value as NSColor;
		const r = Math.round((color.redComponent ?? 0) * 255);
		const g = Math.round((color.greenComponent ?? 0) * 255);
		const b = Math.round((color.blueComponent ?? 0) * 255);
		const a = Math.round((color.alphaComponent ?? 1) * 255);
		return new Color(a, r, g, b);
	}
}
