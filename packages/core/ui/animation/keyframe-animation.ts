import { View } from '../core/view';
import { Color } from '../../color';

import { AnimationCurve } from '../enums';

import { Trace } from '../../trace';

// Types.
import { unsetValue } from '../core/properties';
import { Animation } from '.';
import { backgroundColorProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty, rotateProperty, opacityProperty, rotateXProperty, rotateYProperty, widthProperty, heightProperty, PercentLength } from '../styling/style-properties';

export class Keyframes {
	name: string;
	keyframes: Array<UnparsedKeyframe>;
}

export class UnparsedKeyframe {
	values: Array<any>;
	declarations: Array<KeyframeDeclaration>;
}

export class KeyframeDeclaration {
	public property: string;
	public value: any;
}

export class KeyframeInfo {
	public duration: number;
	public declarations: Array<KeyframeDeclaration>;
	public curve?: any = AnimationCurve.ease;
}

export class KeyframeAnimationInfo {
	public keyframes: Array<KeyframeInfo>;
	public name?: string = '';
	public duration?: number = 0.3;
	public delay?: number = 0;
	public iterations?: number = 1;
	public curve?: any = 'ease';
	public isForwards?: boolean = false;
	public isReverse?: boolean = false;
}

interface Keyframe {
	backgroundColor?: Color;
	scale?: { x: number; y: number };
	translate?: { x: number; y: number };
	rotate?: { x: number; y: number; z: number };
	opacity?: number;
	width?: PercentLength;
	height?: PercentLength;
	valueSource?: 'keyframe' | 'animation';
	duration?: number;
	curve?: any;
	forceLayer?: boolean;
}

export class KeyframeAnimation {
	public animations: Array<Keyframe>;
	public delay: number = 0;
	public iterations: number = 1;

	private _resolve;
	private _isPlaying: boolean;
	private _isForwards: boolean;
	private _nativeAnimations: Array<Animation>;
	private _target: View;

	public static keyframeAnimationFromInfo(info: KeyframeAnimationInfo): KeyframeAnimation {
		const length = info.keyframes.length;
		let animations = new Array<Keyframe>();
		let startDuration = 0;

		if (info.isReverse) {
			for (let index = length - 1; index >= 0; index--) {
				let keyframe = info.keyframes[index];
				startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
			}
		} else {
			for (let index = 0; index < length; index++) {
				let keyframe = info.keyframes[index];
				startDuration = KeyframeAnimation.parseKeyframe(info, keyframe, animations, startDuration);
			}
			for (let index = length - 1; index > 0; index--) {
				let a1 = animations[index];
				let a2 = animations[index - 1];
				if (a2['curve'] !== undefined) {
					a1['curve'] = a2['curve'];
					a2['curve'] = undefined;
				}
			}
		}

		animations.map((a) => (a['curve'] ? a : Object.assign(a, { curve: info.curve })));

		const animation: KeyframeAnimation = new KeyframeAnimation();
		animation.delay = info.delay;
		animation.iterations = info.iterations;
		animation.animations = animations;
		animation._isForwards = info.isForwards;

		return animation;
	}

	private static parseKeyframe(info: KeyframeAnimationInfo, keyframe: KeyframeInfo, animations: Array<Object>, startDuration: number): number {
		let animation: Keyframe = {};
		for (let declaration of keyframe.declarations) {
			animation[declaration.property] = declaration.value;
		}

		let duration = keyframe.duration;
		if (duration === 0) {
			duration = 0.01;
		} else {
			duration = info.duration * duration - startDuration;
			startDuration += duration;
		}
		animation.duration = info.isReverse ? info.duration - duration : duration;
		animation.curve = keyframe.curve;
		animation.forceLayer = true;
		animation.valueSource = 'keyframe';
		animations.push(animation);

		return startDuration;
	}

	public get isPlaying(): boolean {
		return this._isPlaying;
	}

	public cancel() {
		if (!this.isPlaying) {
			Trace.write('Keyframe animation is already playing.', Trace.categories.Animation, Trace.messageType.warn);

			return;
		}

		this._isPlaying = false;
		for (let i = this._nativeAnimations.length - 1; i >= 0; i--) {
			let animation = this._nativeAnimations[i];
			if (animation.isPlaying) {
				animation.cancel();
			}
		}
		if (this._nativeAnimations.length > 0) {
			let animation = this._nativeAnimations[0];
			this._resetAnimationValues(this._target, animation);
		}
		this._resetAnimations();
	}

