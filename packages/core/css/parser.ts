export type Parsed<V> = { start: number; end: number; value: V };

// Values
export type ARGB = number;
export type URL = string;
export type Angle = number;
export interface Unit<T> {
	value: number;
	unit: string;
}
export type Length = Unit<'px' | 'dip'>;
export type Percentage = Unit<'%'>;
export type LengthPercentage = Length | Percentage;
export type Keyword = string;
export interface ColorStop {
	argb: ARGB;
	offset?: LengthPercentage;
}
export interface LinearGradient {
	angle: number;
	colors: ColorStop[];
}
export interface Background {
	readonly color?: number;
	readonly image?: URL | LinearGradient;
	readonly repeat?: BackgroundRepeat;
	readonly position?: BackgroundPosition;
	readonly size?: BackgroundSize;
}
export type BackgroundRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
export type BackgroundSize =
	| 'auto'
	| 'cover'
	| 'contain'
	| {
			x: LengthPercentage;
			y: 'auto' | LengthPercentage;
	  };
export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'center' | 'bottom';
export interface HorizontalAlignWithOffset {
	readonly align: 'left' | 'right';
	readonly offset: LengthPercentage;
}
export interface VerticalAlignWithOffset {
	readonly align: 'top' | 'bottom';
	readonly offset: LengthPercentage;
}
export interface BackgroundPosition {
	readonly x: HorizontalAlign | HorizontalAlignWithOffset;
	readonly y: VerticalAlign | VerticalAlignWithOffset;
	text?: string;
}

const urlRegEx = /\s*url\((?:('|")([^\1]*)\1|([^\)]*))\)\s*/gy;
export function parseURL(text: string, start: number = 0): Parsed<URL> {
	urlRegEx.lastIndex = start;
	const result = urlRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = urlRegEx.lastIndex;
	const value: URL = result[2] || result[3];

	return { start, end, value };
}

const hexColorRegEx = /\s*#((?:[0-9A-F]{8})|(?:[0-9A-F]{6})|(?:[0-9A-F]{3}))\s*/giy;
export function parseHexColor(text: string, start: number = 0): Parsed<ARGB> {
	hexColorRegEx.lastIndex = start;
	const result = hexColorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = hexColorRegEx.lastIndex;
	let hex = result[1];
	let argb;
	if (hex.length === 8) {
		argb = parseInt('0x' + hex);
	} else if (hex.length === 6) {
		argb = parseInt('0xFF' + hex);
	} else if (hex.length === 3) {
		argb = parseInt('0xFF' + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]);
	}

	return { start, end, value: argb };
}

function rgbaToArgbNumber(r: number, g: number, b: number, a: number = 1): number | undefined {
	if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
		return Math.round(a * 0xff) * 0x01000000 + r * 0x010000 + g * 0x000100 + b;
	} else {
		return null;
	}
}

const rgbColorRegEx = /\s*(rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\))/gy;
export function parseRGBColor(text: string, start: number = 0): Parsed<ARGB> {
	rgbColorRegEx.lastIndex = start;
	const result = rgbColorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = rgbColorRegEx.lastIndex;
	const value = result[1] && rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]));

	return { start, end, value };
}

const rgbaColorRegEx = /\s*(rgba\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*,\s*([01]?\.?\d*)\s*\))/gy;
export function parseRGBAColor(text: string, start: number = 0): Parsed<ARGB> {
	rgbaColorRegEx.lastIndex = start;
	const result = rgbaColorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = rgbaColorRegEx.lastIndex;
	const value = rgbaToArgbNumber(parseInt(result[2]), parseInt(result[3]), parseInt(result[4]), parseFloat(result[5]));

	return { start, end, value };
}

export function convertHSLToRGBColor(hue: number, saturation: number, lightness: number): { r: number; g: number; b: number } {
	// Per formula it will be easier if hue is divided to 60° and saturation to 100 beforehand
	// https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB
	hue /= 60;
	lightness /= 100;

	let chroma = ((1 - Math.abs(2 * lightness - 1)) * saturation) / 100,
		X = chroma * (1 - Math.abs((hue % 2) - 1)),
		// Add lightness match to all RGB components beforehand
		{ m: r, m: g, m: b } = { m: lightness - chroma / 2 };

	if (0 <= hue && hue < 1) {
		r += chroma;
		g += X;
	} else if (hue < 2) {
		r += X;
		g += chroma;
	} else if (hue < 3) {
		g += chroma;
		b += X;
	} else if (hue < 4) {
		g += X;
		b += chroma;
	} else if (hue < 5) {
		r += X;
		b += chroma;
	} else if (hue < 6) {
		r += chroma;
		b += X;
	}

	return {
		r: Math.round(r * 0xff),
		g: Math.round(g * 0xff),
		b: Math.round(b * 0xff),
	};
}

function hslaToArgbNumber(h: number, s: number, l: number, a: number = 1): number | undefined {
	let { r, g, b } = convertHSLToRGBColor(h, s, l);

	if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
		return Math.round(a * 0xff) * 0x01000000 + r * 0x010000 + g * 0x000100 + b;
	} else {
		return null;
	}
}

const hslColorRegEx = /\s*(hsl\(\s*([\d.]*)\s*,\s*([\d.]*)%\s*,\s*([\d.]*)%\s*\))/gy;
export function parseHSLColor(text: string, start: number = 0): Parsed<ARGB> {
	hslColorRegEx.lastIndex = start;
	const result = hslColorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = hslColorRegEx.lastIndex;
	const value = result[1] && hslaToArgbNumber(parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));

	return { start, end, value };
}

const hslaColorRegEx = /\s*(hsla\(\s*([\d.]*)\s*,\s*([\d.]*)%\s*,\s*([\d.]*)%\s*,\s*([01]?\.?\d*)\s*\))/gy;
export function parseHSLAColor(text: string, start: number = 0): Parsed<ARGB> {
	hslaColorRegEx.lastIndex = start;
	const result = hslaColorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = hslaColorRegEx.lastIndex;
	const value = hslaToArgbNumber(parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]), parseFloat(result[5]));

	return { start, end, value };
}

