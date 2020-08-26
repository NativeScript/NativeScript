// Types
import { unsetValue, CssProperty, CssAnimationProperty, ShorthandProperty, InheritedCssProperty, makeValidator, makeParser } from '../core/properties';
import { Style } from '../styling/style';
import { Transformation, TransformationValue, TransformFunctionsInfo } from '../animation';

import { dip, px, percent } from '../core/view';

import { Color } from '../../color';
import { Font, parseFont, FontStyle, FontWeight } from '../../ui/styling/font';
import { layout, hasDuplicates } from '../../utils';
import { Background } from '../../ui/styling/background';

import { radiansToDegrees } from '../../utils/number-utils';

import { decompose2DTransformMatrix, getTransformMatrix, matrixArrayToCssMatrix, multiplyAffine2d } from '../../matrix';
import { Trace } from '../../trace';

import * as parser from '../../css/parser';
import { LinearGradient } from './linear-gradient';

export type LengthDipUnit = { readonly unit: 'dip'; readonly value: dip };
export type LengthPxUnit = { readonly unit: 'px'; readonly value: px };
export type LengthPercentUnit = { readonly unit: '%'; readonly value: percent };

export type Length = 'auto' | dip | LengthDipUnit | LengthPxUnit;
export type PercentLength = 'auto' | dip | LengthDipUnit | LengthPxUnit | LengthPercentUnit;

function equalsCommon(a: Length, b: Length): boolean;
function equalsCommon(a: PercentLength, b: PercentLength): boolean;
function equalsCommon(a: PercentLength, b: PercentLength): boolean {
	if (a == 'auto') {
		// tslint:disable-line
		return b == 'auto'; // tslint:disable-line
	}
	if (typeof a === 'number') {
		if (b == 'auto') {
			// tslint:disable-line
			return false;
		}
		if (typeof b === 'number') {
			return a == b; // tslint:disable-line
		}
		if (!b) {
			return false;
		}
		return b.unit == 'dip' && a == b.value; // tslint:disable-line
	}
	if (b == 'auto') {
		// tslint:disable-line
		return false;
	}
	if (typeof b === 'number') {
		return a ? a.unit == 'dip' && a.value == b : false; // tslint:disable-line
	}
	if (!a || !b) {
		return false;
	}
	return a.value == b.value && a.unit == b.unit; // tslint:disable-line
}

