import { CoreTypes } from '../../core-types';
import { LinearGradient } from './linear-gradient';
// Types.
import { Color } from '../../color';
import { BoxShadow } from './box-shadow';

/**
 * Flags used to hint the background handler if it has to clear a specific property
 *
 * Flags can be combined with the | operator
 * for example: BackgroundClearFlags.CLEAR_BACKGROUND_COLOR | BackgroundClearFlags.CLEAR_BOX_SHADOW
 *
 * Flags can be checked for using the & operator
 * for example: if(clearFlags & BackgroundClearFlags.CLEAR_BOX_SHADOW) { ...clear box shadow... }
 */
export const enum BackgroundClearFlags {
	NONE = 0,
	CLEAR_BACKGROUND_COLOR = 1 << 0,
	CLEAR_BOX_SHADOW = 2 << 0,
}

export class Background {
	public static default = new Background();

	public color: Color;
	public image: string | LinearGradient;
	public repeat: CoreTypes.BackgroundRepeatType;
	public position: string;
	public size: string;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderTopWidth = 0;
	public borderRightWidth = 0;
	public borderBottomWidth = 0;
	public borderLeftWidth = 0;
	public borderTopLeftRadius = 0;
	public borderTopRightRadius = 0;
	public borderBottomLeftRadius = 0;
	public borderBottomRightRadius = 0;
	public clipPath: string;
	public boxShadow: BoxShadow;
	public clearFlags: number = BackgroundClearFlags.NONE;

	// private clone(): Background {
	// 	const clone = new Background();

	// 	this.color = this.color;
	// 	this.image = this.image;
	// 	this.repeat = this.repeat;
	// 	this.position = this.position;
	// 	this.size = this.size;
	// 	this.borderTopColor = this.borderTopColor;
	// 	this.borderRightColor = this.borderRightColor;
	// 	this.borderBottomColor = this.borderBottomColor;
	// 	this.borderLeftColor = this.borderLeftColor;
	// 	this.borderTopWidth = this.borderTopWidth;
	// 	this.borderRightWidth = this.borderRightWidth;
	// 	this.borderBottomWidth = this.borderBottomWidth;
	// 	this.borderLeftWidth = this.borderLeftWidth;
	// 	this.borderTopLeftRadius = this.borderTopLeftRadius;
	// 	this.borderTopRightRadius = this.borderTopRightRadius;
	// 	this.borderBottomRightRadius = this.borderBottomRightRadius;
	// 	this.borderBottomLeftRadius = this.borderBottomLeftRadius;
	// 	this.clipPath = this.clipPath;
	// 	this.boxShadow = this.boxShadow;
	// 	this.clearFlags = this.clearFlags;

	// 	return this;
	// }

	public withColor(value: Color): Background {
		// const clone = this.clone();
		this.color = value;
		if (!value) {
			this.clearFlags |= BackgroundClearFlags.CLEAR_BACKGROUND_COLOR;
		}

		return this;
	}

	public withImage(value: string | LinearGradient): Background {
		// const clone = this.clone();
		this.image = value;

		return this;
	}

	public withRepeat(value: CoreTypes.BackgroundRepeatType): Background {
		// const clone = this.clone();
		this.repeat = value;

		return this;
	}

	public withPosition(value: string): Background {
		// const clone = this.clone();
		this.position = value;

		return this;
	}

	public withSize(value: string): Background {
		// const clone = this.clone();
		this.size = value;

		return this;
	}

	public withBorderTopColor(value: Color): Background {
		// const clone = this.clone();
		this.borderTopColor = value;

		return this;
	}

	public withBorderRightColor(value: Color): Background {
		// const clone = this.clone();
		this.borderRightColor = value;

		return this;
	}

	public withBorderBottomColor(value: Color): Background {
		// const clone = this.clone();
		this.borderBottomColor = value;

		return this;
	}

	public withBorderLeftColor(value: Color): Background {
		// const clone = this.clone();
		this.borderLeftColor = value;

		return this;
	}

	public withBorderTopWidth(value: number): Background {
		// const clone = this.clone();
		this.borderTopWidth = value;

		return this;
	}

	public withBorderRightWidth(value: number): Background {
		// const clone = this.clone();
		this.borderRightWidth = value;

		return this;
	}

	public withBorderBottomWidth(value: number): Background {
		// const clone = this.clone();
		this.borderBottomWidth = value;

		return this;
	}

	public withBorderLeftWidth(value: number): Background {
		// const clone = this.clone();
		this.borderLeftWidth = value;

		return this;
	}

	public withBorderTopLeftRadius(value: number): Background {
		// const clone = this.clone();
		this.borderTopLeftRadius = value;

		return this;
	}

	public withBorderTopRightRadius(value: number): Background {
		// // const clone = this.clone();
		this.borderTopRightRadius = value;

		return this;
	}

	public withBorderBottomRightRadius(value: number): Background {
		// const clone = this.clone();
		this.borderBottomRightRadius = value;

		return this;
	}

	public withBorderBottomLeftRadius(value: number): Background {
		// const clone = this.clone();
		this.borderBottomLeftRadius = value;

		return this;
	}

	public withClipPath(value: string): Background {
		// const clone = this.clone();
		this.clipPath = value;

		return this;
	}