export enum colors {
	transparent = 0x00000000,
	aliceblue = 0xfff0f8ff,
	antiquewhite = 0xfffaebd7,
	aqua = 0xff00ffff,
	aquamarine = 0xff7fffd4,
	azure = 0xfff0ffff,
	beige = 0xfff5f5dc,
	bisque = 0xffffe4c4,
	black = 0xff000000,
	blanchedalmond = 0xffffebcd,
	blue = 0xff0000ff,
	blueviolet = 0xff8a2be2,
	brown = 0xffa52a2a,
	burlywood = 0xffdeb887,
	cadetblue = 0xff5f9ea0,
	chartreuse = 0xff7fff00,
	chocolate = 0xffd2691e,
	coral = 0xffff7f50,
	cornflowerblue = 0xff6495ed,
	cornsilk = 0xfffff8dc,
	crimson = 0xffdc143c,
	cyan = 0xff00ffff,
	darkblue = 0xff00008b,
	darkcyan = 0xff008b8b,
	darkgoldenrod = 0xffb8860b,
	darkgray = 0xffa9a9a9,
	darkgreen = 0xff006400,
	darkgrey = 0xffa9a9a9,
	darkkhaki = 0xffbdb76b,
	darkmagenta = 0xff8b008b,
	darkolivegreen = 0xff556b2f,
	darkorange = 0xffff8c00,
	darkorchid = 0xff9932cc,
	darkred = 0xff8b0000,
	darksalmon = 0xffe9967a,
	darkseagreen = 0xff8fbc8f,
	darkslateblue = 0xff483d8b,
	darkslategray = 0xff2f4f4f,
	darkslategrey = 0xff2f4f4f,
	darkturquoise = 0xff00ced1,
	darkviolet = 0xff9400d3,
	deeppink = 0xffff1493,
	deepskyblue = 0xff00bfff,
	dimgray = 0xff696969,
	dimgrey = 0xff696969,
	dodgerblue = 0xff1e90ff,
	firebrick = 0xffb22222,
	floralwhite = 0xfffffaf0,
	forestgreen = 0xff228b22,
	fuchsia = 0xffff00ff,
	gainsboro = 0xffdcdcdc,
	ghostwhite = 0xfff8f8ff,
	gold = 0xffffd700,
	goldenrod = 0xffdaa520,
	gray = 0xff808080,
	green = 0xff008000,
	greenyellow = 0xffadff2f,
	grey = 0xff808080,
	honeydew = 0xfff0fff0,
	hotpink = 0xffff69b4,
	indianred = 0xffcd5c5c,
	indigo = 0xff4b0082,
	ivory = 0xfffffff0,
	khaki = 0xfff0e68c,
	lavender = 0xffe6e6fa,
	lavenderblush = 0xfffff0f5,
	lawngreen = 0xff7cfc00,
	lemonchiffon = 0xfffffacd,
	lightblue = 0xffadd8e6,
	lightcoral = 0xfff08080,
	lightcyan = 0xffe0ffff,
	lightgoldenrodyellow = 0xfffafad2,
	lightgray = 0xffd3d3d3,
	lightgreen = 0xff90ee90,
	lightgrey = 0xffd3d3d3,
	lightpink = 0xffffb6c1,
	lightsalmon = 0xffffa07a,
	lightseagreen = 0xff20b2aa,
	lightskyblue = 0xff87cefa,
	lightslategray = 0xff778899,
	lightslategrey = 0xff778899,
	lightsteelblue = 0xffb0c4de,
	lightyellow = 0xffffffe0,
	lime = 0xff00ff00,
	limegreen = 0xff32cd32,
	linen = 0xfffaf0e6,
	magenta = 0xffff00ff,
	maroon = 0xff800000,
	mediumaquamarine = 0xff66cdaa,
	mediumblue = 0xff0000cd,
	mediumorchid = 0xffba55d3,
	mediumpurple = 0xff9370db,
	mediumseagreen = 0xff3cb371,
	mediumslateblue = 0xff7b68ee,
	mediumspringgreen = 0xff00fa9a,
	mediumturquoise = 0xff48d1cc,
	mediumvioletred = 0xffc71585,
	midnightblue = 0xff191970,
	mintcream = 0xfff5fffa,
	mistyrose = 0xffffe4e1,
	moccasin = 0xffffe4b5,
	navajowhite = 0xffffdead,
	navy = 0xff000080,
	oldlace = 0xfffdf5e6,
	olive = 0xff808000,
	olivedrab = 0xff6b8e23,
	orange = 0xffffa500,
	orangered = 0xffff4500,
	orchid = 0xffda70d6,
	palegoldenrod = 0xffeee8aa,
	palegreen = 0xff98fb98,
	paleturquoise = 0xffafeeee,
	palevioletred = 0xffdb7093,
	papayawhip = 0xffffefd5,
	peachpuff = 0xffffdab9,
	peru = 0xffcd853f,
	pink = 0xffffc0cb,
	plum = 0xffdda0dd,
	powderblue = 0xffb0e0e6,
	purple = 0xff800080,
	rebeccapurple = 0xff663399,
	red = 0xffff0000,
	rosybrown = 0xffbc8f8f,
	royalblue = 0xff4169e1,
	saddlebrown = 0xff8b4513,
	salmon = 0xfffa8072,
	sandybrown = 0xfff4a460,
	seagreen = 0xff2e8b57,
	seashell = 0xfffff5ee,
	sienna = 0xffa0522d,
	silver = 0xffc0c0c0,
	skyblue = 0xff87ceeb,
	slateblue = 0xff6a5acd,
	slategray = 0xff708090,
	slategrey = 0xff708090,
	snow = 0xfffffafa,
	springgreen = 0xff00ff7f,
	steelblue = 0xff4682b4,
	tan = 0xffd2b48c,
	teal = 0xff008080,
	thistle = 0xffd8bfd8,
	tomato = 0xffff6347,
	turquoise = 0xff40e0d0,
	violet = 0xffee82ee,
	wheat = 0xfff5deb3,
	white = 0xffffffff,
	whitesmoke = 0xfff5f5f5,
	yellow = 0xffffff00,
	yellowgreen = 0xff9acd32,
}

export function parseColorKeyword(value, start: number, keyword = parseKeyword(value, start)): Parsed<ARGB> {
	if (keyword && keyword.value in colors) {
		const end = keyword.end;
		const value = colors[keyword.value];

		return { start, end, value };
	}

	return null;
}

export function parseColor(value: string, start: number = 0, keyword = parseKeyword(value, start)): Parsed<ARGB> {
	return parseHexColor(value, start) || parseColorKeyword(value, start, keyword) || parseRGBColor(value, start) || parseRGBAColor(value, start) || parseHSLColor(value, start) || parseHSLAColor(value, start);
}

const keywordRegEx = /\s*([a-z][\w\-]*)\s*/giy;
function parseKeyword(text: string, start: number = 0): Parsed<Keyword> {
	keywordRegEx.lastIndex = start;
	const result = keywordRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = keywordRegEx.lastIndex;
	const value = result[1];

	return { start, end, value };
}

const backgroundRepeatKeywords = new Set(['repeat', 'repeat-x', 'repeat-y', 'no-repeat']);
export function parseRepeat(value: string, start: number = 0, keyword = parseKeyword(value, start)): Parsed<BackgroundRepeat> {
	if (keyword && backgroundRepeatKeywords.has(keyword.value)) {
		const end = keyword.end;
		const value = <BackgroundRepeat>keyword.value;

		return { start, end, value };
	}

	return null;
}

