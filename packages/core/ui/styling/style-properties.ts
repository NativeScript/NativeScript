import { unsetValue, CssProperty, CssAnimationProperty, ShorthandProperty, InheritedCssProperty, isCssWideKeyword } from '../core/properties';
import { Style } from './style';

import { Color } from '../../color';
import { Font, parseFont, FontStyle, FontStyleType, FontWeight, FontWeightType, FontVariationSettings, FontVariationSettingsType } from './font';
import { Background } from './background';
import { layout } from '../../utils';

import { Trace } from '../../trace';
import { CoreTypes } from '../../core-types';

import { parseBackground } from '../../css/parser';
import { LinearGradient } from './linear-gradient';
import { parseCSSShadow, ShadowCSSValues } from './css-shadow';
import { transformConverter } from './css-transform';
import { ClipPathFunction } from './clip-path-function';

interface ShorthandPositioning {
	top: string;
	right: string;
	bottom: string;
	left: string;
}

function equalsCommon(a: CoreTypes.LengthType, b: CoreTypes.LengthType): boolean;
function equalsCommon(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean;
function equalsCommon(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean {
	if (a == 'auto' || isCssWideKeyword(a)) {
		return b == 'auto' || isCssWideKeyword(b);
	}

	if (b == 'auto' || isCssWideKeyword(b)) {
		return false;
	}

	if (typeof a === 'number') {
		if (typeof b === 'number') {
			return a == b;
		}
		if (!b) {
			return false;
		}
		return b.unit == 'dip' && a == b.value;
	}

	if (typeof b === 'number') {
		return a ? a.unit == 'dip' && a.value == b : false;
	}
	if (!a || !b) {
		return false;
	}
	return a.value == b.value && a.unit == b.unit;
}

function convertToStringCommon(length: CoreTypes.LengthType | CoreTypes.PercentLengthType): string {
	if (length == 'auto' || isCssWideKeyword(length)) {
		return 'auto';
	}

	if (typeof length === 'number') {
		return length.toString();
	}

	let val = length.value;
	if (length.unit === '%') {
		val *= 100;
	}

	return val + length.unit;
}

function toDevicePixelsCommon(length: CoreTypes.PercentLengthType, auto: number = Number.NaN, parentAvailableWidth: number = Number.NaN): number {
	if (length == 'auto' || isCssWideKeyword(length)) {
		return auto;
	}
	if (typeof length === 'number') {
		return layout.round(layout.toDevicePixels(length));
	}
	if (!length) {
		return auto;
	}
	switch (length.unit) {
		case 'px':
			return layout.round(length.value);
		case '%':
			return layout.round(parentAvailableWidth * length.value);
		case 'dip':
		default:
			return layout.round(layout.toDevicePixels(length.value));
	}
}

export namespace PercentLength {
	export function parse(fromValue: string | CoreTypes.LengthType): CoreTypes.PercentLengthType {
		if (fromValue == 'auto') {
			return 'auto';
		}

		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			const percentIndex = stringValue.indexOf('%');
			if (percentIndex !== -1) {
				let value: CoreTypes.percent;
				// if only % or % is not last we treat it as invalid value.
				if (percentIndex !== stringValue.length - 1 || percentIndex === 0) {
					value = Number.NaN;
				} else {
					// Normalize result to values between -1 and 1
					value = parseFloat(stringValue.substring(0, stringValue.length - 1).trim()) / 100;
				}

				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return { unit: '%', value };
			} else if (stringValue.indexOf('px') !== -1) {
				stringValue = stringValue.replace('px', '').trim();
				const value: CoreTypes.px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return { unit: 'px', value };
			} else {
				const value: CoreTypes.dip = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return value;
			}
		} else {
			return fromValue;
		}
	}

	export const equals: {
		(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean;
	} = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.PercentLengthType, auto: number, parentAvailableWidth: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.PercentLengthType): string;
	} = convertToStringCommon;
}

export namespace FixedLength {
	export function parse(fromValue: string | CoreTypes.FixedLengthType): CoreTypes.FixedLengthType {
		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			if (stringValue.indexOf('px') !== -1) {
				stringValue = stringValue.replace('px', '').trim();
				const value: CoreTypes.px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return { unit: 'px', value };
			} else {
				const value: CoreTypes.dip = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return value;
			}
		} else {
			return fromValue;
		}
	}
	export const equals: { (a: CoreTypes.FixedLengthType, b: CoreTypes.FixedLengthType): boolean } = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.FixedLengthType): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.FixedLengthType): string;
	} = convertToStringCommon;
}

