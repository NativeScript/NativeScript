import { AnimationDefinitionInternal, AnimationPromise, PropertyAnimation, AnimationBase, Properties } from './animation-common';
import { View } from '../core/view';
import { CubicBezierAnimationCurve } from './animation-interfaces';
import { Color } from '../../color';
import { Trace } from '../../trace';
import { opacityProperty, backgroundColorProperty, rotateProperty, rotateXProperty, rotateYProperty, translateXProperty, translateYProperty, scaleXProperty, scaleYProperty, heightProperty, widthProperty, PercentLength } from '../styling/style-properties';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { Device, Screen } from '../../platform';
import lazy from '../../utils/lazy';

export * from './animation-common';
export { KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './keyframe-animation';

let argbEvaluator: android.animation.ArgbEvaluator;
function ensureArgbEvaluator() {
	if (!argbEvaluator) {
		argbEvaluator = new android.animation.ArgbEvaluator();
	}
}

const easeIn = lazy(() => new android.view.animation.AccelerateInterpolator(1));
const easeOut = lazy(() => new android.view.animation.DecelerateInterpolator(1));
const easeInOut = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());
const linear = lazy(() => new android.view.animation.LinearInterpolator());
const bounce = lazy(() => new android.view.animation.BounceInterpolator());

export function _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator | android.view.animation.LinearInterpolator): android.view.animation.Interpolator {
	switch (curve) {
		case 'easeIn':
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to android.view.animation.AccelerateInterpolator(1).', Trace.categories.Animation);
			}

			return easeIn();
		case 'easeOut':
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to android.view.animation.DecelerateInterpolator(1).', Trace.categories.Animation);
			}

			return easeOut();
		case 'easeInOut':
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to android.view.animation.AccelerateDecelerateInterpolator().', Trace.categories.Animation);
			}

			return easeInOut();
		case 'linear':
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to android.view.animation.LinearInterpolator().', Trace.categories.Animation);
			}

			return linear();
		case 'spring':
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to android.view.animation.BounceInterpolator().', Trace.categories.Animation);
			}

			return bounce();
		case 'ease':
			return (<any>androidx).core.view.animation.PathInterpolatorCompat.create(0.25, 0.1, 0.25, 1.0);
		default:
			if (Trace.isEnabled()) {
				Trace.write('Animation curve resolved to original: ' + curve, Trace.categories.Animation);
			}
			if (curve instanceof CubicBezierAnimationCurve) {
				return (<any>androidx).core.view.animation.PathInterpolatorCompat.create(curve.x1, curve.y1, curve.x2, curve.y2);
			} else if (curve && (<any>curve).getInterpolation) {
				return <android.view.animation.Interpolator>curve;
			} else if (<any>curve instanceof android.view.animation.LinearInterpolator) {
				return <android.view.animation.Interpolator>curve;
			} else {
				throw new Error(`Invalid animation curve: ${curve}`);
			}
	}
}

function getAndroidRepeatCount(iterations: number): number {
	return iterations === Number.POSITIVE_INFINITY ? android.view.animation.Animation.INFINITE : iterations - 1;
}

function createObjectAnimator(nativeView: android.view.View, propertyName: string, value: number): android.animation.ObjectAnimator {
	const arr = Array.create('float', 1);
	arr[0] = value;

	return android.animation.ObjectAnimator.ofFloat(nativeView, propertyName, arr);
}

function createAnimationSet(animators: android.animation.ObjectAnimator[], iterations: number): android.animation.AnimatorSet {
	iterations = getAndroidRepeatCount(iterations);

	const animatorSet = new android.animation.AnimatorSet();
	const animatorsArray = Array.create(android.animation.Animator, animators.length);

	animators.forEach((animator, index) => {
		animatorsArray[index] = animator;

		//TODO: not sure if we have to do that for each animator
		animatorsArray[index].setRepeatCount(iterations);
	});

	animatorSet.playTogether(animatorsArray);
	animatorSet.setupStartValues();

	return animatorSet;
}