const unitRegEx = /\s*([\+\-]?(?:\d+\.\d+|\d+|\.\d+)(?:[eE][\+\-]?\d+)?)([a-zA-Z]+|%)?\s*/gy;
export function parseUnit(text: string, start: number = 0): Parsed<Unit<string>> {
	unitRegEx.lastIndex = start;
	const result = unitRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = unitRegEx.lastIndex;
	const value = parseFloat(result[1]);
	const unit = <any>result[2] || 'dip';

	return { start, end, value: { value, unit } };
}

export function parsePercentageOrLength(text: string, start: number = 0): Parsed<LengthPercentage> {
	const unitResult = parseUnit(text, start);
	if (unitResult) {
		const { start, end } = unitResult;
		const value = <LengthPercentage>unitResult.value;
		if (value.unit === '%') {
			value.value /= 100;
		} else if (!value.unit) {
			value.unit = 'dip';
		} else if (value.unit === 'px' || value.unit === 'dip') {
			// same
		} else {
			return null;
		}

		return { start, end, value };
	}

	return null;
}

const angleUnitsToRadMap: {
	[unit: string]: (start: number, end: number, value: number) => Parsed<Angle>;
} = {
	deg: (start: number, end: number, deg: number) => ({
		start,
		end,
		value: (deg / 180) * Math.PI,
	}),
	rad: (start: number, end: number, rad: number) => ({
		start,
		end,
		value: rad,
	}),
	grad: (start: number, end: number, grad: number) => ({
		start,
		end,
		value: (grad / 200) * Math.PI,
	}),
	turn: (start: number, end: number, turn: number) => ({
		start,
		end,
		value: turn * Math.PI * 2,
	}),
};
export function parseAngle(value: string, start: number = 0): Parsed<Angle> {
	const angleResult = parseUnit(value, start);
	if (angleResult) {
		const { start, end, value } = angleResult;

		return (angleUnitsToRadMap[value.unit] || ((_, __, ___) => null))(start, end, value.value);
	}

	return null;
}

const backgroundSizeKeywords = new Set(['auto', 'contain', 'cover']);
export function parseBackgroundSize(value: string, start: number = 0, keyword = parseKeyword(value, start)): Parsed<BackgroundSize> {
	let end = start;
	if (keyword && backgroundSizeKeywords.has(keyword.value)) {
		end = keyword.end;
		const value = <'auto' | 'cover' | 'contain'>keyword.value;

		return { start, end, value };
	}

	// Parse one or two lengths... the other will be "auto"
	const firstLength = parsePercentageOrLength(value, end);
	if (firstLength) {
		end = firstLength.end;
		const secondLength = parsePercentageOrLength(value, firstLength.end);
		if (secondLength) {
			end = secondLength.end;

			return {
				start,
				end,
				value: { x: firstLength.value, y: secondLength.value },
			};
		} else {
			return { start, end, value: { x: firstLength.value, y: 'auto' } };
		}
	}

	return null;
}

const backgroundPositionKeywords = Object.freeze(new Set(['left', 'right', 'top', 'bottom', 'center']));
const backgroundPositionKeywordsDirection: {
	[align: string]: 'x' | 'center' | 'y';
} = {
	left: 'x',
	right: 'x',
	center: 'center',
	top: 'y',
	bottom: 'y',
};
export function parseBackgroundPosition(text: string, start: number = 0, keyword = parseKeyword(text, start)): Parsed<BackgroundPosition> {
	function formatH(align: Parsed<HorizontalAlign>, offset: Parsed<LengthPercentage>) {
		if (align.value === 'center') {
			return 'center';
		}
		if (offset && offset.value.value !== 0) {
			return { align: align.value, offset: offset.value };
		}

		return align.value;
	}
	function formatV(align: Parsed<VerticalAlign>, offset: Parsed<LengthPercentage>) {
		if (align.value === 'center') {
			return 'center';
		}
		if (offset && offset.value.value !== 0) {
			return { align: align.value, offset: offset.value };
		}

		return align.value;
	}
	let end = start;
	if (keyword && backgroundPositionKeywords.has(keyword.value)) {
		end = keyword.end;
		let firstDirection = backgroundPositionKeywordsDirection[keyword.value];

		const firstLength = firstDirection !== 'center' && parsePercentageOrLength(text, end);
		if (firstLength) {
			end = firstLength.end;
		}

		const secondKeyword = parseKeyword(text, end);
		if (secondKeyword && backgroundPositionKeywords.has(secondKeyword.value)) {
			end = secondKeyword.end;
			let secondDirection = backgroundPositionKeywordsDirection[secondKeyword.end];

			if (firstDirection === secondDirection && firstDirection !== 'center') {
				return null; // Reject pair of both horizontal or both vertical alignments.
			}

			const secondLength = secondDirection !== 'center' && parsePercentageOrLength(text, end);
			if (secondLength) {
				end = secondLength.end;
			}

			if ((firstDirection === secondDirection && secondDirection === 'center') || firstDirection === 'x' || secondDirection === 'y') {
				return {
					start,
					end,
					value: {
						x: formatH(<Parsed<HorizontalAlign>>keyword, firstLength),
						y: formatV(<Parsed<VerticalAlign>>secondKeyword, secondLength),
					},
				};
			} else {
				return {
					start,
					end,
					value: {
						x: formatH(<Parsed<HorizontalAlign>>secondKeyword, secondLength),
						y: formatV(<Parsed<VerticalAlign>>keyword, firstLength),
					},
				};
			}
		} else {
			if (firstDirection === 'center') {
				return { start, end, value: { x: 'center', y: 'center' } };
			} else if (firstDirection === 'x') {
				return {
					start,
					end,
					value: {
						x: formatH(<Parsed<HorizontalAlign>>keyword, firstLength),
						y: 'center',
					},
				};
			} else {
				return {
					start,
					end,
					value: {
						x: 'center',
						y: formatV(<Parsed<VerticalAlign>>keyword, firstLength),
					},
				};
			}
		}
	} else {
		const firstLength = parsePercentageOrLength(text, end);
		if (firstLength) {
			end = firstLength.end;
			const secondLength = parsePercentageOrLength(text, end);
			if (secondLength) {
				end = secondLength.end;

				return {
					start,
					end,
					value: {
						x: { align: 'left', offset: firstLength.value },
						y: { align: 'top', offset: secondLength.value },
					},
				};
			} else {
				return {
					start,
					end,
					value: {
						x: { align: 'left', offset: firstLength.value },
						y: 'center',
					},
				};
			}
		} else {
			return null;
		}
	}
}