export namespace Length {
	export function parse(fromValue: string | CoreTypes.LengthType): CoreTypes.LengthType {
		if (fromValue == 'auto') {
			return 'auto';
		}

		return FixedLength.parse(fromValue);
	}
	export const equals: { (a: CoreTypes.LengthType, b: CoreTypes.LengthType): boolean } = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.LengthType, auto?: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.LengthType): string;
	} = convertToStringCommon;
}

function isNonNegativeFiniteNumber(value: number): boolean {
	return isFinite(value) && !isNaN(value) && value >= 0;
}

function parseClipPath(value: string): string | ClipPathFunction {
	const funcStartIndex = value.indexOf('(');
	const funcEndIndex = value.lastIndexOf(')');

	if (funcStartIndex > -1 && funcEndIndex > -1) {
		const functionName = value.substring(0, funcStartIndex).trim();

		switch (functionName) {
			case 'rect':
			case 'circle':
			case 'ellipse':
			case 'polygon':
			case 'inset': {
				return new ClipPathFunction(functionName, value.substring(funcStartIndex + 1, funcEndIndex));
			}
			default:
				throw new Error(`Clip-path function ${functionName} is not valid.`);
		}
	} else {
		if (value === 'none') {
			return null;
		}

		// Only shape functions and none are supported for now
		throw new Error(`Clip-path value ${value} is not valid.`);
	}
}

function parseShorthandPositioning(value: string): ShorthandPositioning {
	const arr = value.split(/[ ,]+/);

	let top: string;
	let right: string;
	let bottom: string;
	let left: string;

	if (arr.length === 1) {
		top = arr[0];
		right = arr[0];
		bottom = arr[0];
		left = arr[0];
	} else if (arr.length === 2) {
		top = arr[0];
		bottom = arr[0];
		right = arr[1];
		left = arr[1];
	} else if (arr.length === 3) {
		top = arr[0];
		right = arr[1];
		left = arr[1];
		bottom = arr[2];
	} else if (arr.length === 4) {
		top = arr[0];
		right = arr[1];
		bottom = arr[2];
		left = arr[3];
	} else {
		throw new Error('Expected 1, 2, 3 or 4 parameters. Actual: ' + value);
	}

	return {
		top: top,
		right: right,
		bottom: bottom,
		left: left,
	};
}

function parseBorderColorPositioning(value: string): ShorthandPositioning {
	if (value.indexOf('rgb') === 0 || value.indexOf('hsl') === 0) {
		return {
			top: value,
			right: value,
			bottom: value,
			left: value,
		};
	}

	return parseShorthandPositioning(value);
}

function convertToBackgrounds(value: string): [CssProperty<any, any> | CssAnimationProperty<any, any>, any][] {
	if (typeof value === 'string') {
		const backgrounds = parseBackground(value).value;
		let backgroundColor = unsetValue;
		if (backgrounds.color) {
			backgroundColor = backgrounds.color instanceof Color ? backgrounds.color : new Color(backgrounds.color);
		}

		let backgroundImage: string | LinearGradient;
		if (typeof backgrounds.image === 'object' && backgrounds.image) {
			backgroundImage = LinearGradient.parse(backgrounds.image);
		} else {
			backgroundImage = backgrounds.image || unsetValue;
		}

		const backgroundRepeat = backgrounds.repeat || unsetValue;
		const backgroundPosition = backgrounds.position ? backgrounds.position.text : unsetValue;

		return [
			[backgroundColorProperty, backgroundColor],
			[backgroundImageProperty, backgroundImage],
			[backgroundRepeatProperty, backgroundRepeat],
			[backgroundPositionProperty, backgroundPosition],
		];
	} else {
		return [
			[backgroundColorProperty, unsetValue],
			[backgroundImageProperty, unsetValue],
			[backgroundRepeatProperty, unsetValue],
			[backgroundPositionProperty, unsetValue],
		];
	}
}