	public play(view: View): Promise<void> {
		if (this._isPlaying) {
			Trace.write('Keyframe animation is already playing.', Trace.categories.Animation, Trace.messageType.warn);

			return new Promise<void>((resolve) => {
				resolve();
			});
		}

		let animationFinishedPromise = new Promise<void>((resolve) => {
			this._resolve = resolve;
		});

		this._isPlaying = true;
		this._nativeAnimations = new Array<Animation>();
		this._target = view;

		if (this.delay !== 0) {
			setTimeout(() => this.animate(view, 0, this.iterations), this.delay);
		} else {
			this.animate(view, 0, this.iterations);
		}

		return animationFinishedPromise;
	}

	private animate(view: View, index: number, iterations: number) {
		if (!this._isPlaying) {
			return;
		}
		if (index === 0) {
			let animation = this.animations[0];

			if ('backgroundColor' in animation) {
				view.style[backgroundColorProperty.keyframe] = animation.backgroundColor;
			}
			if ('scale' in animation) {
				view.style[scaleXProperty.keyframe] = animation.scale.x;
				view.style[scaleYProperty.keyframe] = animation.scale.y;
			}
			if ('translate' in animation) {
				view.style[translateXProperty.keyframe] = animation.translate.x;
				view.style[translateYProperty.keyframe] = animation.translate.y;
			}
			if ('rotate' in animation) {
				view.style[rotateXProperty.keyframe] = animation.rotate.x;
				view.style[rotateYProperty.keyframe] = animation.rotate.y;
				view.style[rotateProperty.keyframe] = animation.rotate.z;
			}
			if ('opacity' in animation) {
				view.style[opacityProperty.keyframe] = animation.opacity;
			}
			if ('height' in animation) {
				view.style[heightProperty.keyframe] = animation.height;
			}
			if ('width' in animation) {
				view.style[widthProperty.keyframe] = animation.width;
			}

			setTimeout(() => this.animate(view, 1, iterations), 1);
		} else if (index < 0 || index >= this.animations.length) {
			iterations -= 1;
			if (iterations > 0) {
				this.animate(view, 0, iterations);
			} else {
				if (this._isForwards === false) {
					let animation = this.animations[this.animations.length - 1];
					this._resetAnimationValues(view, animation);
				}
				this._resolveAnimationFinishedPromise();
			}
		} else {
			let animation;
			const cachedAnimation = this._nativeAnimations[index - 1];

			if (cachedAnimation) {
				animation = cachedAnimation;
			} else {
				let animationDef = this.animations[index];
				(<any>animationDef).target = view;
				animation = new Animation([animationDef]);
				this._nativeAnimations.push(animation);
			}

			const isLastIteration = iterations - 1 <= 0;

			// Catch the animation cancel to prevent unhandled promise rejection warnings
			animation
				.play(isLastIteration)
				.then(
					() => {
						this.animate(view, index + 1, iterations);
					},
					(error: any) => {
						Trace.write(typeof error === 'string' ? error : error.message, Trace.categories.Animation, Trace.messageType.warn);
					}
				)
				.catch((error: any) => {
					Trace.write(typeof error === 'string' ? error : error.message, Trace.categories.Animation, Trace.messageType.warn);
				}); // tslint:disable-line
		}
	}

	public _resolveAnimationFinishedPromise() {
		this._nativeAnimations = new Array<Animation>();
		this._isPlaying = false;
		this._target = null;
		this._resolve();
	}

	public _resetAnimations() {
		this._nativeAnimations = new Array<Animation>();
		this._isPlaying = false;
		this._target = null;
	}

	private _resetAnimationValues(view: View, animation: Object) {
		if ('backgroundColor' in animation) {
			view.style[backgroundColorProperty.keyframe] = unsetValue;
		}
		if ('scale' in animation) {
			view.style[scaleXProperty.keyframe] = unsetValue;
			view.style[scaleYProperty.keyframe] = unsetValue;
		}
		if ('translate' in animation) {
			view.style[translateXProperty.keyframe] = unsetValue;
			view.style[translateYProperty.keyframe] = unsetValue;
		}
		if ('rotate' in animation) {
			view.style[rotateProperty.keyframe] = unsetValue;
		}
		if ('opacity' in animation) {
			view.style[opacityProperty.keyframe] = unsetValue;
		}
		if ('height' in animation) {
			view.style[heightProperty.keyframe] = unsetValue;
		}
		if ('width' in animation) {
			view.style[widthProperty.keyframe] = unsetValue;
		}
	}
}