const directionRegEx = /\s*to\s*(left|right|top|bottom)\s*(left|right|top|bottom)?\s*/gy;
const sideDirections = {
	top: (Math.PI * 0) / 2,
	right: (Math.PI * 1) / 2,
	bottom: (Math.PI * 2) / 2,
	left: (Math.PI * 3) / 2,
};
const cornerDirections = {
	top: {
		right: (Math.PI * 1) / 4,
		left: (Math.PI * 7) / 4,
	},
	right: {
		top: (Math.PI * 1) / 4,
		bottom: (Math.PI * 3) / 4,
	},
	bottom: {
		right: (Math.PI * 3) / 4,
		left: (Math.PI * 5) / 4,
	},
	left: {
		top: (Math.PI * 7) / 4,
		bottom: (Math.PI * 5) / 4,
	},
};
function parseDirection(text: string, start: number = 0): Parsed<Angle> {
	directionRegEx.lastIndex = start;
	const result = directionRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = directionRegEx.lastIndex;
	const firstDirection = result[1];
	if (result[2]) {
		const secondDirection = result[2];
		const value = cornerDirections[firstDirection][secondDirection];

		return value === undefined ? null : { start, end, value };
	} else {
		return { start, end, value: sideDirections[firstDirection] };
	}
}

const openingBracketRegEx = /\s*\(\s*/gy;
const closingBracketRegEx = /\s*\)\s*/gy;
const closingBracketOrCommaRegEx = /\s*(\)|,)\s*/gy;
function parseArgumentsList<T>(text: string, start: number, argument: (value: string, lastIndex: number, index: number) => Parsed<T>): Parsed<Parsed<T>[]> {
	openingBracketRegEx.lastIndex = start;
	const openingBracket = openingBracketRegEx.exec(text);
	if (!openingBracket) {
		return null;
	}
	let end = openingBracketRegEx.lastIndex;
	const value: Parsed<T>[] = [];

	closingBracketRegEx.lastIndex = end;
	const closingBracket = closingBracketRegEx.exec(text);
	if (closingBracket) {
		return { start, end, value };
	}

	for (let index = 0; true; index++) {
		const arg = argument(text, end, index);
		if (!arg) {
			return null;
		}
		end = arg.end;
		value.push(arg);

		closingBracketOrCommaRegEx.lastIndex = end;
		const closingBracketOrComma = closingBracketOrCommaRegEx.exec(text);
		if (closingBracketOrComma) {
			end = closingBracketOrCommaRegEx.lastIndex;
			if (closingBracketOrComma[1] === ',') {
				continue;
			} else if (closingBracketOrComma[1] === ')') {
				return { start, end, value };
			}
		} else {
			return null;
		}
	}
}

export function parseColorStop(text: string, start: number = 0): Parsed<ColorStop> {
	const color = parseColor(text, start);
	if (!color) {
		return null;
	}
	let end = color.end;
	const offset = parsePercentageOrLength(text, end);
	if (offset) {
		end = offset.end;

		return {
			start,
			end,
			value: { argb: color.value, offset: offset.value },
		};
	}

	return { start, end, value: { argb: color.value } };
}

const linearGradientStartRegEx = /\s*linear-gradient\s*/gy;
export function parseLinearGradient(text: string, start: number = 0): Parsed<LinearGradient> {
	linearGradientStartRegEx.lastIndex = start;
	const lgs = linearGradientStartRegEx.exec(text);
	if (!lgs) {
		return null;
	}
	let end = linearGradientStartRegEx.lastIndex;

	let angle = Math.PI;
	const colors: ColorStop[] = [];

	const parsedArgs = parseArgumentsList<Angle | ColorStop>(text, end, (text, start, index) => {
		if (index === 0) {
			// First arg can be gradient direction
			const angleArg = parseAngle(text, start) || parseDirection(text, start);
			if (angleArg) {
				angle = angleArg.value;

				return angleArg;
			}
		}

		const colorStop = parseColorStop(text, start);
		if (colorStop) {
			colors.push(colorStop.value);

			return colorStop;
		}

		return null;
	});
	if (!parsedArgs) {
		return null;
	}
	end = parsedArgs.end;

	return { start, end, value: { angle, colors } };
}

const slashRegEx = /\s*(\/)\s*/gy;
function parseSlash(text: string, start: number): Parsed<'/'> {
	slashRegEx.lastIndex = start;
	const slash = slashRegEx.exec(text);
	if (!slash) {
		return null;
	}
	const end = slashRegEx.lastIndex;

	return { start, end, value: '/' };
}

export function parseBackground(text: string, start: number = 0): Parsed<Background> {
	const value: any = {};
	let end = start;
	while (end < text.length) {
		const keyword = parseKeyword(text, end);
		const color = parseColor(text, end, keyword);
		if (color) {
			value.color = color.value;
			end = color.end;
			continue;
		}
		const repeat = parseRepeat(text, end, keyword);
		if (repeat) {
			value.repeat = repeat.value;
			end = repeat.end;
			continue;
		}
		const position = parseBackgroundPosition(text, end, keyword);
		if (position) {
			position.value.text = text.substring(position.start, position.end);
			value.position = position.value;
			end = position.end;

			const slash = parseSlash(text, end);
			if (slash) {
				end = slash.end;
				const size = parseBackgroundSize(text, end);
				if (!size) {
					// Found / but no proper size following
					return null;
				}
				value.size = size.value;
				end = size.end;
			}
			continue;
		}

		const url = parseURL(text, end);
		if (url) {
			value.image = url.value;
			end = url.end;
			continue;
		}
		const gradient = parseLinearGradient(text, end);
		if (gradient) {
			value.image = gradient.value;
			end = gradient.end;
			continue;
		}

		return null;
	}

	return { start, end, value };
}

// Selectors

export type Combinator = '+' | '~' | '>' | ' ';

export interface UniversalSelector {
	type: '*';
}
export interface TypeSelector {
	type: '';
	identifier: string;
}
export interface ClassSelector {
	type: '.';
	identifier: string;
}
export interface IdSelector {
	type: '#';
	identifier: string;
}
export interface PseudoClassSelector {
	type: ':';
	identifier: string;
}
export type AttributeSelectorTest = '=' | '^=' | '$=' | '*=' | '=' | '~=' | '|=';
export interface AttributeSelector {
	type: '[]';
	property: string;
	test?: AttributeSelectorTest;
	value?: string;
}

export type SimpleSelector = UniversalSelector | TypeSelector | ClassSelector | IdSelector | PseudoClassSelector | AttributeSelector;
export type SimpleSelectorSequence = SimpleSelector[];
export type SelectorCombinatorPair = [SimpleSelectorSequence, Combinator];
export type Selector = SelectorCombinatorPair[];