function convertToMargins(value: string | CoreTypes.PercentLengthType): [CssProperty<Style, CoreTypes.PercentLengthType>, CoreTypes.PercentLengthType][] {
	if (typeof value === 'string' && value !== 'auto') {
		const thickness = parseShorthandPositioning(value);

		return [
			[marginTopProperty, PercentLength.parse(thickness.top)],
			[marginRightProperty, PercentLength.parse(thickness.right)],
			[marginBottomProperty, PercentLength.parse(thickness.bottom)],
			[marginLeftProperty, PercentLength.parse(thickness.left)],
		];
	} else {
		return [
			[marginTopProperty, value],
			[marginRightProperty, value],
			[marginBottomProperty, value],
			[marginLeftProperty, value],
		];
	}
}

function convertToPaddings(value: string | CoreTypes.LengthType): [CssProperty<Style, CoreTypes.LengthType>, CoreTypes.LengthType][] {
	if (typeof value === 'string' && value !== 'auto') {
		const thickness = parseShorthandPositioning(value);

		return [
			[paddingTopProperty, Length.parse(thickness.top)],
			[paddingRightProperty, Length.parse(thickness.right)],
			[paddingBottomProperty, Length.parse(thickness.bottom)],
			[paddingLeftProperty, Length.parse(thickness.left)],
		];
	} else {
		return [
			[paddingTopProperty, value],
			[paddingRightProperty, value],
			[paddingBottomProperty, value],
			[paddingLeftProperty, value],
		];
	}
}

function convertToTransform(value: string): [CssAnimationProperty<any, any>, any][] {
	if (value === unsetValue) {
		value = 'none';
	}

	const { translate, rotate, scale } = transformConverter(value);

	return [
		[translateXProperty, translate.x],
		[translateYProperty, translate.y],

		[scaleXProperty, scale.x],
		[scaleYProperty, scale.y],

		[rotateProperty, rotate.z],
		[rotateXProperty, rotate.x],
		[rotateYProperty, rotate.y],
	];
}

export const minWidthProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'minWidth',
	cssName: 'min-width',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectiveMinWidth = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
minWidthProperty.register(Style);

export const minHeightProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'minHeight',
	cssName: 'min-height',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectiveMinHeight = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
minHeightProperty.register(Style);

export const widthProperty = new CssAnimationProperty<Style, CoreTypes.PercentLengthType>({
	name: 'width',
	cssName: 'width',
	defaultValue: 'auto',
	equalityComparer: Length.equals,
	// TODO: CSSAnimationProperty was needed for keyframe (copying other impls), but `affectsLayout` does not exist
	//       on the animation property, so fake it here. x_x
	valueChanged: (target, oldValue, newValue) => {
		if (global.isIOS) {
			const view = target.viewRef.get();
			if (view) {
				view.requestLayout();
			}
		}
	},
	valueConverter: PercentLength.parse,
});
widthProperty.register(Style);

export const heightProperty = new CssAnimationProperty<Style, CoreTypes.PercentLengthType>({
	name: 'height',
	cssName: 'height',
	defaultValue: 'auto',
	equalityComparer: Length.equals,
	// TODO: CSSAnimationProperty was needed for keyframe (copying other impls), but `affectsLayout` does not exist
	//       on the animation property, so fake it here. -_-
	valueChanged: (target, oldValue, newValue) => {
		if (global.isIOS) {
			const view = target.viewRef.get();
			if (view) {
				view.requestLayout();
			}
		}
	},
	valueConverter: PercentLength.parse,
});
heightProperty.register(Style);

const marginProperty = new ShorthandProperty<Style, string | CoreTypes.PercentLengthType>({
	name: 'margin',
	cssName: 'margin',
	getter: function (this: Style) {
		if (PercentLength.equals(this.marginTop, this.marginRight) && PercentLength.equals(this.marginTop, this.marginBottom) && PercentLength.equals(this.marginTop, this.marginLeft)) {
			return this.marginTop;
		}

		return `${PercentLength.convertToString(this.marginTop)} ${PercentLength.convertToString(this.marginRight)} ${PercentLength.convertToString(this.marginBottom)} ${PercentLength.convertToString(this.marginLeft)}`;
	},
	converter: convertToMargins,
});
marginProperty.register(Style);

