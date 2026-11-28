import { Color } from '../../color';
import { unsetValue } from '../core/properties/property-shared';
import { LinearGradient } from './linear-gradient';
import type { ShadowCSSValues } from './css-shadow';

/** Drops the float noise of scaling a fraction, e.g. `0.07 * 100`. */
function toPercent(fraction: number): number {
	return parseFloat((fraction * 100).toPrecision(12));
}

function isLengthUnit(value: object): value is { value: number; unit: string } {
	return typeof (<any>value).value === 'number' && typeof (<any>value).unit === 'string';
}

function isShadow(value: object): value is ShadowCSSValues {
	return 'offsetX' in value && 'offsetY' in value;
}

function isStroke(value: object): value is { width: unknown; color: Color } {
	return 'width' in value && 'color' in value;
}

function isFontVariationSetting(value: object): value is { axis: string; value: number } {
	return 'axis' in value && 'value' in value;
}

/**
 * Serializes a color as `rgb()`, or `rgba()` with the alpha rounded so it parses back to the same byte.
 * @param color The color.
 * @returns The css string.
 */
export function serializeColor(color: Color): string {
	const a = color.a;
	if (a === 255) {
		return `rgb(${color.r}, ${color.g}, ${color.b})`;
	}

	return `rgba(${color.r}, ${color.g}, ${color.b}, ${+(a / 255).toFixed(3)})`;
}

function serializeLength(length: { value: number; unit: string }): string {
	return length.unit === '%' ? `${toPercent(length.value)}%` : `${length.value}${length.unit}`;
}

function serializeLinearGradient(gradient: LinearGradient): string {
	const stops = gradient.colorStops.map((stop) => (stop.offset ? `${serializeColor(stop.color)} ${serializeLength(stop.offset)}` : serializeColor(stop.color)));

	return `linear-gradient(${gradient.angle}rad, ${stops.join(', ')})`;
}

function serializeShadow(shadow: ShadowCSSValues): string {
	const parts: string[] = [];
	if (shadow.inset) {
		parts.push('inset');
	}
	parts.push(serializeCssValue(shadow.offsetX), serializeCssValue(shadow.offsetY));
	if (shadow.blurRadius !== undefined) {
		parts.push(serializeCssValue(shadow.blurRadius));
		if (shadow.spreadRadius !== undefined) {
			parts.push(serializeCssValue(shadow.spreadRadius));
		}
	}
	if (shadow.color) {
		parts.push(serializeColor(shadow.color));
	}

	return parts.join(' ');
}

/**
 * Serializes a box-shadow list, whose parsed form keeps the layers in reverse order.
 * @param shadows The parsed layers.
 * @returns The css string.
 */
export function serializeBoxShadows(shadows: ShadowCSSValues[]): string {
	if (!shadows?.length) {
		return 'none';
	}

	const layers: string[] = [];
	for (let i = shadows.length - 1; i >= 0; i--) {
		layers.push(serializeShadow(shadows[i]));
	}

	return layers.join(', ');
}

/**
 * Serializes a typed style value to the css string its property parses back:
 * strings as is, colors as `rgb()`/`rgba()`, lengths with their unit (dip unitless),
 * percentages as `%`, plus gradients, shadows, strokes and lists.
 * `null`, `undefined` and `unsetValue` serialize to `''`.
 * @param value The typed value.
 * @returns The css string.
 */
export function serializeCssValue(value: unknown): string {
	if (value == null || value === unsetValue) {
		return '';
	}

	switch (typeof value) {
		case 'string':
			return value;
		case 'object':
			break;
		default:
			return String(value);
	}

	if (value instanceof Color) {
		return serializeColor(value);
	}
	if (value instanceof LinearGradient) {
		return serializeLinearGradient(value);
	}
	if (Array.isArray(value)) {
		return value.map(serializeCssValue).join(', ');
	}
	if (isLengthUnit(value)) {
		return serializeLength(value);
	}
	if (isShadow(value)) {
		return serializeShadow(value);
	}
	if (isStroke(value)) {
		return `${serializeCssValue(value.width)} ${serializeCssValue(value.color)}`.trim();
	}
	if (isFontVariationSetting(value)) {
		return `'${value.axis}' ${value.value}`;
	}

	return String(value);
}

/** Serializes a typed value with the property's own serializer, or `serializeCssValue`. */
export function _serializeStyleValue(property: { valueSerializer?: (value: any) => string }, value: unknown): string {
	return property.valueSerializer ? property.valueSerializer(value) : serializeCssValue(value);
}