	public withBoxShadow(value: BoxShadow): Background {
		// const clone = this.clone();
		this.boxShadow = value;
		if (!value) {
			this.clearFlags |= BackgroundClearFlags.CLEAR_BOX_SHADOW;
		}

		return this;
	}

	public isEmpty(): boolean {
		return !this.color && !this.image && !this.hasBorderWidth() && !this.hasBorderRadius() && !this.clipPath;
	}

	public static equals(value1: Background, value2: Background): boolean {
		// both values are falsy
		if (!value1 && !value2) {
			return true;
		}

		// only one is falsy
		if (!value1 || !value2) {
			return false;
		}

		let imagesEqual = false;
		if (value1 instanceof LinearGradient && value2 instanceof LinearGradient) {
			imagesEqual = LinearGradient.equals(value1, value2);
		} else {
			imagesEqual = value1.image === value2.image;
		}

		return (
			Color.equals(value1.color, value2.color) &&
			imagesEqual &&
			value1.position === value2.position &&
			value1.repeat === value2.repeat &&
			value1.size === value2.size &&
			Color.equals(value1.borderTopColor, value2.borderTopColor) &&
			Color.equals(value1.borderRightColor, value2.borderRightColor) &&
			Color.equals(value1.borderBottomColor, value2.borderBottomColor) &&
			Color.equals(value1.borderLeftColor, value2.borderLeftColor) &&
			value1.borderTopWidth === value2.borderTopWidth &&
			value1.borderRightWidth === value2.borderRightWidth &&
			value1.borderBottomWidth === value2.borderBottomWidth &&
			value1.borderLeftWidth === value2.borderLeftWidth &&
			value1.borderTopLeftRadius === value2.borderTopLeftRadius &&
			value1.borderTopRightRadius === value2.borderTopRightRadius &&
			value1.borderBottomRightRadius === value2.borderBottomRightRadius &&
			value1.borderBottomLeftRadius === value2.borderBottomLeftRadius &&
			value1.clipPath === value2.clipPath
			// && value1.clearFlags === value2.clearFlags
		);
	}

	public hasBorderColor(): boolean {
		return !!this.borderTopColor || !!this.borderRightColor || !!this.borderBottomColor || !!this.borderLeftColor;
	}

	public hasBorderWidth(): boolean {
		return this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
	}

	public hasBorderRadius(): boolean {
		return this.borderTopLeftRadius > 0 || this.borderTopRightRadius > 0 || this.borderBottomRightRadius > 0 || this.borderBottomLeftRadius > 0;
	}

	public hasBorder(): boolean {
		return (this.hasBorderColor() && this.hasBorderWidth()) || this.hasBorderRadius();
	}

	public hasUniformBorderColor(): boolean {
		return Color.equals(this.borderTopColor, this.borderRightColor) && Color.equals(this.borderTopColor, this.borderBottomColor) && Color.equals(this.borderTopColor, this.borderLeftColor);
	}

	public hasUniformBorderWidth(): boolean {
		return this.borderTopWidth === this.borderRightWidth && this.borderTopWidth === this.borderBottomWidth && this.borderTopWidth === this.borderLeftWidth;
	}

	public hasUniformBorderRadius(): boolean {
		return this.borderTopLeftRadius === this.borderTopRightRadius && this.borderTopLeftRadius === this.borderBottomRightRadius && this.borderTopLeftRadius === this.borderBottomLeftRadius;
	}

	public hasUniformBorder(): boolean {
		return this.hasUniformBorderColor() && this.hasUniformBorderWidth() && this.hasUniformBorderRadius();
	}

	public getUniformBorderColor(): Color {
		if (this.hasUniformBorderColor()) {
			return this.borderTopColor;
		}

		return undefined;
	}

	public getUniformBorderWidth(): number {
		if (this.hasUniformBorderWidth()) {
			return this.borderTopWidth;
		}

		return 0;
	}

	public getUniformBorderRadius(): number {
		if (this.hasUniformBorderRadius()) {
			return this.borderTopLeftRadius;
		}

		return 0;
	}

	public hasBoxShadow(): boolean {
		return !!this.boxShadow;
	}

	public getBoxShadow(): BoxShadow {
		return this.boxShadow;
	}

	public toString(): string {
		return `isEmpty: ${this.isEmpty()}; color: ${this.color}; image: ${this.image}; repeat: ${this.repeat}; position: ${this.position}; size: ${this.size}; borderTopColor: ${this.borderTopColor}; borderRightColor: ${this.borderRightColor}; borderBottomColor: ${this.borderBottomColor}; borderLeftColor: ${this.borderLeftColor}; borderTopWidth: ${this.borderTopWidth}; borderRightWidth: ${this.borderRightWidth}; borderBottomWidth: ${this.borderBottomWidth}; borderLeftWidth: ${this.borderLeftWidth}; borderTopLeftRadius: ${this.borderTopLeftRadius}; borderTopRightRadius: ${
			this.borderTopRightRadius
		}; borderBottomRightRadius: ${this.borderBottomRightRadius}; borderBottomLeftRadius: ${this.borderBottomLeftRadius}; clipPath: ${this.clipPath};`;
	}
}