export const marginLeftProperty = new CssProperty<Style, CoreTypes.PercentLengthType>({
	name: 'marginLeft',
	cssName: 'margin-left',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginLeftProperty.register(Style);

export const marginRightProperty = new CssProperty<Style, CoreTypes.PercentLengthType>({
	name: 'marginRight',
	cssName: 'margin-right',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginRightProperty.register(Style);

export const marginTopProperty = new CssProperty<Style, CoreTypes.PercentLengthType>({
	name: 'marginTop',
	cssName: 'margin-top',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginTopProperty.register(Style);

export const marginBottomProperty = new CssProperty<Style, CoreTypes.PercentLengthType>({
	name: 'marginBottom',
	cssName: 'margin-bottom',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginBottomProperty.register(Style);

const paddingProperty = new ShorthandProperty<Style, string | CoreTypes.LengthType>({
	name: 'padding',
	cssName: 'padding',
	getter: function (this: Style) {
		if (Length.equals(this.paddingTop, this.paddingRight) && Length.equals(this.paddingTop, this.paddingBottom) && Length.equals(this.paddingTop, this.paddingLeft)) {
			return this.paddingTop;
		}

		return `${Length.convertToString(this.paddingTop)} ${Length.convertToString(this.paddingRight)} ${Length.convertToString(this.paddingBottom)} ${Length.convertToString(this.paddingLeft)}`;
	},
	converter: convertToPaddings,
});
paddingProperty.register(Style);

export const paddingLeftProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'paddingLeft',
	cssName: 'padding-left',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectivePaddingLeft = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
paddingLeftProperty.register(Style);

export const paddingRightProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'paddingRight',
	cssName: 'padding-right',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectivePaddingRight = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
paddingRightProperty.register(Style);

export const paddingTopProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'paddingTop',
	cssName: 'padding-top',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectivePaddingTop = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
paddingTopProperty.register(Style);

export const paddingBottomProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'paddingBottom',
	cssName: 'padding-bottom',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.effectivePaddingBottom = Length.toDevicePixels(newValue, 0);
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
	valueConverter: Length.parse,
});
paddingBottomProperty.register(Style);

export const horizontalAlignmentProperty = new CssProperty<Style, CoreTypes.HorizontalAlignmentType>({
	name: 'horizontalAlignment',
	cssName: 'horizontal-align',
	defaultValue: CoreTypes.HorizontalAlignment.stretch,
	affectsLayout: global.isIOS,
	valueConverter: CoreTypes.HorizontalAlignment.parse,
});
horizontalAlignmentProperty.register(Style);

export const verticalAlignmentProperty = new CssProperty<Style, CoreTypes.VerticalAlignmentTextType>({
	name: 'verticalAlignment',
	cssName: 'vertical-align',
	defaultValue: CoreTypes.VerticalAlignmentText.stretch,
	affectsLayout: global.isIOS,
	valueConverter: CoreTypes.VerticalAlignmentText.parse,
});
verticalAlignmentProperty.register(Style);

export const rotateProperty = new CssAnimationProperty<Style, number>({
	name: 'rotate',
	cssName: 'rotate',
	defaultValue: 0,
	valueConverter: parseFloat,
});
rotateProperty.register(Style);

export const rotateXProperty = new CssAnimationProperty<Style, number>({
	name: 'rotateX',
	cssName: 'rotatex',
	defaultValue: 0,
	valueConverter: parseFloat,
});
rotateXProperty.register(Style);

export const rotateYProperty = new CssAnimationProperty<Style, number>({
	name: 'rotateY',
	cssName: 'rotatey',
	defaultValue: 0,
	valueConverter: parseFloat,
});
rotateYProperty.register(Style);

export const perspectiveProperty = new CssAnimationProperty<Style, number>({
	name: 'perspective',
	cssName: 'perspective',
	defaultValue: 1000,
	valueConverter: parseFloat,
});
perspectiveProperty.register(Style);

export const scaleXProperty = new CssAnimationProperty<Style, number>({
	name: 'scaleX',
	cssName: 'scaleX',
	defaultValue: 1,
	valueConverter: parseFloat,
});
scaleXProperty.register(Style);

export const scaleYProperty = new CssAnimationProperty<Style, number>({
	name: 'scaleY',
	cssName: 'scaleY',
	defaultValue: 1,
	valueConverter: parseFloat,
});
scaleYProperty.register(Style);

export const translateXProperty = new CssAnimationProperty<Style, CoreTypes.FixedLengthType>({
	name: 'translateX',
	cssName: 'translateX',
	defaultValue: 0,
	equalityComparer: FixedLength.equals,
	valueConverter: FixedLength.parse,
});
translateXProperty.register(Style);

export const translateYProperty = new CssAnimationProperty<Style, CoreTypes.FixedLengthType>({
	name: 'translateY',
	cssName: 'translateY',
	defaultValue: 0,
	equalityComparer: FixedLength.equals,
	valueConverter: FixedLength.parse,
});
translateYProperty.register(Style);

const transformProperty = new ShorthandProperty<Style, string>({
	name: 'transform',
	cssName: 'transform',
	getter: function (this: Style) {
		const scaleX = this.scaleX;
		const scaleY = this.scaleY;
		const translateX = this.translateX;
		const translateY = this.translateY;
		const rotate = this.rotate;
		const rotateX = this.rotateX;
		const rotateY = this.rotateY;
		let result = '';
		if (translateX !== 0 || translateY !== 0) {
			result += `translate(${translateX}, ${translateY}) `;
		}
		if (scaleX !== 1 || scaleY !== 1) {
			result += `scale(${scaleX}, ${scaleY}) `;
		}
		if (rotateX !== 0 || rotateY !== 0 || rotate !== 0) {
			result += `rotate(${rotateX}, ${rotateY}, ${rotate}) `;
			result += `rotate (${rotate})`;
		}

		return result.trim();
	},
	converter: convertToTransform,
});
transformProperty.register(Style);

// Background properties.
const backgroundProperty = new ShorthandProperty<Style, string | Color>({
	name: 'background',
	cssName: 'background',
	getter: function (this: Style) {
		return `${this.backgroundColor} ${this.backgroundImage} ${this.backgroundRepeat} ${this.backgroundPosition}`;
	},
	converter: convertToBackgrounds,
});
backgroundProperty.register(Style);

export const backgroundInternalProperty = new CssProperty<Style, Background>({
	name: 'backgroundInternal',
	cssName: '_backgroundInternal',
	defaultValue: Background.default,
});
backgroundInternalProperty.register(Style);

export const backgroundImageProperty = new CssProperty<Style, string | LinearGradient>({
	name: 'backgroundImage',
	cssName: 'background-image',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withImage(newValue);
	},
	equalityComparer: (value1, value2) => {
		if (value1 instanceof LinearGradient && value2 instanceof LinearGradient) {
			return LinearGradient.equals(value1, value2);
		} else {
			return value1 === value2;
		}
	},
	valueConverter: (value: string | LinearGradient) => {
		if (typeof value === 'string') {
			const parsed = parseBackground(value);
			if (parsed) {
				value = typeof parsed.value.image === 'object' ? LinearGradient.parse(parsed.value.image) : value;
			}
		}

		return value;
	},
});
backgroundImageProperty.register(Style);

export const backgroundColorProperty = new CssAnimationProperty<Style, Color>({
	name: 'backgroundColor',
	cssName: 'background-color',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withColor(newValue);
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
backgroundColorProperty.register(Style);

export const backgroundRepeatProperty = new CssProperty<Style, CoreTypes.BackgroundRepeatType>({
	name: 'backgroundRepeat',
	cssName: 'background-repeat',
	valueConverter: CoreTypes.BackgroundRepeat.parse,
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withRepeat(newValue);
	},
});
backgroundRepeatProperty.register(Style);

export const backgroundSizeProperty = new CssProperty<Style, string>({
	name: 'backgroundSize',
	cssName: 'background-size',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withSize(newValue);
	},
});
backgroundSizeProperty.register(Style);

export const backgroundPositionProperty = new CssProperty<Style, string>({
	name: 'backgroundPosition',
	cssName: 'background-position',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withPosition(newValue);
	},
});
backgroundPositionProperty.register(Style);

// Border Color properties.
const borderColorProperty = new ShorthandProperty<Style, string | Color>({
	name: 'borderColor',
	cssName: 'border-color',
	getter: function (this: Style) {
		if (Color.equals(this.borderTopColor, this.borderRightColor) && Color.equals(this.borderTopColor, this.borderBottomColor) && Color.equals(this.borderTopColor, this.borderLeftColor)) {
			return this.borderTopColor;
		} else {
			return `${this.borderTopColor} ${this.borderRightColor} ${this.borderBottomColor} ${this.borderLeftColor}`;
		}
	},
	converter: function (value) {
		if (typeof value === 'string') {
			const colors = parseBorderColorPositioning(value);

			return [
				[borderTopColorProperty, new Color(colors.top)],
				[borderRightColorProperty, new Color(colors.right)],
				[borderBottomColorProperty, new Color(colors.bottom)],
				[borderLeftColorProperty, new Color(colors.left)],
			];
		} else {
			return [
				[borderTopColorProperty, value],
				[borderRightColorProperty, value],
				[borderBottomColorProperty, value],
				[borderLeftColorProperty, value],
			];
		}
	},
});
borderColorProperty.register(Style);

export const borderTopColorProperty = new CssProperty<Style, Color>({
	name: 'borderTopColor',
	cssName: 'border-top-color',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withBorderTopColor(newValue);
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderTopColorProperty.register(Style);

export const borderRightColorProperty = new CssProperty<Style, Color>({
	name: 'borderRightColor',
	cssName: 'border-right-color',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withBorderRightColor(newValue);
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderRightColorProperty.register(Style);

export const borderBottomColorProperty = new CssProperty<Style, Color>({
	name: 'borderBottomColor',
	cssName: 'border-bottom-color',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withBorderBottomColor(newValue);
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderBottomColorProperty.register(Style);

export const borderLeftColorProperty = new CssProperty<Style, Color>({
	name: 'borderLeftColor',
	cssName: 'border-left-color',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withBorderLeftColor(newValue);
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderLeftColorProperty.register(Style);

// Border Width properties.
const borderWidthProperty = new ShorthandProperty<Style, string | CoreTypes.LengthType>({
	name: 'borderWidth',
	cssName: 'border-width',
	getter: function (this: Style) {
		if (Length.equals(this.borderTopWidth, this.borderRightWidth) && Length.equals(this.borderTopWidth, this.borderBottomWidth) && Length.equals(this.borderTopWidth, this.borderLeftWidth)) {
			return this.borderTopWidth;
		} else {
			return `${Length.convertToString(this.borderTopWidth)} ${Length.convertToString(this.borderRightWidth)} ${Length.convertToString(this.borderBottomWidth)} ${Length.convertToString(this.borderLeftWidth)}`;
		}
	},
	converter: function (value) {
		if (typeof value === 'string' && value !== 'auto') {
			const borderWidths = parseShorthandPositioning(value);

			return [
				[borderTopWidthProperty, Length.parse(borderWidths.top)],
				[borderRightWidthProperty, Length.parse(borderWidths.right)],
				[borderBottomWidthProperty, Length.parse(borderWidths.bottom)],
				[borderLeftWidthProperty, Length.parse(borderWidths.left)],
			];
		} else {
			return [
				[borderTopWidthProperty, value],
				[borderRightWidthProperty, value],
				[borderBottomWidthProperty, value],
				[borderLeftWidthProperty, value],
			];
		}
	},
});
borderWidthProperty.register(Style);

export const borderTopWidthProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderTopWidth',
	cssName: 'border-top-width',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderTopWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderTopWidth(value);
	},
	valueConverter: Length.parse,
});
borderTopWidthProperty.register(Style);

export const borderRightWidthProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderRightWidth',
	cssName: 'border-right-width',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-right-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderRightWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderRightWidth(value);
	},
	valueConverter: Length.parse,
});
borderRightWidthProperty.register(Style);

export const borderBottomWidthProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderBottomWidth',
	cssName: 'border-bottom-width',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderBottomWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderBottomWidth(value);
	},
	valueConverter: Length.parse,
});
borderBottomWidthProperty.register(Style);

export const borderLeftWidthProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderLeftWidth',
	cssName: 'border-left-width',
	defaultValue: CoreTypes.zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-left-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderLeftWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderLeftWidth(value);
	},
	valueConverter: Length.parse,
});
borderLeftWidthProperty.register(Style);

