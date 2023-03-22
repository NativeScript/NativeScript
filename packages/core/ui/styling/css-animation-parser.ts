import { CssAnimationProperty } from '../core/properties';

import { KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo, UnparsedKeyframe } from '../animation/keyframe-animation';
import { timeConverter, animationTimingFunctionConverter } from '../styling/converters';

import { transformConverter } from '../styling/style-properties';
import { cleanupImportantFlags } from './css-utils';

const ANIMATION_PROPERTY_HANDLERS = Object.freeze({
	'animation-name': (info: any, value: any) => (info.name = value.replaceAll(/['"]/g, '')),
	'animation-duration': (info: any, value: any) => (info.duration = timeConverter(value)),
	'animation-delay': (info: any, value: any) => (info.delay = timeConverter(value)),
	'animation-timing-function': (info: any, value: any) => (info.curve = animationTimingFunctionConverter(value)),
	'animation-iteration-count': (info: any, value: any) => (info.iterations = value === 'infinite' ? Number.POSITIVE_INFINITY : parseFloat(value)),
	'animation-direction': (info: any, value: any) => (info.isReverse = value === 'reverse'),
	'animation-fill-mode': (info: any, value: any) => (info.isForwards = value === 'forwards' || value === 'both'),
});

export class CssAnimationParser {
	public static keyframeAnimationsFromCSSDeclarations(declarations: KeyframeDeclaration[]): KeyframeAnimationInfo[] {
		if (declarations === null || declarations === undefined) {
			return undefined;
		}

		const animations = new Array<KeyframeAnimationInfo>();
		let animationInfo: KeyframeAnimationInfo = undefined;

		declarations.forEach(({ property, value }) => {
			if (property === 'animation') {
				keyframeAnimationsFromCSSProperty(value, animations);
			} else {
				const propertyHandler = ANIMATION_PROPERTY_HANDLERS[property];
				if (propertyHandler) {
					if (animationInfo === undefined) {
						animationInfo = new KeyframeAnimationInfo();
						animations.push(animationInfo);
					}
					propertyHandler(animationInfo, value);
				}
			}
		});

		return animations.length === 0 ? undefined : animations;
	}

	public static keyframesArrayFromCSS(keyframes: UnparsedKeyframe[]): KeyframeInfo[] {
		const parsedKeyframes = new Array<KeyframeInfo>();
		for (const keyframe of keyframes) {
			const declarations = parseKeyframeDeclarations(keyframe.declarations);
			for (let time of keyframe.values) {
				if (time === 'from') {
					time = 0;
				} else if (time === 'to') {
					time = 1;
				} else {
					time = parseFloat(time) / 100;
					if (time < 0) {
						time = 0;
					}
					if (time > 100) {
						time = 100;
					}
				}
				let current = parsedKeyframes[time];
				if (current === undefined) {
					current = <KeyframeInfo>{};
					current.duration = time;
					current.declarations = [];
					parsedKeyframes[time] = current;
				}
				for (const declaration of keyframe.declarations) {
					if (declaration.property === 'animation-timing-function') {
						current.curve = animationTimingFunctionConverter(declaration.value);
					}
				}
				current.declarations = current.declarations.concat(declarations);
			}
		}
		const array = [];
		for (const parsedKeyframe in parsedKeyframes) {
			array.push(parsedKeyframes[parsedKeyframe]);
		}
		array.sort(function (a, b) {
			return a.duration - b.duration;
		});

		return array;
	}
}

/**
 * @see https://w3c.github.io/csswg-drafts/css-animations/#propdef-animation
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation
 * @internal - exported for testing
 * @param value
 * @param animations
 */
export function keyframeAnimationsFromCSSProperty(value: any, animations: KeyframeAnimationInfo[]) {
	if (typeof value !== 'string') {
		return;
	}

	if (value.trim().length === 0) {
		return;
	}

	/**
	 * Matches whitespace except if the whitespace is contained in parenthesis - ex. cubic-bezier(1, 1, 1, 1).
	 */
	const VALUE_SPLIT_RE = /\s(?![^(]*\))/;

	/**
	 * Matches commas except if the comma is contained in parenthesis - ex. cubic-bezier(1, 1, 1, 1).
	 */
	const MULTIPLE_SPLIT_RE = /,(?![^(]*\))/;

	const isTime = (v: string) => !!v.match(/\dm?s$/g);
	const isTimingFunction = (v: string) => !!v.match(/ease|linear|ease-in|ease-out|ease-in-out|spring|cubic-bezier/g);
	const isIterationCount = (v: string) => !!v.match(/infinite|[\d.]+$/g);
	const isDirection = (v: string) => !!v.match(/normal|reverse|alternate|alternate-reverse/g);
	const isFillMode = (v: string) => !!v.match(/none|forwards|backwards|both/g);
	const isPlayState = (v: string) => !!v.match(/running|paused/g);

	const values = value.split(MULTIPLE_SPLIT_RE);
	for (const parsedValue of values) {
		const animationInfo = new KeyframeAnimationInfo();
		const parts = (<string>parsedValue).trim().split(VALUE_SPLIT_RE);

		const [duration, delay] = parts.filter(isTime);
		const [timing] = parts.filter(isTimingFunction);
		const [iterationCount] = parts.filter(isIterationCount);
		const [direction] = parts.filter(isDirection);
		const [fillMode] = parts.filter(isFillMode);
		const [playState] = parts.filter(isPlayState);
		const [name] = parts.filter((v) => {
			// filter out "consumed" values
			return ![duration, delay, timing, iterationCount, direction, fillMode, playState].filter(Boolean).includes(v);
		});

		// console.log({
		// 	duration,
		// 	delay,
		// 	timing,
		// 	iterationCount,
		// 	direction,
		// 	fillMode,
		// 	playState,
		// 	name,
		// });

		if (duration) {
			ANIMATION_PROPERTY_HANDLERS['animation-duration'](animationInfo, duration);
		}
		if (delay) {
			ANIMATION_PROPERTY_HANDLERS['animation-delay'](animationInfo, delay);
		}
		if (timing) {
			ANIMATION_PROPERTY_HANDLERS['animation-timing-function'](animationInfo, timing);
		}
		if (iterationCount) {
			ANIMATION_PROPERTY_HANDLERS['animation-iteration-count'](animationInfo, iterationCount);
		}
		if (direction) {
			ANIMATION_PROPERTY_HANDLERS['animation-direction'](animationInfo, direction);
		}
		if (fillMode) {
			ANIMATION_PROPERTY_HANDLERS['animation-fill-mode'](animationInfo, fillMode);
		}
		if (playState) {
			// TODO: implement play state? Currently not supported...
		}
		if (name) {
			ANIMATION_PROPERTY_HANDLERS['animation-name'](animationInfo, name);
		} else {
			// based on the SPEC we should set the name to 'none' if no name is provided
			// however we just don't set the name at all.
			// perhaps we should set it to 'none' and handle it accordingly.
			// animationInfo.name = 'none'
		}

		animations.push(animationInfo);
	}
}

export function parseKeyframeDeclarations(unparsedKeyframeDeclarations: KeyframeDeclaration[]): KeyframeDeclaration[] {
	const declarations = unparsedKeyframeDeclarations.reduce((declarations, { property: unparsedProperty, value: unparsedValue }) => {
		const property = CssAnimationProperty._getByCssName(unparsedProperty);
		unparsedValue = cleanupImportantFlags(unparsedValue, property?.cssLocalName);

		if (typeof unparsedProperty === 'string' && property?._valueConverter) {
			declarations[property.name] = property._valueConverter(<string>unparsedValue);
		} else if (unparsedProperty === 'transform') {
			const transformations = transformConverter(unparsedValue);
			Object.assign(declarations, transformations);
		}

		return declarations;
	}, {});

	return Object.keys(declarations).map((property) => ({
		property,
		value: declarations[property],
	}));
}
