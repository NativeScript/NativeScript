import { describe, it, expect } from 'vitest';

import { Color } from '../../color';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { CssAnimationProperty, CssProperty, _getRegisteredStyleProperties } from '../core/properties';
import { serializeColor, serializeCssValue, _serializeStyleValue } from './css-value-serializer';
import '../../accessibility';
import '../action-bar';
import '../layouts/flexbox-layout';
import '../editable-text-base/editable-text-base-common';
import '../image/image-common';
import '../list-view/list-view-common';
import '../page/page-common';
import '../segmented-bar/segmented-bar-common';
import '../tab-view/tab-view-common';

const COLORS = ['red', '#336699', 'rgba(10, 20, 30, 0.5)', '#11223380', 'rgba(0, 0, 0, 0.004)', 'transparent'];
const LENGTHS = ['10', '10px', '0', '1.5rem'];
const PERCENT_LENGTHS = [...LENGTHS, '50%', '7%', '33.3%', 'auto'];

const SAMPLES: Record<string, string[]> = {
	'min-width': LENGTHS,
	'min-height': LENGTHS,
	width: PERCENT_LENGTHS,
	height: PERCENT_LENGTHS,
	'max-width': ['10', '10px', '50%'],
	'max-height': ['10', '10px', '50%'],
	'margin-left': PERCENT_LENGTHS,
	'margin-right': PERCENT_LENGTHS,
	'margin-top': PERCENT_LENGTHS,
	'margin-bottom': PERCENT_LENGTHS,
	'padding-left': LENGTHS,
	'padding-right': LENGTHS,
	'padding-top': LENGTHS,
	'padding-bottom': LENGTHS,
	'row-gap': LENGTHS,
	'column-gap': LENGTHS,
	'horizontal-align': ['left', 'center', 'right', 'stretch'],
	'vertical-align': ['top', 'middle', 'bottom', 'stretch', 'text-top', 'baseline'],
	rotate: ['45', '-12.5'],
	rotatex: ['30'],
	rotatey: ['60'],
	perspective: ['300'],
	scaleX: ['1.5', '0.1'],
	scaleY: ['2'],
	translateX: ['10', '10px'],
	translateY: ['-4', '3px'],
	'background-image': ['url(~/images/a.png)', 'linear-gradient(to right, red, blue)', 'linear-gradient(45deg, rgba(255, 0, 0, 0.5), #0000ff, green)', 'linear-gradient(to bottom, red 0%, blue 100%)'],
	'background-color': COLORS,
	'background-repeat': ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
	'background-size': ['cover', '10px 20px'],
	'background-position': ['center', '10px 20px'],
	'border-top-color': COLORS,
	'border-right-color': COLORS,
	'border-bottom-color': COLORS,
	'border-left-color': COLORS,
	'border-top-width': ['2', '2px'],
	'border-right-width': ['2', '2px'],
	'border-bottom-width': ['2', '2px'],
	'border-left-width': ['2', '2px'],
	'border-top-left-radius': ['4', '4px'],
	'border-top-right-radius': ['4', '4px'],
	'border-bottom-right-radius': ['4', '4px'],
	'border-bottom-left-radius': ['4', '4px'],
	'corner-shape': ['round', 'squircle'],
	'box-shadow': ['2 2 4 red', '1 1 2 rgba(0, 0, 0, 0.5), inset 0 0 3 4 blue', '5px 5px', 'none'],
	'clip-path': ['circle(50% at 50% 50%)', 'inset(10px 20px)', 'none'],
	direction: ['ltr', 'rtl'],
	'z-index': ['1', '-2'],
	opacity: ['0', '0.5', '1'],
	color: COLORS,
	'font-family': ['Arial', 'Times New Roman, serif'],
	'font-size': ['12', '1.5rem'],
	'font-style': ['normal', 'italic'],
	'font-weight': ['normal', 'bold', '300'],
	'font-variation-settings': ["'wght' 400", "'wght' 400, 'wdth' 100"],
	visibility: ['visible', 'hidden', 'collapse'],
	'android-elevation': ['4'],
	'android-dynamic-elevation-offset': ['2'],
	'a11y-enabled': ['true', 'false'],
	'ios-a11y-adjusts-font-size': ['true', 'false'],
	'ios-a11y-min-font-scale': ['0.5'],
	'ios-a11y-max-font-scale': ['2'],
	'a11y-hidden': ['true', 'false'],
	'a11y-role': ['button', 'header'],
	'a11y-state': ['selected', 'checked'],
	'a11y-live-region': ['polite', 'assertive'],
	'a11y-lang': ['en'],
	'a11y-media-session': ['true'],
	'a11y-step': ['5'],
	'status-bar-style': ['light', 'dark'],
	'text-align': ['left', 'center', 'right', 'justify'],
	'text-transform': ['none', 'uppercase', 'capitalize'],
	'text-shadow': ['2 2 4 red', '1px 1px 0 rgba(0, 0, 0, 0.5)'],
	'text-stroke': ['2 red', '1px rgba(0, 0, 0, 0.5)'],
	'white-space': ['normal', 'nowrap', 'wrap'],
	'text-overflow': ['clip', 'ellipsis'],
	'text-decoration': ['none', 'underline', 'line-through'],
	'letter-spacing': ['0.1'],
	'line-height': ['20'],
	'max-lines': ['2', 'none'],
	'android-content-inset-left': ['16', '16px'],
	'android-content-inset-right': ['16', '16px'],
	'placeholder-color': COLORS,
	'tint-color': COLORS,
	'flex-direction': ['row', 'column-reverse'],
	'flex-wrap': ['nowrap', 'wrap'],
	'justify-content': ['center', 'space-between'],
	'align-items': ['center', 'stretch'],
	'align-content': ['center', 'space-around'],
	order: ['2'],
	'flex-grow': ['1'],
	'flex-shrink': ['0'],
	'flex-wrap-before': ['true', 'false'],
	'align-self': ['auto', 'center'],
	'separator-color': COLORS,
	'android-status-bar-background': COLORS,
	'selected-background-color': COLORS,
	'selected-text-color': COLORS,
	'tab-text-font-size': ['14'],
	'tab-text-color': COLORS,
	'icon-font-family': ['Font Awesome'],
	'tab-background-color': COLORS,
	'selected-tab-text-color': COLORS,
	'android-selected-tab-highlight-color': COLORS,
};

