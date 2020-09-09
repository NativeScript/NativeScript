// Deifinitions.
import { Background as BackgroundDefinition } from './background';
import { BackgroundRepeat } from '../styling/style-properties';
import { LinearGradient } from './linear-gradient';
// Types.
import { Color } from '../../color';

export class Background implements BackgroundDefinition {
	public static default = new Background();

	public color: Color;
	public image: string | LinearGradient;
	public repeat: BackgroundRepeat;
	public position: string;
	public size: string;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderTopWidth: number = 0;
	public borderRightWidth: number = 0;
	public borderBottomWidth: number = 0;
	public borderLeftWidth: number = 0;
	public borderTopLeftRadius: number = 0;
	public borderTopRightRadius: number = 0;
	public borderBottomLeftRadius: number = 0;
	public borderBottomRightRadius: number = 0;
	public clipPath: string;

	private clone(): Background {
		const clone = new Background();

		clone.color = this.color;
		clone.image = this.image;
		clone.repeat = this.repeat;
		clone.position = this.position;
		clone.size = this.size;
		clone.borderTopColor = this.borderTopColor;
		clone.borderRightColor = this.borderRightColor;
		clone.borderBottomColor = this.borderBottomColor;
		clone.borderLeftColor = this.borderLeftColor;
		clone.borderTopWidth = this.borderTopWidth;
		clone.borderRightWidth = this.borderRightWidth;
		clone.borderBottomWidth = this.borderBottomWidth;
		clone.borderLeftWidth = this.borderLeftWidth;
		clone.borderTopLeftRadius = this.borderTopLeftRadius;
		clone.borderTopRightRadius = this.borderTopRightRadius;
		clone.borderBottomRightRadius = this.borderBottomRightRadius;
		clone.borderBottomLeftRadius = this.borderBottomLeftRadius;
		clone.clipPath = this.clipPath;

		return clone;
	}

	public withColor(value: Color): Background {
		const clone = this.clone();
		clone.color = value;

		return clone;
	}

	public withImage(value: string | LinearGradient): Background {
		const clone = this.clone();
		clone.image = value;

		return clone;
	}

	public withRepeat(value: BackgroundRepeat): Background {
		const clone = this.clone();
		clone.repeat = value;

		return clone;
	}

	public withPosition(value: string): Background {
		const clone = this.clone();
		clone.position = value;

		return clone;
	}

	public withSize(value: string): Background {
		const clone = this.clone();
		clone.size = value;

		return clone;
	}

	public withBorderTopColor(value: Color): Background {
		const clone = this.clone();
		clone.borderTopColor = value;

		return clone;
	}

	public withBorderRightColor(value: Color): Background {
		const clone = this.clone();
		clone.borderRightColor = value;

		return clone;
	}

	public withBorderBottomColor(value: Color): Background {
		const clone = this.clone();
		clone.borderBottomColor = value;

		return clone;
	}

	public withBorderLeftColor(value: Color): Background {
		const clone = this.clone();
		clone.borderLeftColor = value;

		return clone;
	}

	public withBorderTopWidth(value: number): Background {
		const clone = this.clone();
		clone.borderTopWidth = value;

		return clone;
	}

	public withBorderRightWidth(value: number): Background {
		const clone = this.clone();
		clone.borderRightWidth = value;

		return clone;
	}

	public withBorderBottomWidth(value: number): Background {
		const clone = this.clone();
		clone.borderBottomWidth = value;

		return clone;
	}

	public withBorderLeftWidth(value: number): Background {
		const clone = this.clone();
		clone.borderLeftWidth = value;

		return clone;
	}

	public withBorderTopLeftRadius(value: number): Background {
		const clone = this.clone();
		clone.borderTopLeftRadius = value;

		return clone;
	}

	public withBorderTopRightRadius(value: number): Background {
		const clone = this.clone();
		clone.borderTopRightRadius = value;

		return clone;
	}

	public withBorderBottomRightRadius(value: number): Background {
		const clone = this.clone();
		clone.borderBottomRightRadius = value;

		return clone;
	}

	public withBorderBottomLeftRadius(value: number): Background {
		const clone = this.clone();
		clone.borderBottomLeftRadius = value;

		return clone;
	}

	public withClipPath(value: string): Background {
		const clone = this.clone();
		clone.clipPath = value;

		return clone;
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

	public toString(): string {
		return `isEmpty: ${this.isEmpty()}; color: ${this.color}; image: ${this.image}; repeat: ${this.repeat}; position: ${this.position}; size: ${this.size}; borderTopColor: ${this.borderTopColor}; borderRightColor: ${this.borderRightColor}; borderBottomColor: ${this.borderBottomColor}; borderLeftColor: ${this.borderLeftColor}; borderTopWidth: ${this.borderTopWidth}; borderRightWidth: ${this.borderRightWidth}; borderBottomWidth: ${this.borderBottomWidth}; borderLeftWidth: ${this.borderLeftWidth}; borderTopLeftRadius: ${this.borderTopLeftRadius}; borderTopRightRadius: ${
			this.borderTopRightRadius
		}; borderBottomRightRadius: ${this.borderBottomRightRadius}; borderBottomLeftRadius: ${this.borderBottomLeftRadius}; clipPath: ${this.clipPath};`;
	}
}