const universalSelectorRegEx = /\*/gy;
export function parseUniversalSelector(text: string, start: number = 0): Parsed<UniversalSelector> {
	universalSelectorRegEx.lastIndex = start;
	const result = universalSelectorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = universalSelectorRegEx.lastIndex;

	return { start, end, value: { type: '*' } };
}

const simpleIdentifierSelectorRegEx = /(#|\.|:|\b)((?:[\w_-]|\\.)(?:[\w\d_-]|\\.)*)/guy;
const unicodeEscapeRegEx = /\\([0-9a-fA-F]{1,5}\s|[0-9a-fA-F]{6})/g;
export function parseSimpleIdentifierSelector(text: string, start: number = 0): Parsed<TypeSelector | ClassSelector | IdSelector | PseudoClassSelector> {
	simpleIdentifierSelectorRegEx.lastIndex = start;
	const result = simpleIdentifierSelectorRegEx.exec(text.replace(unicodeEscapeRegEx, (_, c) => '\\' + String.fromCodePoint(parseInt(c.trim(), 16))));
	if (!result) {
		return null;
	}
	const end = simpleIdentifierSelectorRegEx.lastIndex;
	const type = <'#' | '.' | ':' | ''>result[1];
	const identifier: string = result[2].replace(/\\/g, '');
	const value = <TypeSelector | ClassSelector | IdSelector | PseudoClassSelector>{ type, identifier };

	return { start, end, value };
}

const attributeSelectorRegEx = /\[\s*([_-\w][_-\w\d]*)\s*(?:(=|\^=|\$=|\*=|\~=|\|=)\s*(?:([_-\w][_-\w\d]*)|"((?:[^\\"]|\\(?:"|n|r|f|\\|0-9a-f))*)"|'((?:[^\\']|\\(?:'|n|r|f|\\|0-9a-f))*)')\s*)?\]/gy;
export function parseAttributeSelector(text: string, start: number): Parsed<AttributeSelector> {
	attributeSelectorRegEx.lastIndex = start;
	const result = attributeSelectorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = attributeSelectorRegEx.lastIndex;
	const property = result[1];
	if (result[2]) {
		const test = <AttributeSelectorTest>result[2];
		const value = result[3] || result[4] || result[5];

		return { start, end, value: { type: '[]', property, test, value } };
	}

	return { start, end, value: { type: '[]', property } };
}

export function parseSimpleSelector(text: string, start: number = 0): Parsed<SimpleSelector> {
	return parseUniversalSelector(text, start) || parseSimpleIdentifierSelector(text, start) || parseAttributeSelector(text, start);
}

export function parseSimpleSelectorSequence(text: string, start: number): Parsed<SimpleSelector[]> {
	let simpleSelector = parseSimpleSelector(text, start);
	if (!simpleSelector) {
		return null;
	}
	let end = simpleSelector.end;
	let value = <SimpleSelectorSequence>[];
	while (simpleSelector) {
		value.push(simpleSelector.value);
		end = simpleSelector.end;
		simpleSelector = parseSimpleSelector(text, end);
	}

	return { start, end, value };
}

const combinatorRegEx = /\s*(\+|~|>)?\s*/gy;
export function parseCombinator(text: string, start: number = 0): Parsed<Combinator> {
	combinatorRegEx.lastIndex = start;
	const result = combinatorRegEx.exec(text);
	if (!result) {
		return null;
	}
	const end = combinatorRegEx.lastIndex;
	const value = <Combinator>result[1] || ' ';

	return { start, end, value };
}

const whiteSpaceRegEx = /\s*/gy;
export function parseSelector(text: string, start: number = 0): Parsed<Selector> {
	let end = start;
	whiteSpaceRegEx.lastIndex = end;
	const leadingWhiteSpace = whiteSpaceRegEx.exec(text);
	if (leadingWhiteSpace) {
		end = whiteSpaceRegEx.lastIndex;
	}
	let value = <Selector>[];
	let combinator: Parsed<Combinator>;
	let expectSimpleSelector = true; // Must have at least one
	let pair: SelectorCombinatorPair;
	do {
		const simpleSelectorSequence = parseSimpleSelectorSequence(text, end);
		if (!simpleSelectorSequence) {
			if (expectSimpleSelector) {
				return null;
			} else {
				break;
			}
		}
		end = simpleSelectorSequence.end;
		if (combinator) {
			pair[1] = combinator.value;
		}
		pair = [simpleSelectorSequence.value, undefined];
		value.push(pair);

		combinator = parseCombinator(text, end);
		if (combinator) {
			end = combinator.end;
		}
		expectSimpleSelector = combinator && combinator.value !== ' '; // Simple selector must follow non trailing white space combinator
	} while (combinator);

	return { start, end, value };
}

export interface Stylesheet {
	rules: Rule[];
}
export type Rule = QualifiedRule | AtRule;

export interface AtRule {
	type: 'at-rule';
	name: string;
	prelude: InputToken[];
	block: SimpleBlock;
}
export interface QualifiedRule {
	type: 'qualified-rule';
	prelude: InputToken[];
	block: SimpleBlock;
}

const whitespaceRegEx = /[\s\t\n\r\f]*/gmy;

const singleQuoteStringRegEx = /'((?:[^\n\r\f\']|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)(:?'|$)/gmy; // Besides $n, parse escape
const doubleQuoteStringRegEx = /"((?:[^\n\r\f\"]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)(:?"|$)/gmy; // Besides $n, parse escape

const commentRegEx = /(\/\*(?:[^\*]|\*[^\/])*\*\/)/gmy;
const numberRegEx = /[\+\-]?(?:\d+\.\d+|\d+|\.\d+)(?:[eE][\+\-]?\d+)?/gmy;
const nameRegEx = /-?(?:(?:[a-zA-Z_]|[^\x00-\x7F]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))(?:[a-zA-Z_0-9\-]*|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*)/gmy;
// const nonQuoteURLRegEx = /(:?[^\)\s\t\n\r\f\'\"\(]|\\(?:\$|\n|[0-9a-fA-F]{1,6}\s?))*/gym; // TODO: non-printable code points omitted

type InputToken = '(' | ')' | '{' | '}' | '[' | ']' | ':' | ';' | ',' | ' ' | '^=' | '|=' | '$=' | '*=' | '~=' | '<!--' | '-->' | undefined | /* <EOF-token> */ InputTokenObject | FunctionInputToken | FunctionToken | SimpleBlock | AtKeywordToken;

