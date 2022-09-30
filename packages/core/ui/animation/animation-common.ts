// Types.
import { CubicBezierAnimationCurve as CubicBezierAnimationCurveDefinition, Animation as AnimationBaseDefinition, Point3D } from '.';
import { AnimationDefinition, AnimationPromise as AnimationPromiseDefinition, Pair, PropertyAnimation } from './animation-interfaces';

// Requires.
import { Color } from '../../color';
import { Trace } from '../../trace';
import { PercentLength } from '../styling/style-properties';

export * from './animation-interfaces';

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
			console.error('No animation definitions specified');
			return;
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
			if (Trace.isEnabled()) {
				Trace.write('Nothing to animate.', Trace.categories.Animation);
			}
			return;
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
			console.error('No animation target specified.');
			return;
		}

		for (const item in animationDefinition) {
			const value = animationDefinition[item];
			if (value === undefined) {
				continue;
			}

			if ((item === Properties.opacity || item === 'duration' || item === 'delay' || item === 'iterations') && typeof value !== 'number') {
				console.error(`Property ${item} must be valid number. Value: ${value}`);
				return;
			} else if ((item === Properties.scale || item === Properties.translate) && (typeof (<Pair>value).x !== 'number' || typeof (<Pair>value).y !== 'number')) {
				console.error(`Property ${item} must be valid Pair. Value: ${value}`);
				return;
			} else if (item === Properties.backgroundColor && !Color.isValid(animationDefinition.backgroundColor)) {
				console.error(`Property ${item} must be valid color. Value: ${value}`);
				return;
			} else if (item === Properties.width || item === Properties.height) {
				// Coerce input into a PercentLength object in case it's a string.
				animationDefinition[item] = PercentLength.parse(<any>value);
			} else if (item === Properties.rotate) {
				const rotate: number | Point3D = value;
				if (typeof rotate !== 'number' && !(typeof rotate.x === 'number' && typeof rotate.y === 'number' && typeof rotate.z === 'number')) {
					console.error(`Property ${rotate} must be valid number or Point3D. Value: ${value}`);
					return;
				}
			}
		}

		const propertyAnimations = new Array<PropertyAnimation>();

		// opacity
		if (animationDefinition.opacity !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.opacity,
				value: animationDefinition.opacity,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// backgroundColor
		if (animationDefinition.backgroundColor !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.backgroundColor,
				value: typeof animationDefinition.backgroundColor === 'string' ? new Color(<any>animationDefinition.backgroundColor) : animationDefinition.backgroundColor,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// translate
		if (animationDefinition.translate !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.translate,
				value: animationDefinition.translate,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// scale
		if (animationDefinition.scale !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.scale,
				value: animationDefinition.scale,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// rotate
		if (animationDefinition.rotate !== undefined) {
			// Make sure the value of the rotation property is always Point3D
			let rotationValue: Point3D;
			if (typeof animationDefinition.rotate === 'number') {
				rotationValue = { x: 0, y: 0, z: animationDefinition.rotate };
			} else {
				rotationValue = animationDefinition.rotate;
			}

			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.rotate,
				value: rotationValue,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// height
		if (animationDefinition.height !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.height,
				value: animationDefinition.height,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		// width
		if (animationDefinition.width !== undefined) {
			propertyAnimations.push({
				target: animationDefinition.target,
				property: Properties.width,
				value: animationDefinition.width,
				duration: animationDefinition.duration,
				delay: animationDefinition.delay,
				iterations: animationDefinition.iterations,
				curve: animationDefinition.curve,
			});
		}

		if (propertyAnimations.length === 0) {
			console.error('No known animation properties specified');
		}

		return propertyAnimations;
	}

	public static _getAnimationInfo(animation: PropertyAnimation): string {
		return JSON.stringify({
			target: animation.target.id,
			property: animation.property,
			value: animation.value,
			duration: animation.duration,
			delay: animation.delay,
			iterations: animation.iterations,
			curve: animation.curve,
		});
	}
}