function convertToStringCommon(length: Length | PercentLength): string {
	if (length == 'auto') {
		// tslint:disable-line
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

function toDevicePixelsCommon(length: PercentLength, auto: number = Number.NaN, parentAvailableWidth: number = Number.NaN): number {
	if (length == 'auto') {
		// tslint:disable-line
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
	export function parse(fromValue: string | Length): PercentLength {
		if (fromValue == 'auto') {
			// tslint:disable-line
			return 'auto';
		}
		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			let percentIndex = stringValue.indexOf('%');
			if (percentIndex !== -1) {
				let value: percent;
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
				let value: px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return { unit: 'px', value };
			} else {
				let value: dip = parseFloat(stringValue);
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
		(a: PercentLength, b: PercentLength): boolean;
	} = equalsCommon;
	export const toDevicePixels: {
		(length: PercentLength, auto: number, parentAvailableWidth: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: PercentLength): string;
	} = convertToStringCommon;
}

export namespace Length {
	export function parse(fromValue: string | Length): Length {
		if (fromValue == 'auto') {
			// tslint:disable-line
			return 'auto';
		}
		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			if (stringValue.indexOf('px') !== -1) {
				stringValue = stringValue.replace('px', '').trim();
				let value: px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return { unit: 'px', value };
			} else {
				let value: dip = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return value;
			}
		} else {
			return fromValue;
		}
	}
	export const equals: { (a: Length, b: Length): boolean } = equalsCommon;
	export const toDevicePixels: {
		(length: Length, auto?: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: Length): string;
	} = convertToStringCommon;
}

export const zeroLength: Length = { value: 0, unit: 'px' };

export const minWidthProperty = new CssProperty<Style, Length>({
	name: 'minWidth',
	cssName: 'min-width',
	defaultValue: zeroLength,
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

export const minHeightProperty = new CssProperty<Style, Length>({
	name: 'minHeight',
	cssName: 'min-height',
	defaultValue: zeroLength,
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

export const widthProperty = new CssAnimationProperty<Style, PercentLength>({
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

export const heightProperty = new CssAnimationProperty<Style, PercentLength>({
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

const marginProperty = new ShorthandProperty<Style, string | PercentLength>({
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

export const marginLeftProperty = new CssProperty<Style, PercentLength>({
	name: 'marginLeft',
	cssName: 'margin-left',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginLeftProperty.register(Style);

export const marginRightProperty = new CssProperty<Style, PercentLength>({
	name: 'marginRight',
	cssName: 'margin-right',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginRightProperty.register(Style);

export const marginTopProperty = new CssProperty<Style, PercentLength>({
	name: 'marginTop',
	cssName: 'margin-top',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginTopProperty.register(Style);

export const marginBottomProperty = new CssProperty<Style, PercentLength>({
	name: 'marginBottom',
	cssName: 'margin-bottom',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueConverter: PercentLength.parse,
});
marginBottomProperty.register(Style);

const paddingProperty = new ShorthandProperty<Style, string | Length>({
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

export const paddingLeftProperty = new CssProperty<Style, Length>({
	name: 'paddingLeft',
	cssName: 'padding-left',
	defaultValue: zeroLength,
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

export const paddingRightProperty = new CssProperty<Style, Length>({
	name: 'paddingRight',
	cssName: 'padding-right',
	defaultValue: zeroLength,
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

export const paddingTopProperty = new CssProperty<Style, Length>({
	name: 'paddingTop',
	cssName: 'padding-top',
	defaultValue: zeroLength,
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

export const paddingBottomProperty = new CssProperty<Style, Length>({
	name: 'paddingBottom',
	cssName: 'padding-bottom',
	defaultValue: zeroLength,
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

export type HorizontalAlignment = 'left' | 'center' | 'right' | 'stretch';
export namespace HorizontalAlignment {
	export const LEFT: 'left' = 'left';
	export const CENTER: 'center' = 'center';
	export const RIGHT: 'right' = 'right';
	export const STRETCH: 'stretch' = 'stretch';
	export const isValid = makeValidator<HorizontalAlignment>(LEFT, CENTER, RIGHT, STRETCH);
	export const parse = makeParser<HorizontalAlignment>(isValid);
}

export const horizontalAlignmentProperty = new CssProperty<Style, HorizontalAlignment>({
	name: 'horizontalAlignment',
	cssName: 'horizontal-align',
	defaultValue: HorizontalAlignment.STRETCH,
	affectsLayout: global.isIOS,
	valueConverter: HorizontalAlignment.parse,
});
horizontalAlignmentProperty.register(Style);

export type VerticalAlignment = 'top' | 'middle' | 'bottom' | 'stretch' | 'text-top' | 'text-bottom' | 'super' | 'sub' | 'baseline';
export namespace VerticalAlignment {
	export const TOP: 'top' = 'top';
	export const MIDDLE: 'middle' = 'middle';
	export const BOTTOM: 'bottom' = 'bottom';
	export const STRETCH: 'stretch' = 'stretch';
	export const TEXTTOP: 'text-top' = 'text-top';
	export const TEXTBOTTOM: 'text-bottom' = 'text-bottom';
	export const SUPER: 'super' = 'super';
	export const SUB: 'sub' = 'sub';
	export const BASELINE: 'baseline' = 'baseline';
	export const isValid = makeValidator<VerticalAlignment>(TOP, MIDDLE, BOTTOM, STRETCH, TEXTTOP, TEXTBOTTOM, SUPER, SUB, BASELINE);
	export const parse = (value: string) => (value.toLowerCase() === 'center' ? MIDDLE : parseStrict(value));
	const parseStrict = makeParser<VerticalAlignment>(isValid);
}

export const verticalAlignmentProperty = new CssProperty<Style, VerticalAlignment>({
	name: 'verticalAlignment',
	cssName: 'vertical-align',
	defaultValue: VerticalAlignment.STRETCH,
	affectsLayout: global.isIOS,
	valueConverter: VerticalAlignment.parse,
});
verticalAlignmentProperty.register(Style);

interface Thickness {
	top: string;
	right: string;
	bottom: string;
	left: string;
}

function parseThickness(value: string): Thickness {
	if (typeof value === 'string') {
		let arr = value.split(/[ ,]+/);

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
	} else {
		return value;
	}
}

function convertToMargins(this: void, value: string | PercentLength): [CssProperty<any, any>, any][] {
	if (typeof value === 'string' && value !== 'auto') {
		let thickness = parseThickness(value);

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

function convertToPaddings(this: void, value: string | Length): [CssProperty<any, any>, any][] {
	if (typeof value === 'string' && value !== 'auto') {
		let thickness = parseThickness(value);

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

function parseDIPs(value: string): dip {
	if (value.indexOf('px') !== -1) {
		return layout.toDeviceIndependentPixels(parseFloat(value.replace('px', '').trim()));
	} else {
		return parseFloat(value.replace('dip', '').trim());
	}
}

export const translateXProperty = new CssAnimationProperty<Style, dip>({
	name: 'translateX',
	cssName: 'translateX',
	defaultValue: 0,
	valueConverter: parseDIPs,
});
translateXProperty.register(Style);

export const translateYProperty = new CssAnimationProperty<Style, dip>({
	name: 'translateY',
	cssName: 'translateY',
	defaultValue: 0,
	valueConverter: parseDIPs,
});
translateYProperty.register(Style);

const transformProperty = new ShorthandProperty<Style, string>({
	name: 'transform',
	cssName: 'transform',
	getter: function (this: Style) {
		let scaleX = this.scaleX;
		let scaleY = this.scaleY;
		let translateX = this.translateX;
		let translateY = this.translateY;
		let rotate = this.rotate;
		let rotateX = this.rotateX;
		let rotateY = this.rotateY;
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

const IDENTITY_TRANSFORMATION = {
	translate: { x: 0, y: 0 },
	rotate: { x: 0, y: 0, z: 0 },
	scale: { x: 1, y: 1 },
};

const TRANSFORM_SPLITTER = new RegExp(/\s*(.+?)\((.*?)\)/g);
const TRANSFORMATIONS = Object.freeze(['rotate', 'rotateX', 'rotateY', 'rotate3d', 'translate', 'translate3d', 'translateX', 'translateY', 'scale', 'scale3d', 'scaleX', 'scaleY']);

const STYLE_TRANSFORMATION_MAP = Object.freeze({
	scale: (value) => ({ property: 'scale', value }),
	scale3d: (value) => ({ property: 'scale', value }),
	scaleX: ({ x }) => ({
		property: 'scale',
		value: { x, y: IDENTITY_TRANSFORMATION.scale.y },
	}),
	scaleY: ({ y }) => ({
		property: 'scale',
		value: { y, x: IDENTITY_TRANSFORMATION.scale.x },
	}),

	translate: (value) => ({ property: 'translate', value }),
	translate3d: (value) => ({ property: 'translate', value }),
	translateX: ({ x }) => ({
		property: 'translate',
		value: { x, y: IDENTITY_TRANSFORMATION.translate.y },
	}),
	translateY: ({ y }) => ({
		property: 'translate',
		value: { y, x: IDENTITY_TRANSFORMATION.translate.x },
	}),

	rotate3d: (value) => ({ property: 'rotate', value }),
	rotateX: (x) => ({
		property: 'rotate',
		value: {
			x,
			y: IDENTITY_TRANSFORMATION.rotate.y,
			z: IDENTITY_TRANSFORMATION.rotate.z,
		},
	}),
	rotateY: (y) => ({
		property: 'rotate',
		value: {
			x: IDENTITY_TRANSFORMATION.rotate.x,
			y,
			z: IDENTITY_TRANSFORMATION.rotate.z,
		},
	}),
	rotate: (z) => ({
		property: 'rotate',
		value: {
			x: IDENTITY_TRANSFORMATION.rotate.x,
			y: IDENTITY_TRANSFORMATION.rotate.y,
			z,
		},
	}),
});

function convertToTransform(value: string): [CssProperty<any, any>, any][] {
	if (value === unsetValue) {
		value = 'none';
	}

	const { translate, rotate, scale } = transformConverter(value);

	return [
		[<any>translateXProperty, translate.x],
		[<any>translateYProperty, translate.y],

		[<any>scaleXProperty, scale.x],
		[<any>scaleYProperty, scale.y],

		[<any>rotateProperty, rotate.z],
		[<any>rotateXProperty, rotate.x],
		[<any>rotateYProperty, rotate.y],
	];
}

export function transformConverter(text: string): TransformFunctionsInfo {
	const transformations = parseTransformString(text);

	if (text === 'none' || text === '' || !transformations.length) {
		return IDENTITY_TRANSFORMATION;
	}

	const usedTransforms = transformations.map((t) => t.property);
	if (!hasDuplicates(usedTransforms)) {
		const fullTransformations = { ...IDENTITY_TRANSFORMATION };
		transformations.forEach((transform) => {
			fullTransformations[transform.property] = transform.value;
		});

		return fullTransformations;
	}

	const affineMatrix = transformations.map(getTransformMatrix).reduce(multiplyAffine2d);
	const cssMatrix = matrixArrayToCssMatrix(affineMatrix);

	return decompose2DTransformMatrix(cssMatrix);
}

// using general regex and manually checking the matched
// properties is faster than using more specific regex
// https://jsperf.com/cssparse
function parseTransformString(text: string): Transformation[] {
	let matches: Transformation[] = [];
	let match;

	while ((match = TRANSFORM_SPLITTER.exec(text)) !== null) {
		const property = match[1];
		const value = convertTransformValue(property, match[2]);

		if (TRANSFORMATIONS.indexOf(property) !== -1) {
			matches.push(normalizeTransformation({ property, value }));
		}
	}

	return matches;
}

function normalizeTransformation({ property, value }: Transformation): Transformation {
	return <any>STYLE_TRANSFORMATION_MAP[property](value);
}

function convertTransformValue(property: string, stringValue: string): TransformationValue {
	const [x, y = x, z = y] = stringValue.split(',').map(parseFloat);

	if (property === 'rotate' || property === 'rotateX' || property === 'rotateY') {
		return stringValue.slice(-3) === 'rad' ? radiansToDegrees(x) : x;
	}

	return { x, y, z };
}

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

// const pattern: RegExp = /url\(('|")(.*?)\1\)/;
export const backgroundImageProperty = new CssProperty<Style, string | LinearGradient>({
	name: 'backgroundImage',
	cssName: 'background-image',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withImage(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: (value1, value2) => {
		if (value1 instanceof LinearGradient && value2 instanceof LinearGradient) {
			return LinearGradient.equals(value1, value2);
		} else {
			return value1 === value2;
		}
	},
	valueConverter: (value: any) => {
		if (typeof value === 'string') {
			const parsed = parser.parseBackground(value);
			if (parsed) {
				const background = parsed.value;
				value = typeof background.image === 'object' ? LinearGradient.parse(background.image) : value;
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
		const background = target.backgroundInternal.withColor(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
backgroundColorProperty.register(Style);

export type BackgroundRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
export namespace BackgroundRepeat {
	export const REPEAT: 'repeat' = 'repeat';
	export const REPEAT_X: 'repeat-x' = 'repeat-x';
	export const REPEAT_Y: 'repeat-y' = 'repeat-y';
	export const NO_REPEAT: 'no-repeat' = 'no-repeat';
	export const isValid = makeValidator<BackgroundRepeat>(REPEAT, REPEAT_X, REPEAT_Y, NO_REPEAT);
	export const parse = makeParser<BackgroundRepeat>(isValid);
}

export const backgroundRepeatProperty = new CssProperty<Style, BackgroundRepeat>({
	name: 'backgroundRepeat',
	cssName: 'background-repeat',
	valueConverter: BackgroundRepeat.parse,
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withRepeat(newValue);
		target.backgroundInternal = background;
	},
});
backgroundRepeatProperty.register(Style);

export const backgroundSizeProperty = new CssProperty<Style, string>({
	name: 'backgroundSize',
	cssName: 'background-size',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withSize(newValue);
		target.backgroundInternal = background;
	},
});
backgroundSizeProperty.register(Style);

export const backgroundPositionProperty = new CssProperty<Style, string>({
	name: 'backgroundPosition',
	cssName: 'background-position',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withPosition(newValue);
		target.backgroundInternal = background;
	},
});
backgroundPositionProperty.register(Style);

function convertToBackgrounds(this: void, value: string): [CssProperty<any, any>, any][] {
	if (typeof value === 'string') {
		const backgrounds = parser.parseBackground(value).value;
		const backgroundColor = backgrounds.color ? new Color(backgrounds.color) : unsetValue;

		let backgroundImage: string | LinearGradient;
		if (typeof backgrounds.image === 'object' && backgrounds.image) {
			backgroundImage = LinearGradient.parse(backgrounds.image);
		} else {
			backgroundImage = backgrounds.image || unsetValue;
		}

		const backgroundRepeat = backgrounds.repeat || unsetValue;
		const backgroundPosition = backgrounds.position ? backgrounds.position.text : unsetValue;

		return [
			[<any>backgroundColorProperty, backgroundColor],
			[backgroundImageProperty, backgroundImage],
			[backgroundRepeatProperty, backgroundRepeat],
			[backgroundPositionProperty, backgroundPosition],
		];
	} else {
		return [
			[<any>backgroundColorProperty, unsetValue],
			[backgroundImageProperty, unsetValue],
			[backgroundRepeatProperty, unsetValue],
			[backgroundPositionProperty, unsetValue],
		];
	}
}

function parseBorderColor(value: string): { top: Color; right: Color; bottom: Color; left: Color } {
	let result: { top: Color; right: Color; bottom: Color; left: Color } = {
		top: undefined,
		right: undefined,
		bottom: undefined,
		left: undefined,
	};
	if (value.indexOf('rgb') === 0) {
		result.top = result.right = result.bottom = result.left = new Color(value);

		return result;
	}

	let arr = value.split(/[ ,]+/);
	if (arr.length === 1) {
		let arr0 = new Color(arr[0]);
		result.top = arr0;
		result.right = arr0;
		result.bottom = arr0;
		result.left = arr0;
	} else if (arr.length === 2) {
		let arr0 = new Color(arr[0]);
		let arr1 = new Color(arr[1]);
		result.top = arr0;
		result.right = arr1;
		result.bottom = arr0;
		result.left = arr1;
	} else if (arr.length === 3) {
		let arr0 = new Color(arr[0]);
		let arr1 = new Color(arr[1]);
		let arr2 = new Color(arr[2]);
		result.top = arr0;
		result.right = arr1;
		result.bottom = arr2;
		result.left = arr1;
	} else if (arr.length === 4) {
		let arr0 = new Color(arr[0]);
		let arr1 = new Color(arr[1]);
		let arr2 = new Color(arr[2]);
		let arr3 = new Color(arr[3]);
		result.top = arr0;
		result.right = arr1;
		result.bottom = arr2;
		result.left = arr3;
	} else {
		throw new Error(`Expected 1, 2, 3 or 4 parameters. Actual: ${value}`);
	}

	return result;
}

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
			let fourColors = parseBorderColor(value);

			return [
				[borderTopColorProperty, fourColors.top],
				[borderRightColorProperty, fourColors.right],
				[borderBottomColorProperty, fourColors.bottom],
				[borderLeftColorProperty, fourColors.left],
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
		const background = target.backgroundInternal.withBorderTopColor(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderTopColorProperty.register(Style);

export const borderRightColorProperty = new CssProperty<Style, Color>({
	name: 'borderRightColor',
	cssName: 'border-right-color',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withBorderRightColor(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderRightColorProperty.register(Style);

export const borderBottomColorProperty = new CssProperty<Style, Color>({
	name: 'borderBottomColor',
	cssName: 'border-bottom-color',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withBorderBottomColor(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderBottomColorProperty.register(Style);

export const borderLeftColorProperty = new CssProperty<Style, Color>({
	name: 'borderLeftColor',
	cssName: 'border-left-color',
	valueChanged: (target, oldValue, newValue) => {
		const background = target.backgroundInternal.withBorderLeftColor(newValue);
		target.backgroundInternal = background;
	},
	equalityComparer: Color.equals,
	valueConverter: (value) => new Color(value),
});
borderLeftColorProperty.register(Style);

// Border Width properties.
const borderWidthProperty = new ShorthandProperty<Style, string | Length>({
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
			let borderWidths = parseThickness(value);

			return [
				[borderTopWidthProperty, borderWidths.top],
				[borderRightWidthProperty, borderWidths.right],
				[borderBottomWidthProperty, borderWidths.bottom],
				[borderLeftWidthProperty, borderWidths.left],
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

export const borderTopWidthProperty = new CssProperty<Style, Length>({
	name: 'borderTopWidth',
	cssName: 'border-top-width',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderTopWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		const background = target.backgroundInternal.withBorderTopWidth(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderTopWidthProperty.register(Style);

export const borderRightWidthProperty = new CssProperty<Style, Length>({
	name: 'borderRightWidth',
	cssName: 'border-right-width',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-right-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderRightWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		const background = target.backgroundInternal.withBorderRightWidth(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderRightWidthProperty.register(Style);

export const borderBottomWidthProperty = new CssProperty<Style, Length>({
	name: 'borderBottomWidth',
	cssName: 'border-bottom-width',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderBottomWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		const background = target.backgroundInternal.withBorderBottomWidth(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderBottomWidthProperty.register(Style);

export const borderLeftWidthProperty = new CssProperty<Style, Length>({
	name: 'borderLeftWidth',
	cssName: 'border-left-width',
	defaultValue: zeroLength,
	affectsLayout: global.isIOS,
	equalityComparer: Length.equals,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-left-width should be Non-Negative Finite number. Value: ${value}`);
		}

		const view = target.viewRef.get();
		if (view) {
			view.effectiveBorderLeftWidth = value;
		} else {
			Trace.write(`${newValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
		}
		const background = target.backgroundInternal.withBorderLeftWidth(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderLeftWidthProperty.register(Style);

// Border Radius properties.
const borderRadiusProperty = new ShorthandProperty<Style, string | Length>({
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
			let borderRadius = parseThickness(value);

			return [
				[borderTopLeftRadiusProperty, borderRadius.top],
				[borderTopRightRadiusProperty, borderRadius.right],
				[borderBottomRightRadiusProperty, borderRadius.bottom],
				[borderBottomLeftRadiusProperty, borderRadius.left],
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

export const borderTopLeftRadiusProperty = new CssProperty<Style, Length>({
	name: 'borderTopLeftRadius',
	cssName: 'border-top-left-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-left-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		const background = target.backgroundInternal.withBorderTopLeftRadius(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderTopLeftRadiusProperty.register(Style);

export const borderTopRightRadiusProperty = new CssProperty<Style, Length>({
	name: 'borderTopRightRadius',
	cssName: 'border-top-right-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-top-right-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		const background = target.backgroundInternal.withBorderTopRightRadius(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderTopRightRadiusProperty.register(Style);

export const borderBottomRightRadiusProperty = new CssProperty<Style, Length>({
	name: 'borderBottomRightRadius',
	cssName: 'border-bottom-right-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-right-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		const background = target.backgroundInternal.withBorderBottomRightRadius(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderBottomRightRadiusProperty.register(Style);

export const borderBottomLeftRadiusProperty = new CssProperty<Style, Length>({
	name: 'borderBottomLeftRadius',
	cssName: 'border-bottom-left-radius',
	defaultValue: 0,
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		let value = Length.toDevicePixels(newValue, 0);
		if (!isNonNegativeFiniteNumber(value)) {
			throw new Error(`border-bottom-left-radius should be Non-Negative Finite number. Value: ${value}`);
		}
		const background = target.backgroundInternal.withBorderBottomLeftRadius(value);
		target.backgroundInternal = background;
	},
	valueConverter: Length.parse,
});
borderBottomLeftRadiusProperty.register(Style);

function isNonNegativeFiniteNumber(value: number): boolean {
	return isFinite(value) && !isNaN(value) && value >= 0;
}

let supportedPaths = ['rect', 'circle', 'ellipse', 'polygon', 'inset'];
function isClipPathValid(value: string): boolean {
	if (!value) {
		return true;
	}
	let functionName = value.substring(0, value.indexOf('(')).trim();

	return supportedPaths.indexOf(functionName) !== -1;
}

export const clipPathProperty = new CssProperty<Style, string>({
	name: 'clipPath',
	cssName: 'clip-path',
	valueChanged: (target, oldValue, newValue) => {
		if (!isClipPathValid(newValue)) {
			throw new Error('clip-path is not valid.');
		}

		const background = target.backgroundInternal.withClipPath(newValue);
		target.backgroundInternal = background;
	},
});
clipPathProperty.register(Style);

function isFloatValueConverter(value: string): number {
	let newValue = parseFloat(value);
	if (isNaN(newValue)) {
		throw new Error(`Invalid value: ${newValue}`);
	}

	return newValue;
}

export const zIndexProperty = new CssProperty<Style, number>({
	name: 'zIndex',
	cssName: 'z-index',
	valueConverter: isFloatValueConverter,
});
zIndexProperty.register(Style);

function opacityConverter(value: any): number {
	let newValue = parseFloat(value);
	if (!isNaN(newValue) && 0 <= newValue && newValue <= 1) {
		return newValue;
	}

	throw new Error(`Opacity should be between [0, 1]. Value: ${newValue}`);
}

export const opacityProperty = new CssAnimationProperty<Style, number>({
	name: 'opacity',
	cssName: 'opacity',
	defaultValue: 1,
	valueConverter: opacityConverter,
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
		let currentFont = target.fontInternal || Font.default;
		if (currentFont.fontFamily !== newValue) {
			const newFont = currentFont.withFontFamily(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
});
fontFamilyProperty.register(Style);

export const fontSizeProperty = new InheritedCssProperty<Style, number>({
	name: 'fontSize',
	cssName: 'font-size',
	affectsLayout: global.isIOS,
	valueChanged: (target, oldValue, newValue) => {
		if (target.viewRef['handleFontSize'] === true) {
			return;
		}
		let currentFont = target.fontInternal || Font.default;
		if (currentFont.fontSize !== newValue) {
			const newFont = currentFont.withFontSize(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
	valueConverter: (v) => parseFloat(v),
});
fontSizeProperty.register(Style);

export const fontStyleProperty = new InheritedCssProperty<Style, FontStyle>({
	name: 'fontStyle',
	cssName: 'font-style',
	affectsLayout: global.isIOS,
	defaultValue: FontStyle.NORMAL,
	valueConverter: FontStyle.parse,
	valueChanged: (target, oldValue, newValue) => {
		let currentFont = target.fontInternal || Font.default;
		if (currentFont.fontStyle !== newValue) {
			const newFont = currentFont.withFontStyle(newValue);
			target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
		}
	},
});
fontStyleProperty.register(Style);

export const fontWeightProperty = new InheritedCssProperty<Style, FontWeight>({
	name: 'fontWeight',
	cssName: 'font-weight',
	affectsLayout: global.isIOS,
	defaultValue: FontWeight.NORMAL,
	valueConverter: FontWeight.parse,
	valueChanged: (target, oldValue, newValue) => {
		let currentFont = target.fontInternal || Font.default;
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

export type Visibility = 'visible' | 'hidden' | 'collapse';
export namespace Visibility {
	export const VISIBLE: 'visible' = 'visible';
	export const HIDDEN: 'hidden' = 'hidden';
	export const COLLAPSE: 'collapse' = 'collapse';
	export const isValid = makeValidator<Visibility>(VISIBLE, HIDDEN, COLLAPSE);
	export const parse = (value: string) => (value.toLowerCase() === 'collapsed' ? COLLAPSE : parseStrict(value));
	const parseStrict = makeParser<Visibility>(isValid);
}

export const visibilityProperty = new CssProperty<Style, Visibility>({
	name: 'visibility',
	cssName: 'visibility',
	defaultValue: Visibility.VISIBLE,
	affectsLayout: global.isIOS,
	valueConverter: Visibility.parse,
	valueChanged: (target, oldValue, newValue) => {
		const view = target.viewRef.get();
		if (view) {
			view.isCollapsed = newValue === Visibility.COLLAPSE;
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
