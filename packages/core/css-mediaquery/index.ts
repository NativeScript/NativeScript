/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

// https://github.com/ericf/css-mediaquery

import { Trace } from '../trace';
import { Length } from '../ui/styling/style-properties';
import { isString } from '../utils';

// -----------------------------------------------------------------------------

const RE_MEDIA_QUERY = /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i,
	RE_MQ_EXPRESSION = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/,
	RE_MQ_FEATURE = /^(?:(min|max)-)?(.+)/,
	RE_LENGTH_UNIT = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/,
	RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/;

export enum MediaQueryType {
	all = 'all',
	print = 'print',
	screen = 'screen',
}

export type MediaQueryProperties = 'width' | 'height' | 'device-width' | 'device-height' | 'orientation' | 'prefers-color-scheme';

export interface MediaQueryEnvironmentParams {
	type?: MediaQueryType;
	width?: number;
	height?: number;
	'device-width'?: number;
	'device-height'?: number;
	orientation?: string;
	'prefers-color-scheme'?: string;
}

export interface MediaQueryExpression {
	inverse: boolean;
	type: MediaQueryType;
	features: MediaQueryFeature[];
}

export interface MediaQueryFeature {
	modifier: string;
	property: MediaQueryProperties | string;
	value: string;
}

export function matchQuery(mediaQuery: string, values: MediaQueryEnvironmentParams): boolean {
	const expressions = parseQuery(mediaQuery);

	return expressions.some((query) => {
		if (query == null) {
			return false;
		}

		const { type, inverse, features } = query;

		// Either the parsed or specified `type` is "all", or the types must be
		// equal for a match.
		const typeMatch = query.type === 'all' || values.type === query.type;

		// Quit early when `type` doesn't match, but take "not" into account
		if ((typeMatch && inverse) || !(typeMatch || inverse)) {
			return false;
		}

		const expressionsMatch = features.every((feature) => {
			const value: string | number = values[feature.property];
			let featureValue: string | number = feature.value;

			// Missing or falsy values don't match
			if (!value) {
				return false;
			}

			switch (feature.property) {
				case 'orientation':
				case 'prefers-color-scheme':
					if (typeof value !== 'string' || typeof featureValue !== 'string') {
						return false;
					}
					return value.toLowerCase() === featureValue.toLowerCase();
				case 'width':
				case 'height':
				case 'device-width':
				case 'device-height':
					featureValue = Length.toDevicePixels(Length.parse(featureValue), 0);
					break;
			}

			switch (feature.modifier) {
				case 'min':
					return value >= featureValue;
				case 'max':
					return value <= featureValue;
				default:
					return value === featureValue;
			}
		});

		return (expressionsMatch && !inverse) || (!expressionsMatch && inverse);
	});
}

export function parseQuery(mediaQuery: string): MediaQueryExpression[] {
	const mediaQueryStrings = mediaQuery.split(',');

	return mediaQueryStrings.map((query) => {
		query = query.trim();

		const captures = query.match(RE_MEDIA_QUERY);

		// Media query must be valid
		if (!captures) {
			Trace.write('Invalid CSS media query: "' + query + '"', Trace.categories.Style, Trace.messageType.error);
			return null;
		}

		const modifier = captures[1];
		const type = captures[2];
		const featureString = ((captures[3] || '') + (captures[4] || '')).trim();

		const expression: MediaQueryExpression = {
			inverse: !!modifier && modifier.toLowerCase() === 'not',
			type: MediaQueryType[type ? type.toLowerCase() : 'all'] ?? 'all',
			features: [],
		};

		// Check for media query features
		if (!featureString) {
			return expression;
		}

		// Split features string into a list
		const featureStrings = featureString.match(/\([^\)]+\)/g);

		// Media query must be valid
		if (!featureStrings) {
			Trace.write('Invalid CSS media query: "' + query + '"', Trace.categories.Style, Trace.messageType.error);
			return null;
		}

		for (const featureString of featureStrings) {
			const captures = featureString.match(RE_MQ_EXPRESSION);

			// Media query must be valid
			if (!captures) {
				Trace.write('Invalid CSS media query: "' + query + '"', Trace.categories.Style, Trace.messageType.error);
				return null;
			}

			const featureData = captures[1].toLowerCase().match(RE_MQ_FEATURE);

			expression.features.push({
				modifier: featureData[1],
				property: featureData[2],
				value: captures[2],
			});
		}

		return expression;
	});
}
