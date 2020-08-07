import { CssAnimationProperty } from '../core/properties';

import { KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo, UnparsedKeyframe } from '../animation/keyframe-animation';
import { timeConverter, animationTimingFunctionConverter } from '../styling/converters';

import { transformConverter } from '../styling/style-properties';

const ANIMATION_PROPERTY_HANDLERS = Object.freeze({
	'animation-name': (info: any, value: any) => (info.name = value),
	'animation-duration': (info: any, value: any) => (info.duration = timeConverter(value)),
	'animation-delay': (info: any, value: any) => (info.delay = timeConverter(value)),
	'animation-timing-function': (info: any, value: any) => (info.curve = animationTimingFunctionConverter(value)),
	'animation-iteration-count': (info: any, value: any) => (info.iterations = value === 'infinite' ? Number.MAX_VALUE : parseFloat(value)),
	'animation-direction': (info: any, value: any) => (info.isReverse = value === 'reverse'),
	'animation-fill-mode': (info: any, value: any) => (info.isForwards = value === 'forwards'),
});

export class CssAnimationParser {
	public static keyframeAnimationsFromCSSDeclarations(declarations: KeyframeDeclaration[]): KeyframeAnimationInfo[] {
		if (declarations === null || declarations === undefined) {
			return undefined;
		}

		let animations = new Array<KeyframeAnimationInfo>();
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
		let parsedKeyframes = new Array<KeyframeInfo>();
		for (let keyframe of keyframes) {
			let declarations = parseKeyframeDeclarations(keyframe.declarations);
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
					parsedKeyframes[time] = current;
				}
				for (let declaration of keyframe.declarations) {
					if (declaration.property === 'animation-timing-function') {
						current.curve = animationTimingFunctionConverter(declaration.value);
					}
				}
				current.declarations = declarations;
			}
		}
		let array = new Array();
		for (let parsedKeyframe in parsedKeyframes) {
			array.push(parsedKeyframes[parsedKeyframe]);
		}
		array.sort(function (a, b) {
			return a.duration - b.duration;
		});

		return array;
	}
}

function keyframeAnimationsFromCSSProperty(value: any, animations: KeyframeAnimationInfo[]) {
	if (typeof value === 'string') {
		let values = value.split(/[,]+/);
		for (let parsedValue of values) {
			let animationInfo = new KeyframeAnimationInfo();
			let arr = (<string>parsedValue).trim().split(/[ ]+/);

			if (arr.length > 0) {
				animationInfo.name = arr[0];
			}
			if (arr.length > 1) {
				animationInfo.duration = timeConverter(arr[1]);
			}
			if (arr.length > 2) {
				animationInfo.curve = animationTimingFunctionConverter(arr[2]);
			}
			if (arr.length > 3) {
				animationInfo.delay = timeConverter(arr[3]);
			}
			if (arr.length > 4) {
				animationInfo.iterations = parseInt(arr[4]);
			}
			if (arr.length > 5) {
				animationInfo.isReverse = arr[4] === 'reverse';
			}
			if (arr.length > 6) {
				animationInfo.isForwards = arr[5] === 'forwards';
			}
			if (arr.length > 7) {
				throw new Error('Invalid value for animation: ' + value);
			}
			animations.push(animationInfo);
		}
	}
}

export function parseKeyframeDeclarations(unparsedKeyframeDeclarations: KeyframeDeclaration[]): KeyframeDeclaration[] {
	const declarations = unparsedKeyframeDeclarations.reduce((declarations, { property: unparsedProperty, value: unparsedValue }) => {
		const property = CssAnimationProperty._getByCssName(unparsedProperty);

		if (typeof unparsedProperty === 'string' && property && property._valueConverter) {
			declarations[property.name] = property._valueConverter(<string>unparsedValue);
		} else if (typeof unparsedValue === 'string' && unparsedProperty === 'transform') {
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
