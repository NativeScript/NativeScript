import { Color } from '.';

export const HEX_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^#[0-9A-F]{8}$)|(^#[0-9A-F]{4}$)/i;

export function isCssColorMixExpression(value: string) {
	return value.includes('color-mix(');
}

const colorMixRegExp = new RegExp('^color-mix\\(\\s*in\\s+([\\w-]+(?:\\s+[\\w-]+)*)\\s*,\\s*' + '([^,]+?)(?:\\s+(\\d+(?:\\.\\d+)?%)?)?' + '\\s*,\\s*' + '([^,]+?)(?:\\s+(\\d+(?:\\.\\d+)?%)?)?' + '\\s*\\)$', 'i');

export function colorMixToRgbA(value: string) {
	const match = value.trim().match(colorMixRegExp);
	if (!match) {
		return value;
	}

	const [, colorSpace, color1, pctStr1, color2, pctStr2] = match;

	// optional percentages
	// - If one is provided, the other is 100 - that.
	// - If none is provided, default 50/50.
	let p1 = pctStr1 ? parseFloat(pctStr1) : NaN;
	let p2 = pctStr2 ? parseFloat(pctStr2) : NaN;

	const bothMissing = Number.isNaN(p1) && Number.isNaN(p2);
	const onlyOneMissing = (!Number.isNaN(p1) && Number.isNaN(p2)) || (Number.isNaN(p1) && !Number.isNaN(p2));

	if (bothMissing) {
		p1 = 50;
		p2 = 50;
	} else if (onlyOneMissing) {
		// e.g., color-mix(in oklab, black 20%, transparent)
		// or color-mix(in oklab, black, transparent 80%)
		if (!Number.isNaN(p1)) {
			p2 = 100 - p1;
		} else {
			p1 = 100 - p2;
		}
	}

	const rgba1 = new Color(color1);
	const rgba2 = new Color(color2);

	const total = p1 + p2;
	const w1 = p1 / total;
	const w2 = p2 / total;

	const mixedRgba = {
		r: rgba1.r * w1 + rgba2.r * w2,
		g: rgba1.g * w1 + rgba2.g * w2,
		b: rgba1.b * w1 + rgba2.b * w2,
		a: rgba1.a * w1 + rgba2.a * w2,
	};

	return `rgba(${Math.round(mixedRgba.r)}, ${Math.round(mixedRgba.g)}, ${Math.round(mixedRgba.b)}, ${mixedRgba.a / 255})`;
}

export function fromArgbToRgba(argb: number): { a: number; r: number; g: number; b: number } {
	return {
		a: (argb >> 24) & 0xff,
		r: (argb >> 16) & 0xff,
		g: (argb >> 8) & 0xff,
		b: argb & 0xff,
	};
}

export function isRgbOrRgba(value: string): boolean {
	return (value.startsWith('rgb(') || value.startsWith('rgba(')) && value.endsWith(')');
}

export function isHslOrHsla(value: string): boolean {
	return (value.startsWith('hsl') || value.startsWith('hsla(')) && value.endsWith(')');
}
export function isHsvOrHsva(value: string): boolean {
	return (value.startsWith('hsv') || value.startsWith('hsva(')) && value.endsWith(')');
}

export function parseColorWithAlpha(value: string): any {
	const separator = value.indexOf(',') !== -1 ? ',' : ' ';
	const parts = value
		.replace(/(rgb|hsl|hsv)a?\(/, '')
		.replace(')', '')
		.replace(/\//, ' ')
		.replace(/%/g, '')
		.split(separator)
		.filter((part) => Boolean(part.length));

	let f = 255;
	let s = 255;
	let t = 255;
	let a = 255;

	if (parts[0]) {
		f = parseFloat(parts[0].trim());
	}

	if (parts[1]) {
		s = parseFloat(parts[1].trim());
	}

	if (parts[2]) {
		t = parseFloat(parts[2].trim());
	}

	if (parts[3]) {
		a = Math.round(parseFloat(parts[3].trim()) * 255);
	}

	return { f, s, t, a };
}

export function argbFromString(hex: string) {
	// always called as SHARP as first char
	hex = hex.substring(1);
	const length = hex.length;
	// first we normalize
	if (length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	} else if (length === 4) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
	}

	let intVal = parseInt(hex, 16);
	if (hex.length === 6) {
		// add the alpha component since the provided string is RRGGBB
		intVal = (intVal & 0x00ffffff) + 0xff000000;
	} else {
		// the new format is #RRGGBBAA
		// we need to shift the alpha value to 0x01000000 position
		const a = (intVal / 0x00000001) & 0xff;
		intVal = (intVal >>> 8) + (a & 0xff) * 0x01000000;
	}

	return intVal;
}

export function argbFromRgbOrRgba(value: string): number {
	const { f: r, s: g, t: b, a } = parseColorWithAlpha(value);

	return (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff);
}

export function argbFromHslOrHsla(value: string): number {
	const { f: h, s: s, t: l, a } = parseColorWithAlpha(value);

	const { r, g, b } = hslToRgb(h, s, l);

	return (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff);
}

export function argbFromHsvOrHsva(value: string): number {
	const { f: h, s: s, t: v, a } = parseColorWithAlpha(value);

	const { r, g, b } = hsvToRgb(h, s, v);

	return (a & 0xff) * 0x01000000 + (r & 0xff) * 0x00010000 + (g & 0xff) * 0x00000100 + (b & 0xff);
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255]
// *Returns:* { h, s, l } in [0,360] and [0,100]
export function rgbToHsl(r: number, g: number, b: number) {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h, s;
	const l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hue2rgb(p: number, q: number, t: number) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in  [0, 360] and s and l are contained  [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
export function hslToRgb(h1: number, s1: number, l1: number) {
	const h = (h1 % 360) / 360;
	const s = s1 / 100;
	const l = l1 / 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255]
// *Returns:* { h, s, v } in [0,360] and [0,100]
export function rgbToHsv(r: number, g: number, b: number) {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h;
	const v = max;

	const d = max - min;
	const s = max === 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h: h * 360, s: s * 100, v: v * 100 };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 360] and s and v are contained [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
export function hsvToRgb(h1: number, s1: number, v1: number) {
	const h = ((h1 % 360) / 360) * 6;
	const s = s1 / 100;
	const v = v1 / 100;

	const i = Math.floor(h),
		f = h - i,
		p = v * (1 - s),
		q = v * (1 - f * s),
		t = v * (1 - (1 - f) * s),
		mod = i % 6,
		r = [v, q, p, p, t, v][mod],
		g = [t, v, v, q, p, p][mod],
		b = [p, p, t, v, v, q][mod];

	return { r: r * 255, g: g * 255, b: b * 255 };
}