/**
 * Values whose typed form does not survive `parse(serialize(x))`, by `<css name>: <sample>`.
 * Each entry must keep failing; the spec flags entries that start to round-trip.
 */
const ROUND_TRIP_EXCEPTIONS: Record<string, string> = {
	'background-image: linear-gradient(to bottom, red 0%, blue 100%)': 'LinearGradient.equals compares stop offsets by reference',
};

type Longhand = CssProperty<any, any> | CssAnimationProperty<any, any>;

function longhands(): Longhand[] {
	const result: Longhand[] = [];
	for (const property of _getRegisteredStyleProperties()) {
		if ((property instanceof CssProperty || property instanceof CssAnimationProperty) && !property.cssLocalName.startsWith('_')) {
			result.push(property);
		}
	}

	return result;
}

function isPlainData(value: unknown): boolean {
	return Array.isArray(value) || (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype);
}

/** Deep equality for comparer-less data such as shadows, comparing colors by value. */
function dataEquals(a: unknown, b: unknown): boolean {
	if (a instanceof Color || b instanceof Color) {
		return a instanceof Color && b instanceof Color && Color.equals(a, b);
	}
	if (!isPlainData(a) || !isPlainData(b)) {
		return a === b;
	}
	if (Array.isArray(a) !== Array.isArray(b)) {
		return false;
	}

	const keys = new Set([...Object.keys(<object>a), ...Object.keys(<object>b)]);
	for (const key of keys) {
		if (!dataEquals(a[key], b[key])) {
			return false;
		}
	}

	return true;
}

function newView(): any {
	const root: any = new StackLayout();
	const view: any = new Label();
	root.addChild(view);

	return view;
}

/**
 * Writes the sample, then its serialization on the same view: the property's own
 * equality comparer (or identity) suppresses the change event when the two are equal.
 */
function roundTrip(property: Longhand, sample: string): { serialized: string; ok: boolean } {
	const view = newView();
	const style = view.style;
	style[property.cssLocalName] = sample;
	const typed = property._getLocalValue(style);
	const serialized = _serializeStyleValue(property, typed);

	let changed = false;
	style.on(`${property.name}Change`, () => (changed = true));
	style[property.cssLocalName] = serialized;
	const reparsed = property._getLocalValue(style);

	const ok = property._isLocalValueSet(style) && (!changed || (isPlainData(typed) && dataEquals(typed, reparsed)));

	return { serialized, ok };
}

describe('css value serialization', () => {
	it('has a sample for every registered longhand', () => {
		const missing = longhands()
			.map((p) => p.cssLocalName)
			.filter((name) => !SAMPLES[name]);

		expect(missing).toEqual([]);
	});

	for (const [cssName, samples] of Object.entries(SAMPLES)) {
		for (const sample of samples) {
			const key = `${cssName}: ${sample}`;
			it(`round-trips ${key}`, () => {
				const property = longhands().find((p) => p.cssLocalName === cssName);
				expect(property, `${cssName} is not registered`).toBeDefined();

				const { serialized, ok } = roundTrip(property, sample);
				expect(serialized).not.toBe('');
				if (ROUND_TRIP_EXCEPTIONS[key]) {
					expect(ok, `${key} round-trips now; remove it from ROUND_TRIP_EXCEPTIONS`).toBe(false);
				} else {
					expect(ok, `${key} serialized to ${serialized}`).toBe(true);
				}
			});
		}
	}

	it('serializes colors as rgb() or rgba() that parse back to the same alpha byte', () => {
		expect(serializeColor(new Color('red'))).toBe('rgb(255, 0, 0)');
		expect(serializeColor(new Color('#33669980'))).toBe('rgba(51, 102, 153, 0.502)');
		for (let a = 0; a <= 255; a++) {
			const color = new Color(a, 1, 2, 3);
			expect(new Color(serializeColor(color)).argb).toBe(color.argb);
		}
	});

	it('serializes lengths with their unit and percentages without float noise', () => {
		expect(serializeCssValue(10)).toBe('10');
		expect(serializeCssValue({ value: 10, unit: 'px' })).toBe('10px');
		expect(serializeCssValue({ value: 0.07, unit: '%' })).toBe('7%');
		expect(serializeCssValue({ value: 0.333, unit: '%' })).toBe('33.3%');
	});

	it('serializes empty values to an empty string', () => {
		expect(serializeCssValue(undefined)).toBe('');
		expect(serializeCssValue(null)).toBe('');
	});
});