export const enum TokenObjectType {
	/**
	 * <string-token>
	 */
	string = 1,
	/**
	 * <delim-token>
	 */
	delim = 2,
	/**
	 * <number-token>
	 */
	number = 3,
	/**
	 * <percentage-token>
	 */
	percentage = 4,
	/**
	 * <dimension-token>
	 */
	dimension = 5,
	/**
	 * <ident-token>
	 */
	ident = 6,
	/**
	 * <url-token>
	 */
	url = 7,
	/**
	 * <function-token>
	 * This is a token indicating a function's leading: <ident-token>(
	 */
	functionToken = 8,
	/**
	 * <simple-block>
	 */
	simpleBlock = 9,
	/**
	 * <comment-token>
	 */
	comment = 10,
	/**
	 * <at-keyword-token>
	 */
	atKeyword = 11,
	/**
	 * <hash-token>
	 */
	hash = 12,
	/**
	 * <function>
	 * This is a complete consumed function: <function-token>([<component-value> [, <component-value>]*])")"
	 */
	function = 14,
}

interface InputTokenObject {
	type: TokenObjectType;
	text: string;
}

/**
 * This is a "<ident>(" token.
 */
interface FunctionInputToken extends InputTokenObject {
	name: string;
}

/**
 * This is a completely parsed function like "<ident>([component [, component]*])".
 */
interface FunctionToken extends FunctionInputToken {
	components: any[];
}

interface SimpleBlock extends InputTokenObject {
	associatedToken: InputToken;
	values: InputToken[];
}

interface AtKeywordToken extends InputTokenObject {}

/**
 * CSS parser following relatively close:
 * CSS Syntax Module Level 3
 * https://www.w3.org/TR/css-syntax-3/
 */
export class CSS3Parser {
	private nextInputCodePointIndex = 0;
	private reconsumedInputToken: InputToken;
	private topLevelFlag: boolean;

	constructor(private text: string) {}

	/**
	 * For testing purposes.
	 * This method allows us to run and assert the proper working of the tokenizer.
	 */
	tokenize(): InputToken[] {
		let tokens: InputToken[] = [];
		let inputToken: InputToken;
		do {
			inputToken = this.consumeAToken();
			tokens.push(inputToken);
		} while (inputToken);

		return tokens;
	}

	/**
	 * 4.3.1. Consume a token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-token
	 */
	private consumeAToken(): InputToken {
		if (this.reconsumedInputToken) {
			let result = this.reconsumedInputToken;
			this.reconsumedInputToken = null;

			return result;
		}
		const char = this.text[this.nextInputCodePointIndex];
		switch (char) {
			case '"':
				return this.consumeAStringToken();
			case "'":
				return this.consumeAStringToken();
			case '(':
			case ')':
			case ',':
			case ':':
			case ';':
			case '[':
			case ']':
			case '{':
			case '}':
				this.nextInputCodePointIndex++;

				return <any>char;
			case '#':
				return this.consumeAHashToken() || this.consumeADelimToken();
			case ' ':
			case '\t':
			case '\n':
			case '\r':
			case '\f':
				return this.consumeAWhitespace();
			case '@':
				return this.consumeAtKeyword() || this.consumeADelimToken();
			// TODO: Only if this is valid escape, otherwise it is a parse error
			case '\\':
				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				return this.consumeANumericToken();
			case 'u':
			case 'U':
				if (this.text[this.nextInputCodePointIndex + 1] === '+') {
					const thirdChar = this.text[this.nextInputCodePointIndex + 2];
					if ((thirdChar >= '0' && thirdChar <= '9') || thirdChar === '?') {
						// TODO: Handle unicode stuff such as U+002B
						throw new Error('Unicode tokens not supported!');
					}
				}

				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
			case '$':
			case '*':
			case '^':
			case '|':
			case '~':
				return this.consumeAMatchToken() || this.consumeADelimToken();
			case '-':
				return this.consumeANumericToken() || this.consumeAnIdentLikeToken() || this.consumeCDC() || this.consumeADelimToken();
			case '+':
			case '.':
				return this.consumeANumericToken() || this.consumeADelimToken();
			case '/':
				return this.consumeAComment() || this.consumeADelimToken();
			case '<':
				return this.consumeCDO() || this.consumeADelimToken();
			case undefined:
				return undefined;
			default:
				return this.consumeAnIdentLikeToken() || this.consumeADelimToken();
		}
	}

	private consumeADelimToken(): InputToken {
		return {
			type: TokenObjectType.delim,
			text: this.text[this.nextInputCodePointIndex++],
		};
	}

	private consumeAWhitespace(): InputToken {
		whitespaceRegEx.lastIndex = this.nextInputCodePointIndex;
		whitespaceRegEx.exec(this.text);
		this.nextInputCodePointIndex = whitespaceRegEx.lastIndex;

		return ' ';
	}

	private consumeAHashToken(): InputTokenObject {
		this.nextInputCodePointIndex++;
		let hashName = this.consumeAName();
		if (hashName) {
			return { type: TokenObjectType.hash, text: '#' + hashName.text };
		}
		this.nextInputCodePointIndex--;

		return null;
	}

	private consumeCDO(): '<!--' | null {
		if (this.text.substr(this.nextInputCodePointIndex, 4) === '<!--') {
			this.nextInputCodePointIndex += 4;

			return '<!--';
		}

		return null;
	}

	private consumeCDC(): '-->' | null {
		if (this.text.substr(this.nextInputCodePointIndex, 3) === '-->') {
			this.nextInputCodePointIndex += 3;

			return '-->';
		}

		return null;
	}

	private consumeAMatchToken(): '*=' | '$=' | '|=' | '~=' | '^=' | null {
		if (this.text[this.nextInputCodePointIndex + 1] === '=') {
			const token = this.text.substr(this.nextInputCodePointIndex, 2);
			this.nextInputCodePointIndex += 2;

			return <'*=' | '$=' | '|=' | '~=' | '^='>token;
		}

		return null;
	}

	/**
	 * 4.3.2. Consume a numeric token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-numeric-token
	 */
	private consumeANumericToken(): InputToken {
		numberRegEx.lastIndex = this.nextInputCodePointIndex;
		const result = numberRegEx.exec(this.text);
		if (!result) {
			return null;
		}
		this.nextInputCodePointIndex = numberRegEx.lastIndex;
		if (this.text[this.nextInputCodePointIndex] === '%') {
			return { type: TokenObjectType.percentage, text: result[0] }; // TODO: Push the actual number and unit here...
		}

		const name = this.consumeAName();
		if (name) {
			return {
				type: TokenObjectType.dimension,
				text: result[0] + name.text,
			};
		}

		return { type: TokenObjectType.number, text: result[0] };
	}

	/**
	 * 4.3.3. Consume an ident-like token
	 * https://www.w3.org/TR/css-syntax-3/#consume-an-ident-like-token
	 */
	private consumeAnIdentLikeToken(): InputToken {
		const name = this.consumeAName();
		if (!name) {
			return null;
		}
		if (this.text[this.nextInputCodePointIndex] === '(') {
			this.nextInputCodePointIndex++;
			if (name.text.toLowerCase() === 'url') {
				return this.consumeAURLToken();
			}

			return <FunctionInputToken>{
				type: TokenObjectType.functionToken,
				name: name.text,
				text: name.text + '(',
			};
		}

		return name;
	}

