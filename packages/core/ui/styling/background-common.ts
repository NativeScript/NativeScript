import { CoreTypes } from '../../core-types';
import { LinearGradient } from './linear-gradient';
import { Color } from '../../color';
import { BoxShadow } from './box-shadow';
import { ClipPathFunction } from './clip-path-function';

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

	isDirty = false;

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
	public clipPath: string | ClipPathFunction;
	public boxShadows: BoxShadow[];
	public clearFlags: number = BackgroundClearFlags.NONE;

	cloneOrDirty(forceClone: boolean = true) {
		let clone = <Background>this;
		if (clone === Background.default || forceClone) {
			clone = new Background();
			Object.assign(clone, this);
		} else {
			clone.isDirty = true;
		}
		return clone;
	}

	public withColor(value: Color, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.color = value;
		if (!value) {
			clone.clearFlags |= BackgroundClearFlags.CLEAR_BACKGROUND_COLOR;
		}
		return clone;
	}

	public withImage(value: string | LinearGradient, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.image = value;

		return clone;
	}

	public withRepeat(value: CoreTypes.BackgroundRepeatType, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.repeat = value;

		return clone;
	}

	public withPosition(value: string, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.position = value;

		return clone;
	}

	public withSize(value: string, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.size = value;

		return clone;
	}

	public withBorderTopColor(value: Color, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderTopColor = value;

		return clone;
	}

	public withBorderRightColor(value: Color, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderRightColor = value;

		return clone;
	}

	public withBorderBottomColor(value: Color, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderBottomColor = value;

		return clone;
	}

	public withBorderLeftColor(value: Color, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderLeftColor = value;

		return clone;
	}

	public withBorderTopWidth(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderTopWidth = value;

		return clone;
	}

	public withBorderRightWidth(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderRightWidth = value;

		return clone;
	}

	public withBorderBottomWidth(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderBottomWidth = value;

		return clone;
	}

	public withBorderLeftWidth(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderLeftWidth = value;

		return clone;
	}

	public withBorderTopLeftRadius(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderTopLeftRadius = value;

		return clone;
	}

	public withBorderTopRightRadius(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderTopRightRadius = value;

		return clone;
	}

	public withBorderBottomRightRadius(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderBottomRightRadius = value;

		return clone;
	}

	public withBorderBottomLeftRadius(value: number, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.borderBottomLeftRadius = value;

		return clone;
	}

	public withClipPath(value: string | ClipPathFunction, forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.clipPath = value;

		return clone;
	}

	public withBoxShadow(value: : BoxShadow[], forceClone = true): Background {
		const clone = this.cloneOrDirty(forceClone);
		clone.boxShadow = value;
		if (!value) {
			this.clearFlags |= BackgroundClearFlags.CLEAR_BOX_SHADOW;
		}

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

		let isImageEqual = false;
		if (value1 instanceof LinearGradient && value2 instanceof LinearGradient) {
			isImageEqual = LinearGradient.equals(value1, value2);
		} else {
			isImageEqual = value1.image === value2.image;
		}

		let isClipPathEqual = false;
		if (value1.clipPath instanceof ClipPathFunction && value2.clipPath instanceof ClipPathFunction) {
			isClipPathEqual = ClipPathFunction.equals(value1.clipPath, value2.clipPath);
		} else {
			isClipPathEqual = value1.clipPath === value2.clipPath;
		}

		return (
			Color.equals(value1.color, value2.color) &&
			isImageEqual &&
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
			value1.boxShadow === value2.boxShadow &&
			value1.clipPath === value2.clipPath && 
			isClipPathEqual
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

	public hasBoxShadows(): boolean {
		return this.boxShadows?.length > 0;
	}

	public getBoxShadows(): BoxShadow[] {
		return this.boxShadows;
	}
}
