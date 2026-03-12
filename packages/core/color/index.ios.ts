import { ColorBase } from './color-common';
import type { IColor } from './color-types';

export class Color extends ColorBase implements IColor {
	private _ios: UIColor;

	get ios(): UIColor {
		if (!this._ios) {
			// iOS Color is using floating-point values in the [0, 1] range, so divide the components by 255
			this._ios = UIColor.alloc().initWithRedGreenBlueAlpha(this.r / 255, this.g / 255, this.b / 255, this.a / 255);
		}

		return this._ios;
	}

	public static fromIosColor(value: UIColor): Color {
		const r = new interop.Reference<number>();
		const g = new interop.Reference<number>();
		const b = new interop.Reference<number>();
		const a = new interop.Reference<number>();
		value.getRedGreenBlueAlpha(r, g, b, a);
		return new Color(Math.round(a.value * 255), Math.round(r.value * 255), Math.round(g.value * 255), Math.round(b.value * 255));
	}
}