// Border Radius properties.
const borderRadiusProperty = new ShorthandProperty<Style, string | CoreTypes.LengthType>({
	name: 'borderRadius',
	cssName: 'border-radius',
	getter: function (this: Style) {
		if (Length.equals(this.borderTopLeftRadius, this.borderTopRightRadius) && Length.equals(this.borderTopLeftRadius, this.borderBottomRightRadius) && Length.equals(this.borderTopLeftRadius, this.borderBottomLeftRadius)) {
			return this.borderTopLeftRadius;
		}

		return `${Length.convertToString(this.borderTopLeftRadius)} ${Length.convertToString(this.borderTopRightRadius)} ${Length.convertToString(this.borderBottomRightRadius)} ${Length.convertToString(this.borderBottomLeftRadius)}`;
	},
	converter: function (value) {
		if (typeof value === 'string') {
			const borderRadius = parseShorthandPositioning(value);

			return [
				[borderTopLeftRadiusProperty, Length.parse(borderRadius.top)],
				[borderTopRightRadiusProperty, Length.parse(borderRadius.right)],
				[borderBottomRightRadiusProperty, Length.parse(borderRadius.bottom)],
				[borderBottomLeftRadiusProperty, Length.parse(borderRadius.left)],
			];
		} else {
			return [
				[borderTopLeftRadiusProperty, value],
				[borderTopRightRadiusProperty, value],
				[borderBottomRightRadiusProperty, value],
				[borderBottomLeftRadiusProperty, value],
			];
		}
	},
});
borderRadiusProperty.register(Style);

