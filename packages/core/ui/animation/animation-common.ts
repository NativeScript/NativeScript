// Types.
import { CubicBezierAnimationCurve as CubicBezierAnimationCurveDefinition, Animation as AnimationBaseDefinition } from '.';
import { AnimationDefinition, AnimationPromise as AnimationPromiseDefinition, PropertyAnimation } from './animation-interfaces';

// Requires.
import { Trace } from '../../trace';
import { Style } from '../styling/style';
import { CssAnimationProperty, InheritedCssProperty, ShorthandProperty } from '../core/properties';
import { View } from '../core/view';

export * from './animation-interfaces';

export function getPropertyFromKey(key: string, view: View) {
	return CssAnimationProperty.properties[key] || ShorthandProperty.properties[key] || InheritedCssProperty.properties[key] || Style.prototype[key] || Object.getPrototypeOf(view)[key];
}

export namespace Properties {
	export const opacity = 'opacity';
	export const backgroundColor = 'backgroundColor';
	export const translate = 'translate';
	export const rotate = 'rotate';
	export const scale = 'scale';
	export const height = 'height';
	export const width = 'width';
}

export class CubicBezierAnimationCurve implements CubicBezierAnimationCurveDefinition {
	public x1: number;
	public y1: number;
	public x2: number;
	public y2: number;

	constructor(x1: number, y1: number, x2: number, y2: number) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
}

export abstract class AnimationBase implements AnimationBaseDefinition {
	public _propertyAnimations: Array<PropertyAnimation>;
	public _playSequentially: boolean;
	private _isPlaying: boolean;
	private _resolve;
	private _reject;

	constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean) {
		if (!animationDefinitions || animationDefinitions.length === 0) {
			throw new Error('No animation definitions specified');
		}

		if (Trace.isEnabled()) {
			Trace.write('Analyzing ' + animationDefinitions.length + ' animation definitions...', Trace.categories.Animation);
		}

		this._propertyAnimations = new Array<PropertyAnimation>();
		for (let i = 0, length = animationDefinitions.length; i < length; i++) {
			if (animationDefinitions[i].curve) {
				animationDefinitions[i].curve = this._resolveAnimationCurve(animationDefinitions[i].curve);
			}
			this._propertyAnimations = this._propertyAnimations.concat(AnimationBase._createPropertyAnimations(animationDefinitions[i]));
		}

		if (this._propertyAnimations.length === 0) {
			throw new Error('Nothing to animate.');
		}
		if (Trace.isEnabled()) {
			Trace.write('Created ' + this._propertyAnimations.length + ' individual property animations.', Trace.categories.Animation);
		}

		this._playSequentially = playSequentially;
	}

	abstract _resolveAnimationCurve(curve: any): any;

	protected _rejectAlreadyPlaying(): AnimationPromiseDefinition {
		const reason = 'Animation is already playing.';
		Trace.write(reason, Trace.categories.Animation, Trace.messageType.warn);

		return <AnimationPromiseDefinition>new Promise<void>((resolve, reject) => {
			reject(reason);
		});
	}

	public play(): AnimationPromiseDefinition {
		// We have to actually create a "Promise" due to a bug in the v8 engine and decedent promises
		// We just cast it to a animationPromise so that all the rest of the code works fine
		const animationFinishedPromise = <AnimationPromiseDefinition>new Promise<void>((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});

		this.fixupAnimationPromise(animationFinishedPromise);

		this._isPlaying = true;

		return animationFinishedPromise;
	}

	private fixupAnimationPromise(promise: AnimationPromiseDefinition): void {
		// Since we are using function() below because of arguments, TS won't automatically do a _this for those functions.
		const _this = this;
		promise.cancel = () => {
			_this.cancel();
		};
		const _then = promise.then;
		promise.then = function () {
			// eslint-disable-next-line prefer-rest-params
			const r = _then.apply(promise, arguments);
			_this.fixupAnimationPromise(r);

			return r;
		};
		const _catch = promise.catch;
		promise.catch = function () {
			// eslint-disable-next-line prefer-rest-params
			const r = _catch.apply(promise, arguments);
			_this.fixupAnimationPromise(r);

			return r;
		};
	}

	public cancel(): void {
		// Implemented in platform specific files
	}

	public get isPlaying(): boolean {
		return this._isPlaying;
	}

	public _resolveAnimationFinishedPromise() {
		this._isPlaying = false;
		this._resolve();
	}

	public _rejectAnimationFinishedPromise() {
		this._isPlaying = false;
		this._reject(new Error('Animation cancelled.'));
	}

	private static _createPropertyAnimations(animationDefinition: AnimationDefinition): Array<PropertyAnimation> {
		if (!animationDefinition.target) {
			throw new Error('No animation target specified.');
		}

		const propertyAnimations = new Array<PropertyAnimation>();
		for (const item in animationDefinition) {
			const value = animationDefinition[item];
			if (value === undefined) {
				continue;
			}
			if (item === 'duration' || item === 'valueSource' || item === 'delay' || item === 'iterations' || item === 'curve' || item === 'target') {
				if (item === 'duration' || item === 'delay' || item === 'iterations') {
					if (typeof value !== 'number') {
						throw new Error(`Property ${item} must be valid number. Value: ${value}`);
					}
				}
				continue;
			}
			let property = getPropertyFromKey(item, animationDefinition.target);
			if (item === 'scale' || item === 'translate') {
				property = CssAnimationProperty.properties[item + 'X'];
			}
			if (property) {
				let newValue = value;
				if (property._valueConverter) {
					if (item === 'translate' || item === 'rotate' || item === 'scale') {
						newValue = {};
						if (item === 'rotate' && typeof value === 'number') {
							newValue = { x: 0, y: 0, z: typeof value === 'string' ? property._valueConverter(value) : value };
						} else {
							Object.keys(value).forEach((k2) => {
								newValue[k2] = typeof value[k2] === 'string' ? property._valueConverter(value[k2]) : value[k2];
							});
						}
					} else {
						newValue = typeof value === 'string' ? property._valueConverter(value) : value;
					}
				}
				propertyAnimations.push({
					target: animationDefinition.target,
					propertyName: item,
					property,
					value: newValue,
					duration: animationDefinition.duration,
					delay: animationDefinition.delay,
					iterations: animationDefinition.iterations,
					curve: animationDefinition.curve,
				});
			}
		}

		if (propertyAnimations.length === 0) {
			throw new Error('No known animation properties specified');
		}

		return propertyAnimations;
	}

	public static _getAnimationInfo(animation: PropertyAnimation): string {
		return JSON.stringify({
			target: animation.target.id,
			propertyName: animation.propertyName,
			value: animation.value,
			duration: animation.duration,
			delay: animation.delay,
			iterations: animation.iterations,
			curve: animation.curve,
		});
	}
}