export class Animation extends AnimationBase {
	private _animatorListener: android.animation.Animator.AnimatorListener;
	private _nativeAnimatorsArray: any;
	private _animatorSet: android.animation.AnimatorSet;
	private _animators: Array<android.animation.Animator>;
	private _propertyUpdateCallbacks: Array<Function>;
	private _propertyResetCallbacks: Array<Function>;
	private _valueSource: 'animation' | 'keyframe';
	private _target: View;
	private _resetOnFinish = true;

	constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);

		this._valueSource = 'animation';
		if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
			this._valueSource = animationDefinitions[0].valueSource;
		}

		const that = new WeakRef(this);
		this._animatorListener = new android.animation.Animator.AnimatorListener({
			onAnimationStart: function (animator: android.animation.Animator): void {
				if (Trace.isEnabled()) {
					Trace.write('MainAnimatorListener.onAndroidAnimationStart(' + animator + ')', Trace.categories.Animation);
				}
			},
			onAnimationRepeat: function (animator: android.animation.Animator): void {
				if (Trace.isEnabled()) {
					Trace.write('MainAnimatorListener.onAnimationRepeat(' + animator + ')', Trace.categories.Animation);
				}
			},
			onAnimationEnd: function (animator: android.animation.Animator): void {
				if (Trace.isEnabled()) {
					Trace.write('MainAnimatorListener.onAnimationEnd(' + animator + ')', Trace.categories.Animation);
				}
				const thisRef = that?.get();
				if (thisRef) {
					thisRef._onAndroidAnimationEnd();
				}
			},
			onAnimationCancel: function (animator: android.animation.Animator): void {
				if (Trace.isEnabled()) {
					Trace.write('MainAnimatorListener.onAnimationCancel(' + animator + ')', Trace.categories.Animation);
				}
				const thisRef = that?.get();
				if (thisRef) {
					thisRef._onAndroidAnimationCancel();
				}
			},
		});
	}

	public play(resetOnFinish?: boolean): AnimationPromise {
		if (resetOnFinish !== undefined) {
			this._resetOnFinish = resetOnFinish;
		}

		if (this.isPlaying) {
			return this._rejectAlreadyPlaying();
		}

		const animationFinishedPromise = super.play();

		if (!this._animatorSet) {
			this._animators = new Array<android.animation.Animator>();
			this._propertyUpdateCallbacks = new Array<Function>();
			this._propertyResetCallbacks = new Array<Function>();

			for (let i = 0, length = this._propertyAnimations.length; i < length; i++) {
				this._createAnimators(this._propertyAnimations[i]);
			}

			this._nativeAnimatorsArray = Array.create(android.animation.Animator, this._animators.length);
			for (let i = 0, length = this._animators.length; i < length; i++) {
				this._nativeAnimatorsArray[i] = this._animators[i];
			}

			this._animatorSet = new android.animation.AnimatorSet();
			this._animatorSet.addListener(this._animatorListener);
		}
		this._play();
		return animationFinishedPromise;
	}

	public cancel(): void {
		if (!this.isPlaying) {
			Trace.write('Animation is not currently playing.', Trace.categories.Animation, Trace.messageType.warn);

			return;
		}

		Trace.write('Cancelling AnimatorSet.', Trace.categories.Animation);

		this._animatorSet.cancel();
	}

	public _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | android.view.animation.Interpolator): android.view.animation.Interpolator {
		return _resolveAnimationCurve(curve);
	}

	protected _play(): void {
		if (SDK_VERSION <= 23) {
			this._animatorSet = new android.animation.AnimatorSet();
			this._animatorSet.addListener(this._animatorListener);
		}

		if (this._animators.length > 0) {
			if (this._playSequentially) {
				this._animatorSet.playSequentially(this._nativeAnimatorsArray);
			} else {
				this._animatorSet.playTogether(this._nativeAnimatorsArray);
			}
		}

		if (Trace.isEnabled()) {
			Trace.write('Starting ' + this._nativeAnimatorsArray.length + ' animations ' + (this._playSequentially ? 'sequentially.' : 'together.'), Trace.categories.Animation);
		}

		this._animatorSet.setupStartValues();
		this._animatorSet.start();
	}

	private _onAndroidAnimationEnd() {
		// tslint:disable-line
		if (!this.isPlaying) {
			// It has been cancelled
			return;
		}

		this._propertyUpdateCallbacks.forEach((v) => v());
		this._resolveAnimationFinishedPromise();

		if (this._resetOnFinish && this._target) {
			this._target._removeAnimation(this);
		}
	}

	private _onAndroidAnimationCancel() {
		// tslint:disable-line
		this._propertyResetCallbacks.forEach((v) => v());
		this._resolveAnimationFinishedPromise();

		if (this._target) {
			this._target._removeAnimation(this);
		}
	}

	private _createAnimators(propertyAnimation: PropertyAnimation): void {
		if (!propertyAnimation.target.nativeViewProtected) {
			return;
		}

		if (Trace.isEnabled()) {
			Trace.write('Creating ObjectAnimator(s) for animation: ' + Animation._getAnimationInfo(propertyAnimation) + '...', Trace.categories.Animation);
		}

		if (propertyAnimation.target === null || propertyAnimation.target === undefined) {
			throw new Error(`Animation target cannot be null or undefined; property: ${propertyAnimation.property}; value: ${propertyAnimation.value};`);
		}

		if (propertyAnimation.property === null || propertyAnimation.property === undefined) {
			throw new Error(`Animation property cannot be null or undefined; target: ${propertyAnimation.target}; value: ${propertyAnimation.value};`);
		}

		if (propertyAnimation.value === null || propertyAnimation.value === undefined) {
			throw new Error(`Animation value cannot be null or undefined; target: ${propertyAnimation.target}; property: ${propertyAnimation.property};`);
		}

		this._target = propertyAnimation.target;

		const nativeView = <android.view.View>propertyAnimation.target.nativeViewProtected;
		const animators = new Array<android.animation.Animator>();
		const propertyUpdateCallbacks = new Array<Function>();
		const propertyResetCallbacks = new Array<Function>();
		let originalValue1;
		let originalValue2;
		let originalValue3;
		const density = layout.getDisplayDensity();

		const setLocal = this._valueSource === 'animation';
		const style = propertyAnimation.target.style;
		switch (propertyAnimation.property) {
			case Properties.opacity:
				opacityProperty._initDefaultNativeValue(style);

				originalValue1 = nativeView.getAlpha();
				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[setLocal ? opacityProperty.name : opacityProperty.keyframe] = propertyAnimation.value;
				});
				propertyResetCallbacks.push(() => {
					if (setLocal) {
						propertyAnimation.target.style[opacityProperty.name] = originalValue1;
					} else {
						propertyAnimation.target.style[opacityProperty.keyframe] = originalValue1;
					}
					if (propertyAnimation.target.nativeViewProtected) {
						propertyAnimation.target[opacityProperty.setNative](propertyAnimation.target.style.opacity);
					}
				});
				animators.push(createObjectAnimator(nativeView, 'alpha', propertyAnimation.value));
				break;

			case Properties.backgroundColor: {
				backgroundColorProperty._initDefaultNativeValue(style);

				ensureArgbEvaluator();
				originalValue1 = propertyAnimation.target.backgroundColor;
				const nativeArray = Array.create(java.lang.Object, 2);
				nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf((<Color>propertyAnimation.target.backgroundColor).argb) : java.lang.Integer.valueOf(-1);
				nativeArray[1] = java.lang.Integer.valueOf((<Color>propertyAnimation.value).argb);
				const animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
				animator.addUpdateListener(
					new android.animation.ValueAnimator.AnimatorUpdateListener({
						onAnimationUpdate(animator: android.animation.ValueAnimator) {
							const argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
							propertyAnimation.target.style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = new Color(argb);
						},
					}),
				);

				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = propertyAnimation.value;
				});
				propertyResetCallbacks.push(() => {
					if (setLocal) {
						propertyAnimation.target.style[backgroundColorProperty.name] = originalValue1;
					} else {
						propertyAnimation.target.style[backgroundColorProperty.keyframe] = originalValue1;
					}

					if (propertyAnimation.target.nativeViewProtected && propertyAnimation.target[backgroundColorProperty.setNative]) {
						propertyAnimation.target[backgroundColorProperty.setNative](propertyAnimation.target.style.backgroundColor);
					}
				});
				animators.push(animator);
				break;
			}
			case Properties.translate:
				translateXProperty._initDefaultNativeValue(style);
				translateYProperty._initDefaultNativeValue(style);

				originalValue1 = nativeView.getTranslationX() / density;
				originalValue2 = nativeView.getTranslationY() / density;

				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = propertyAnimation.value.x;
					propertyAnimation.target.style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = propertyAnimation.value.y;
				});

				propertyResetCallbacks.push(() => {
					if (setLocal) {
						propertyAnimation.target.style[translateXProperty.name] = originalValue1;
						propertyAnimation.target.style[translateYProperty.name] = originalValue2;
					} else {
						propertyAnimation.target.style[translateXProperty.keyframe] = originalValue1;
						propertyAnimation.target.style[translateYProperty.keyframe] = originalValue2;
					}

					if (propertyAnimation.target.nativeViewProtected) {
						propertyAnimation.target[translateXProperty.setNative](propertyAnimation.target.style.translateX);
						propertyAnimation.target[translateYProperty.setNative](propertyAnimation.target.style.translateY);
					}
				});

				animators.push(createAnimationSet([createObjectAnimator(nativeView, 'translationX', propertyAnimation.value.x * density), createObjectAnimator(nativeView, 'translationY', propertyAnimation.value.y * density)], propertyAnimation.iterations));
				break;

			case Properties.scale:
				scaleXProperty._initDefaultNativeValue(style);
				scaleYProperty._initDefaultNativeValue(style);

				originalValue1 = nativeView.getScaleX();
				originalValue2 = nativeView.getScaleY();

				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = propertyAnimation.value.x;
					propertyAnimation.target.style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = propertyAnimation.value.y;
				});

				propertyResetCallbacks.push(() => {
					if (setLocal) {
						propertyAnimation.target.style[scaleXProperty.name] = originalValue1;
						propertyAnimation.target.style[scaleYProperty.name] = originalValue2;
					} else {
						propertyAnimation.target.style[scaleXProperty.keyframe] = originalValue1;
						propertyAnimation.target.style[scaleYProperty.keyframe] = originalValue2;
					}

					if (propertyAnimation.target.nativeViewProtected) {
						propertyAnimation.target[scaleXProperty.setNative](propertyAnimation.target.style.scaleX);
						propertyAnimation.target[scaleYProperty.setNative](propertyAnimation.target.style.scaleY);
					}
				});

				animators.push(createAnimationSet([createObjectAnimator(nativeView, 'scaleX', propertyAnimation.value.x), createObjectAnimator(nativeView, 'scaleY', propertyAnimation.value.y)], propertyAnimation.iterations));
				break;

			case Properties.rotate:
				rotateProperty._initDefaultNativeValue(style);
				rotateXProperty._initDefaultNativeValue(style);
				rotateYProperty._initDefaultNativeValue(style);

				originalValue1 = nativeView.getRotationX();
				originalValue2 = nativeView.getRotationY();
				originalValue3 = nativeView.getRotation();

				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[setLocal ? rotateXProperty.name : rotateXProperty.keyframe] = propertyAnimation.value.x;
					propertyAnimation.target.style[setLocal ? rotateYProperty.name : rotateYProperty.keyframe] = propertyAnimation.value.y;
					propertyAnimation.target.style[setLocal ? rotateProperty.name : rotateProperty.keyframe] = propertyAnimation.value.z;
				});
				propertyResetCallbacks.push(() => {
					if (setLocal) {
						propertyAnimation.target.style[rotateXProperty.name] = originalValue1;
						propertyAnimation.target.style[rotateYProperty.name] = originalValue2;
						propertyAnimation.target.style[rotateProperty.name] = originalValue3;
					} else {
						propertyAnimation.target.style[rotateXProperty.keyframe] = originalValue1;
						propertyAnimation.target.style[rotateYProperty.keyframe] = originalValue2;
						propertyAnimation.target.style[rotateProperty.keyframe] = originalValue3;
					}

					if (propertyAnimation.target.nativeViewProtected) {
						propertyAnimation.target[rotateProperty.setNative](propertyAnimation.target.style.rotate);
						propertyAnimation.target[rotateXProperty.setNative](propertyAnimation.target.style.rotateX);
						propertyAnimation.target[rotateYProperty.setNative](propertyAnimation.target.style.rotateY);
					}
				});

				animators.push(createAnimationSet([createObjectAnimator(nativeView, 'rotationX', propertyAnimation.value.x), createObjectAnimator(nativeView, 'rotationY', propertyAnimation.value.y), createObjectAnimator(nativeView, 'rotation', propertyAnimation.value.z)], propertyAnimation.iterations));
				break;

			case Properties.width:
			case Properties.height: {
				const isVertical: boolean = propertyAnimation.property === 'height';
				const extentProperty = isVertical ? heightProperty : widthProperty;

				extentProperty._initDefaultNativeValue(style);
				const nativeArray = Array.create('float', 2);
				let toValue = propertyAnimation.value;
				const parent = propertyAnimation.target.parent as View;
				if (!parent) {
					throw new Error(`cannot animate ${propertyAnimation.property} on root view`);
				}
				const parentExtent: number = isVertical ? parent.getMeasuredHeight() : parent.getMeasuredWidth();
				toValue = PercentLength.toDevicePixels(toValue, parentExtent, parentExtent) / Screen.mainScreen.scale;
				const nativeHeight: number = isVertical ? nativeView.getHeight() : nativeView.getWidth();
				const targetStyle: string = setLocal ? extentProperty.name : extentProperty.keyframe;
				originalValue1 = nativeHeight / Screen.mainScreen.scale;
				nativeArray[0] = originalValue1;
				nativeArray[1] = toValue;
				const extentAnimator = android.animation.ValueAnimator.ofFloat(nativeArray);
				extentAnimator.addUpdateListener(
					new android.animation.ValueAnimator.AnimatorUpdateListener({
						onAnimationUpdate(animator: android.animation.ValueAnimator) {
							const argb = (<java.lang.Float>animator.getAnimatedValue()).floatValue();
							propertyAnimation.target.style[setLocal ? extentProperty.name : extentProperty.keyframe] = argb;
						},
					}),
				);
				propertyUpdateCallbacks.push(() => {
					propertyAnimation.target.style[targetStyle] = propertyAnimation.value;
				});
				propertyResetCallbacks.push(() => {
					propertyAnimation.target.style[targetStyle] = originalValue1;
					if (propertyAnimation.target.nativeViewProtected) {
						const setter = propertyAnimation.target[extentProperty.setNative];
						setter(propertyAnimation.target.style[propertyAnimation.property]);
					}
				});
				animators.push(extentAnimator);
				break;
			}
			default:
				throw new Error(`Animating property '${propertyAnimation.property}' is unsupported`);
		}

		for (let i = 0, length = animators.length; i < length; i++) {
			// Duration
			if (propertyAnimation.duration !== undefined) {
				animators[i].setDuration(propertyAnimation.duration);
			}

			// Delay
			if (propertyAnimation.delay !== undefined) {
				animators[i].setStartDelay(propertyAnimation.delay);
			}

			// Repeat Count
			if (propertyAnimation.iterations !== undefined && animators[i] instanceof android.animation.ValueAnimator) {
				(<android.animation.ValueAnimator>animators[i]).setRepeatCount(getAndroidRepeatCount(propertyAnimation.iterations));
			}

			// Interpolator
			if (propertyAnimation.curve !== undefined) {
				animators[i].setInterpolator(propertyAnimation.curve);
			}

			if (Trace.isEnabled()) {
				Trace.write('Animator created: ' + animators[i], Trace.categories.Animation);
			}
		}

		this._animators = this._animators.concat(animators);
		this._propertyUpdateCallbacks = this._propertyUpdateCallbacks.concat(propertyUpdateCallbacks);
		this._propertyResetCallbacks = this._propertyResetCallbacks.concat(propertyResetCallbacks);
	}
}