export const borderTopLeftRadiusProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderTopLeftRadius',
	cssName: 'border-top-left-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-left-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderTopLeftRadius(value);
	},
	valueConverter: Length.parse,
	equalityComparer: Length.equals,
});
borderTopLeftRadiusProperty.register(Style);

export const borderTopRightRadiusProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderTopRightRadius',
	cssName: 'border-top-right-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-right-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderTopRightRadius(value);
	},
	valueConverter: Length.parse,
	equalityComparer: Length.equals,
});
borderTopRightRadiusProperty.register(Style);

export const borderBottomRightRadiusProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderBottomRightRadius',
	cssName: 'border-bottom-right-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-right-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderBottomRightRadius(value);
	},
	valueConverter: Length.parse,
	equalityComparer: Length.equals,
});
borderBottomRightRadiusProperty.register(Style);

export const borderBottomLeftRadiusProperty = new CssProperty<Style, CoreTypes.LengthType>({
	name: 'borderBottomLeftRadius',
	cssName: 'border-bottom-left-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-left-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		target.backgroundInternal = target.backgroundInternal.withBorderBottomLeftRadius(value);
	},
	valueConverter: Length.parse,
	equalityComparer: Length.equals,
});
borderBottomLeftRadiusProperty.register(Style);

const boxShadowProperty = new CssProperty<Style, ShadowCSSValues>({
	name: 'boxShadow',
	cssName: 'box-shadow',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withBoxShadow(
			newValue
				? {
						inset: newValue.inset,
						offsetX: Length.toDevicePixels(newValue.offsetX, 0),
						offsetY: Length.toDevicePixels(newValue.offsetY, 0),
						blurRadius: Length.toDevicePixels(newValue.blurRadius, 0),
						spreadRadius: Length.toDevicePixels(newValue.spreadRadius, 0),
						color: newValue.color,
					}
				: null,
		);
	},
	valueConverter: (value) => {
		return parseCSSShadow(value);
	},
});
boxShadowProperty.register(Style);