	/**
	 * 4.3.4. Consume a string token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-string-token
	 */
	private consumeAStringToken(): InputTokenObject {
		const char = this.text[this.nextInputCodePointIndex];
		let result: RegExpExecArray;
		if (char === "'") {
			singleQuoteStringRegEx.lastIndex = this.nextInputCodePointIndex;
			result = singleQuoteStringRegEx.exec(this.text);
			if (!result) {
				return null;
			}
			this.nextInputCodePointIndex = singleQuoteStringRegEx.lastIndex;
		} else if (char === '"') {
			doubleQuoteStringRegEx.lastIndex = this.nextInputCodePointIndex;
			result = doubleQuoteStringRegEx.exec(this.text);
			if (!result) {
				return null;
			}
			this.nextInputCodePointIndex = doubleQuoteStringRegEx.lastIndex;
		}

		// TODO: Handle bad-string.
		// TODO: Perform string escaping.
		return { type: TokenObjectType.string, text: result[0] };
	}

	/**
	 * 4.3.5. Consume a url token
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-url-token
	 */
	private consumeAURLToken(): InputToken {
		const start = this.nextInputCodePointIndex - 3 /* url */ - 1; /* ( */
		const urlToken: InputToken = {
			type: TokenObjectType.url,
			text: undefined,
		};
		this.consumeAWhitespace();
		if (this.nextInputCodePointIndex >= this.text.length) {
			return urlToken;
		}
		const nextInputCodePoint = this.text[this.nextInputCodePointIndex];
		if (nextInputCodePoint === '"' || nextInputCodePoint === "'") {
			const stringToken = this.consumeAStringToken();
			// TODO: Handle bad-string.
			// TODO: Set value instead.
			urlToken.text = stringToken.text;
			this.consumeAWhitespace();
			if (this.text[this.nextInputCodePointIndex] === ')' || this.nextInputCodePointIndex >= this.text.length) {
				this.nextInputCodePointIndex++;
				const end = this.nextInputCodePointIndex;
				urlToken.text = this.text.substring(start, end);

				return urlToken;
			} else {
				// TODO: Handle bad-url.
				return null;
			}
		}

		while (this.nextInputCodePointIndex < this.text.length) {
			const char = this.text[this.nextInputCodePointIndex++];
			switch (char) {
				case ')':
					return urlToken;
				case ' ':
				case '\t':
				case '\n':
				case '\r':
				case '\f':
					this.consumeAWhitespace();
					if (this.text[this.nextInputCodePointIndex] === ')') {
						this.nextInputCodePointIndex++;

						return urlToken;
					} else {
						// TODO: Bar url! Consume remnants.
						return null;
					}
				case '"':
				case "'":
					// TODO: Parse error! Bar url! Consume remnants.
					return null;
				case '\\':
					// TODO: Escape!
					throw new Error('Escaping not yet supported!');
				default:
					// TODO: Non-printable chars - error.
					urlToken.text += char;
			}
		}

		return urlToken;
	}

	/**
	 * 4.3.11. Consume a name
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-name
	 */
	private consumeAName(): InputTokenObject {
		nameRegEx.lastIndex = this.nextInputCodePointIndex;
		const result = nameRegEx.exec(this.text);
		if (!result) {
			return null;
		}
		this.nextInputCodePointIndex = nameRegEx.lastIndex;

		// TODO: Perform string escaping.
		return { type: TokenObjectType.ident, text: result[0] };
	}

	private consumeAtKeyword(): InputTokenObject {
		this.nextInputCodePointIndex++;
		let name = this.consumeAName();
		if (name) {
			return { type: TokenObjectType.atKeyword, text: name.text };
		}
		this.nextInputCodePointIndex--;

		return null;
	}

	private consumeAComment(): InputToken {
		if (this.text[this.nextInputCodePointIndex + 1] === '*') {
			commentRegEx.lastIndex = this.nextInputCodePointIndex;
			const result = commentRegEx.exec(this.text);
			if (!result) {
				return null; // TODO: Handle <bad-comment>
			}
			this.nextInputCodePointIndex = commentRegEx.lastIndex;

			// The CSS spec tokenizer does not emmit comment tokens
			return this.consumeAToken();
		}

		return null;
	}

	private reconsumeTheCurrentInputToken(currentInputToken: InputToken) {
		this.reconsumedInputToken = currentInputToken;
	}

	/**
	 * 5.3.1. Parse a stylesheet
	 * https://www.w3.org/TR/css-syntax-3/#parse-a-stylesheet
	 */
	public parseAStylesheet(): Stylesheet {
		this.topLevelFlag = true;
		const stylesheet: Stylesheet = {
			rules: this.consumeAListOfRules(),
		};

		return stylesheet;
	}