export const clipPathProperty = new CssProperty<Style, string | ClipPathFunction>({
	name: 'clipPath',
	cssName: 'clip-path',
	valueChanged: (target, oldValue, newValue) => {
		target.backgroundInternal = target.backgroundInternal.withClipPath(newValue);
	},
	equalityComparer: (value1, value2) => {
		if (value1 instanceof ClipPathFunction && value2 instanceof ClipPathFunction) {
			return ClipPathFunction.equals(value1, value2);
		}
		return value1 === value2;
	},
	valueConverter(value: string | ClipPathFunction) {
		if (typeof value === 'string') {
			return parseClipPath(value);
		}

		return value;
	},
});
clipPathProperty.register(Style);

export const zIndexProperty = new CssProperty<Style, number>({
	name: 'zIndex',
	cssName: 'z-index',
	valueConverter: (value: string): number => {
		const newValue = parseFloat(value);
		if (isNaN(newValue)) {
			throw new Error(`Invalid value: ${newValue}`);
		}

		return newValue;
	},
});
zIndexProperty.register(Style);

export const opacityProperty = new CssAnimationProperty<Style, number>({
	name: 'opacity',
	cssName: 'opacity',
	defaultValue: 1,
	valueConverter: (value: string): number => {
		const newValue = parseFloat(value);
		if (!isNonNegativeFiniteNumber(newValue) || newValue > 1) {
			throw new Error(`Opacity should be between [0, 1]. Value: ${newValue}`);
		}

		return newValue;
	},
});
opacityProperty.register(Style);