	/**
	 * 5.4.1. Consume a list of rules
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-list-of-rules
	 */
	public consumeAListOfRules(): Rule[] {
		const rules: Rule[] = [];
		let inputToken: InputToken;
		while ((inputToken = this.consumeAToken())) {
			switch (inputToken) {
				case ' ':
					continue;
				case '<!--':
				case '-->':
					if (this.topLevelFlag) {
						continue;
					}
					this.reconsumeTheCurrentInputToken(inputToken);
					const atRule = this.consumeAnAtRule();
					if (atRule) {
						rules.push(atRule);
					}
					continue;
			}
			if ((<InputTokenObject>inputToken).type === TokenObjectType.atKeyword) {
				this.reconsumeTheCurrentInputToken(inputToken);
				const atRule = this.consumeAnAtRule();
				if (atRule) {
					rules.push(atRule);
				}
				continue;
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const qualifiedRule = this.consumeAQualifiedRule();
			if (qualifiedRule) {
				rules.push(qualifiedRule);
			}
		}

		return rules;
	}

	/**
	 * 5.4.2. Consume an at-rule
	 * https://www.w3.org/TR/css-syntax-3/#consume-an-at-rule
	 */
	public consumeAnAtRule(): AtRule {
		let inputToken = this.consumeAToken();
		const atRule: AtRule = {
			type: 'at-rule',
			name: (<AtKeywordToken>inputToken).text,
			prelude: [],
			block: undefined,
		};
		while ((inputToken = this.consumeAToken())) {
			if (inputToken === ';') {
				return atRule;
			} else if (inputToken === '{') {
				atRule.block = this.consumeASimpleBlock(inputToken);

				return atRule;
			} else if ((<InputTokenObject>inputToken).type === TokenObjectType.simpleBlock && (<SimpleBlock>inputToken).associatedToken === '{') {
				atRule.block = <SimpleBlock>inputToken;

				return atRule;
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const component = this.consumeAComponentValue();
			if (component) {
				atRule.prelude.push(component);
			}
		}

		return atRule;
	}

	/**
	 * 5.4.3. Consume a qualified rule
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-qualified-rule
	 */
	public consumeAQualifiedRule(): QualifiedRule {
		const qualifiedRule: QualifiedRule = {
			type: 'qualified-rule',
			prelude: [],
			block: undefined,
		};
		let inputToken: InputToken;
		while ((inputToken = this.consumeAToken())) {
			if (inputToken === '{') {
				let block = this.consumeASimpleBlock(inputToken);
				qualifiedRule.block = block;

				return qualifiedRule;
			} else if ((<InputTokenObject>inputToken).type === TokenObjectType.simpleBlock) {
				const simpleBlock: SimpleBlock = <SimpleBlock>inputToken;
				if (simpleBlock.associatedToken === '{') {
					qualifiedRule.block = simpleBlock;

					return qualifiedRule;
				}
			}
			this.reconsumeTheCurrentInputToken(inputToken);
			const componentValue = this.consumeAComponentValue();
			if (componentValue) {
				qualifiedRule.prelude.push(componentValue);
			}
		}

		// TODO: This is a parse error, log parse errors!
		return null;
	}

	/**
	 * 5.4.6. Consume a component value
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-component-value
	 */
	private consumeAComponentValue(): InputToken {
		// const inputToken = this.consumeAToken();
		const inputToken = this.consumeAToken();
		switch (inputToken) {
			case '{':
			case '[':
			case '(':
				this.nextInputCodePointIndex++;

				return this.consumeASimpleBlock(inputToken);
		}
		if (typeof inputToken === 'object' && inputToken.type === TokenObjectType.functionToken) {
			return this.consumeAFunction((<FunctionInputToken>inputToken).name);
		}

		return inputToken;
	}

	/**
	 * 5.4.7. Consume a simple block
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-simple-block
	 */
	private consumeASimpleBlock(associatedToken: InputToken): SimpleBlock {
		const endianToken: ']' | '}' | ')' = {
			'[': ']',
			'{': '}',
			'(': ')',
		}[<any>associatedToken];
		const start = this.nextInputCodePointIndex - 1;
		const block: SimpleBlock = {
			type: TokenObjectType.simpleBlock,
			text: undefined,
			associatedToken,
			values: [],
		};
		let nextInputToken;
		while ((nextInputToken = this.text[this.nextInputCodePointIndex])) {
			if (nextInputToken === endianToken) {
				this.nextInputCodePointIndex++;
				const end = this.nextInputCodePointIndex;
				block.text = this.text.substring(start, end);

				return block;
			}
			const value = this.consumeAComponentValue();
			if (value) {
				block.values.push(value);
			}
		}
		block.text = this.text.substring(start);

		return block;
	}

	/**
	 * 5.4.8. Consume a function
	 * https://www.w3.org/TR/css-syntax-3/#consume-a-function
	 */
	private consumeAFunction(name: string): InputToken {
		const start = this.nextInputCodePointIndex;
		const funcToken: FunctionToken = {
			type: TokenObjectType.function,
			name,
			text: undefined,
			components: [],
		};
		do {
			if (this.nextInputCodePointIndex >= this.text.length) {
				funcToken.text = name + '(' + this.text.substring(start);

				return funcToken;
			}
			const nextInputToken = this.text[this.nextInputCodePointIndex];
			switch (nextInputToken) {
				case ')':
					this.nextInputCodePointIndex++;
					const end = this.nextInputCodePointIndex;
					funcToken.text = name + '(' + this.text.substring(start, end);

					return funcToken;
				default:
					const component = this.consumeAComponentValue();
					if (component) {
						funcToken.components.push(component);
					}
				// TODO: Else we won't advance
			}
		} while (true);
	}
}

/**
 * Consume a CSS3 parsed stylesheet and convert the rules and selectors to the
 * NativeScript internal JSON representation.
 */
export class CSSNativeScript {
	public parseStylesheet(stylesheet: Stylesheet): any {
		return {
			type: 'stylesheet',
			stylesheet: {
				rules: this.parseRules(stylesheet.rules),
			},
		};
	}

	private parseRules(rules: Rule[]): any {
		return rules.map((rule) => this.parseRule(rule));
	}

	private parseRule(rule: Rule): any {
		if (rule.type === 'at-rule') {
			return this.parseAtRule(rule);
		} else if (rule.type === 'qualified-rule') {
			return this.parseQualifiedRule(rule);
		}
	}

	private parseAtRule(rule: AtRule): any {
		if (rule.name === 'import') {
			// TODO: We have used an "@improt { url('path somewhere'); }" at few places.
			return {
				import: rule.prelude
					.map((m) => (typeof m === 'string' ? m : m.text))
					.join('')
					.trim(),
				type: 'import',
			};
		}

		return;
	}

	private parseQualifiedRule(rule: QualifiedRule): any {
		return {
			type: 'rule',
			selectors: this.preludeToSelectorsStringArray(rule.prelude),
			declarations: this.ruleBlockToDeclarations(rule.block.values),
		};
	}

	private ruleBlockToDeclarations(declarationsInputTokens: InputToken[]): { type: 'declaration'; property: string; value: string }[] {
		// return <any>declarationsInputTokens;
		const declarations: {
			type: 'declaration';
			property: string;
			value: string;
		}[] = [];

		let property = '';
		let value = '';
		let reading: 'property' | 'value' = 'property';

		for (let i = 0; i < declarationsInputTokens.length; i++) {
			let inputToken = declarationsInputTokens[i];
			if (reading === 'property') {
				if (inputToken === ':') {
					reading = 'value';
				} else if (typeof inputToken === 'string') {
					property += inputToken;
				} else {
					property += inputToken.text;
				}
			} else {
				if (inputToken === ';') {
					property = property.trim();
					value = value.trim();
					declarations.push({ type: 'declaration', property, value });
					property = '';
					value = '';
					reading = 'property';
				} else if (typeof inputToken === 'string') {
					value += inputToken;
				} else {
					value += inputToken.text;
				}
			}
		}
		property = property.trim();
		value = value.trim();
		if (property || value) {
			declarations.push({ type: 'declaration', property, value });
		}

		return declarations;
	}

	private preludeToSelectorsStringArray(prelude: InputToken[]): string[] {
		let selectors = [];
		let selector = '';
		prelude.forEach((inputToken) => {
			if (typeof inputToken === 'string') {
				if (inputToken === ',') {
					if (selector) {
						selectors.push(selector.trim());
					}
					selector = '';
				} else {
					selector += inputToken;
				}
			} else if (typeof inputToken === 'object') {
				selector += inputToken.text;
			}
		});
		if (selector) {
			selectors.push(selector.trim());
		}

		return selectors;
	}
}