export const colorProperty = new InheritedCssProperty<Style, Color>({
	name: 'color',
	cssName: 'color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
colorProperty.register(Style);

export const fontInternalProperty = new CssProperty<Style, Font>({
	name: 'fontInternal',
	cssName: '_fontInternal',
});
fontInternalProperty.register(Style);

export const fontFamilyProperty = new InheritedCssProperty<Style, string>({
	name: 'fontFamily',
	cssName: 'font-family',
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const currentFont = target.fontInternal || Font.default;
		if (currentFont.fontFamily !== newValue) {
			const newFont = currentFont.withFontFamily(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
});
fontFamilyProperty.register(Style);

export const fontScaleInternalProperty = new InheritedCssProperty<Style, number>({
	name: 'fontScaleInternal',
	cssName: '_fontScaleInternal',
	defaultValue: 1.0,
	valueConverter: (v) => parseFloat(v),
});
fontScaleInternalProperty.register(Style);

export const fontSizeProperty = new InheritedCssProperty<Style, number>({
	name: 'fontSize',
	cssName: 'font-size',
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		if (target.viewRef['handleFontSize'] === true) {
			return;
		}
		const currentFont = target.fontInternal || Font.default;
		if (currentFont.fontSize !== newValue) {
			const newFont = currentFont.withFontSize(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
	valueConverter: (v) => parseFloat(v),
});
fontSizeProperty.register(Style);

export const fontStyleProperty = new InheritedCssProperty<Style, FontStyleType>({
	name: 'fontStyle',
	cssName: 'font-style',
	affectsLayout: global.isIOS,
	defaultValue: FontStyle.NORMAL,
	valueConverter: FontStyle.parse,
	valueChanged: (target, oldValue, newValue) => {
		const currentFont = target.fontInternal || Font.default;
		if (currentFont.fontStyle !== newValue) {
			const newFont = currentFont.withFontStyle(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
});
fontStyleProperty.register(Style);

export const fontWeightProperty = new InheritedCssProperty<Style, FontWeightType>({
	name: 'fontWeight',
	cssName: 'font-weight',
	affectsLayout: global.isIOS,
	defaultValue: FontWeight.NORMAL,
	valueConverter: FontWeight.parse,
	valueChanged: (target, oldValue, newValue) => {
		const currentFont = target.fontInternal || Font.default;
		if (currentFont.fontWeight !== newValue) {
			const newFont = currentFont.withFontWeight(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
});
fontWeightProperty.register(Style);

const fontProperty = new ShorthandProperty<Style, string>({
	name: 'font',
	cssName: 'font',
	getter: function (this: Style) {
		return `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
	},
	converter: function (value) {
		if (value === unsetValue) {
			return [
				[fontStyleProperty, unsetValue],
				[fontWeightProperty, unsetValue],
				[fontSizeProperty, unsetValue],
				[fontFamilyProperty, unsetValue],
			];
		} else {
			const font = parseFont(value);
			const fontSize = parseFloat(font.fontSize);

			return [
				[fontStyleProperty, font.fontStyle],
				[fontWeightProperty, font.fontWeight],
				[fontSizeProperty, fontSize],
				[fontFamilyProperty, font.fontFamily],
			];
		}
	},
});
fontProperty.register(Style);

export const fontVariationSettingsProperty = new InheritedCssProperty<Style, FontVariationSettingsType[]>({
	name: 'fontVariationSettings',
	cssName: 'font-variation-settings',
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		const currentFont = target.fontInternal || Font.default;
		if (currentFont.fontVariationSettings !== newValue) {
			const newFont = currentFont.withFontVariationSettings(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
	valueConverter: (value) => {
		return FontVariationSettings.parse(value);
	},
});
fontVariationSettingsProperty.register(Style);

export const visibilityProperty = new CssProperty<Style, CoreTypes.VisibilityType>({
	name: 'visibility',
	cssName: 'visibility',
	defaultValue: CoreTypes.Visibility.visible,
	affectsLayout: global.isIOS,
	valueConverter: CoreTypes.Visibility.parse,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.isCollapsed = newValue === CoreTypes.Visibility.collapse;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
	},
});
visibilityProperty.register(Style);

export const androidElevationProperty = new CssProperty<Style, number>({
	name: 'androidElevation',
	cssName: 'android-elevation',
	valueConverter: parseFloat,
});
androidElevationProperty.register(Style);

export const androidDynamicElevationOffsetProperty = new CssProperty<Style, number>({
	name: 'androidDynamicElevationOffset',
	cssName: 'android-dynamic-elevation-offset',
	valueConverter: parseFloat,
});
androidDynamicElevationOffsetProperty.register(Style);
