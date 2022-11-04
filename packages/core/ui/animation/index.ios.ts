// Types
import { AnimationDefinitionInternal, AnimationPromise, IOSView, PropertyAnimation, PropertyAnimationInfo } from './animation-common';
import { View } from '../core/view';

// Requires
import { AnimationBase, Properties, CubicBezierAnimationCurve } from './animation-common';
import { Trace } from '../../trace';
import { opacityProperty, backgroundColorProperty, rotateProperty, rotateXProperty, rotateYProperty, translateXProperty, translateYProperty, scaleXProperty, scaleYProperty, heightProperty, widthProperty, PercentLength } from '../styling/style-properties';

import { iOSNativeHelper } from '../../utils/native-helper';

import { Screen } from '../../platform';

export * from './animation-common';
export { KeyframeAnimation, KeyframeAnimationInfo, KeyframeDeclaration, KeyframeInfo } from './keyframe-animation';

const _transform = '_transform';
const _skip = '_skip';

const FLT_MAX = 340282346638528859811704183484516925440.0;

class AnimationInfo {
	public propertyNameToAnimate: string;
	public subPropertiesToAnimate?: string[];
	public fromValue: any;
	public toValue: any;
	public duration: number;
	public repeatCount: number;
	public delay: number;
}

@NativeClass
class AnimationDelegateImpl extends NSObject implements CAAnimationDelegate {
	public nextAnimation: Function;

	// The CAAnimationDelegate protocol has been introduced in the iOS 10 SDK
	static ObjCProtocols = (<any>global).CAAnimationDelegate ? [(<any>global).CAAnimationDelegate] : [];

	private _finishedCallback: Function;
	private _propertyAnimation: PropertyAnimationInfo;
	private _valueSource: 'animation' | 'keyframe';

	public static initWithFinishedCallback(finishedCallback: Function, propertyAnimation: PropertyAnimationInfo, valueSource: 'animation' | 'keyframe'): AnimationDelegateImpl {
		const delegate = <AnimationDelegateImpl>AnimationDelegateImpl.new();
		delegate._finishedCallback = finishedCallback;
		delegate._propertyAnimation = propertyAnimation;
		delegate._valueSource = valueSource;

		return delegate;
	}

	animationDidStart(anim: CAAnimation): void {
		const value = this._propertyAnimation.value;
		const setLocal = this._valueSource === 'animation';
		const targetStyle = this._propertyAnimation.target.style;

		(<IOSView>this._propertyAnimation.target)._suspendPresentationLayerUpdates();

		switch (this._propertyAnimation.property) {
			case Properties.backgroundColor:
				targetStyle[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = value;
				break;
			case Properties.opacity:
				targetStyle[setLocal ? opacityProperty.name : opacityProperty.keyframe] = value;
				break;
			case Properties.rotate:
				targetStyle[setLocal ? rotateXProperty.name : rotateXProperty.keyframe] = value.x;
				targetStyle[setLocal ? rotateYProperty.name : rotateYProperty.keyframe] = value.y;
				targetStyle[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value.z;
				break;
			case Properties.translate:
				targetStyle[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.x;
				targetStyle[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.y;
				break;
			case Properties.height:
				targetStyle[setLocal ? heightProperty.name : heightProperty.keyframe] = value;
				break;
			case Properties.width:
				targetStyle[setLocal ? widthProperty.name : widthProperty.keyframe] = value;
				break;
			case Properties.scale:
				targetStyle[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.x === 0 ? 0.001 : value.x;
				targetStyle[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.y === 0 ? 0.001 : value.y;
				break;
			case _transform:
				if (value[Properties.translate] !== undefined) {
					targetStyle[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value[Properties.translate].x;
					targetStyle[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value[Properties.translate].y;
				}
				if (value[Properties.rotate] !== undefined) {
					targetStyle[setLocal ? rotateXProperty.name : rotateXProperty.keyframe] = value[Properties.rotate].x;
					targetStyle[setLocal ? rotateYProperty.name : rotateYProperty.keyframe] = value[Properties.rotate].y;
					targetStyle[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value[Properties.rotate].z;
				}
				if (value[Properties.scale] !== undefined) {
					const x = value[Properties.scale].x;
					const y = value[Properties.scale].y;
					targetStyle[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = x === 0 ? 0.001 : x;
					targetStyle[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = y === 0 ? 0.001 : y;
				}
				break;
		}

		(<IOSView>this._propertyAnimation.target)._resumePresentationLayerUpdates();
	}

	public animationDidStopFinished(anim: CAAnimation, finished: boolean): void {
		if (this._finishedCallback) {
			this._finishedCallback(!finished);
		}
		if (finished && this.nextAnimation) {
			this.nextAnimation();
		}
	}
}

export function _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | CAMediaTimingFunction): CAMediaTimingFunction | string {
	switch (curve) {
		case 'easeIn':
			return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseIn);
		case 'easeOut':
			return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseOut);
		case 'easeInOut':
			return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut);
		case 'linear':
			return CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
		case 'spring':
			return curve;
		case 'ease':
			return CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1.0);
		default:
			if (curve instanceof CAMediaTimingFunction) {
				return curve;
			} else if (curve instanceof CubicBezierAnimationCurve) {
				const animationCurve = <CubicBezierAnimationCurve>curve;

				return CAMediaTimingFunction.functionWithControlPoints(animationCurve.x1, animationCurve.y1, animationCurve.x2, animationCurve.y2);
			} else {
				console.error(`Invalid animation curve: ${curve}`);
			}
	}
}

export class Animation extends AnimationBase {
	private _iOSAnimationFunction: Function;
	private _finishedAnimations: number;
	private _cancelledAnimations: number;
	private _mergedPropertyAnimations: Array<PropertyAnimationInfo>;
	private _valueSource: 'animation' | 'keyframe';

	constructor(animationDefinitions: Array<AnimationDefinitionInternal>, playSequentially?: boolean) {
		super(animationDefinitions, playSequentially);

		this._valueSource = 'animation';
		if (animationDefinitions.length > 0 && animationDefinitions[0].valueSource !== undefined) {
			this._valueSource = animationDefinitions[0].valueSource;
		}

		if (!playSequentially) {
			if (Trace.isEnabled()) {
				Trace.write('Non-merged Property Animations: ' + this._propertyAnimations.length, Trace.categories.Animation);
			}
			this._mergedPropertyAnimations = Animation._mergeAffineTransformAnimations(this._propertyAnimations);
			if (Trace.isEnabled()) {
				Trace.write('Merged Property Animations: ' + this._mergedPropertyAnimations.length, Trace.categories.Animation);
			}
		} else {
			this._mergedPropertyAnimations = this._propertyAnimations;
		}

		const that = this;
		const animationFinishedCallback = (cancelled: boolean) => {
			if (that._playSequentially) {
				// This function will be called by the last animation when done or by another animation if the user cancels them halfway through.
				if (cancelled) {
					that._rejectAnimationFinishedPromise();
				} else {
					that._resolveAnimationFinishedPromise();
				}
			} else {
				// This callback will be called by each INDIVIDUAL animation when it finishes or is cancelled.
				if (cancelled) {
					that._cancelledAnimations++;
				} else {
					that._finishedAnimations++;
				}

				if (that._cancelledAnimations > 0 && that._cancelledAnimations + that._finishedAnimations === that._mergedPropertyAnimations.length) {
					if (Trace.isEnabled()) {
						Trace.write(that._cancelledAnimations + ' animations cancelled.', Trace.categories.Animation);
					}
					that._rejectAnimationFinishedPromise();
				} else if (that._finishedAnimations === that._mergedPropertyAnimations.length) {
					if (Trace.isEnabled()) {
						Trace.write(that._finishedAnimations + ' animations finished.', Trace.categories.Animation);
					}
					that._resolveAnimationFinishedPromise();
				}
			}
		};

		this._iOSAnimationFunction = Animation._createiOSAnimationFunction(this._mergedPropertyAnimations, 0, this._playSequentially, this._valueSource, animationFinishedCallback);
	}

	public play(): AnimationPromise {
		if (this.isPlaying) {
			return this._rejectAlreadyPlaying();
		}

		const animationFinishedPromise = super.play();
		this._finishedAnimations = 0;
		this._cancelledAnimations = 0;
		this._iOSAnimationFunction();

		return animationFinishedPromise;
	}

	public cancel(): void {
		if (!this.isPlaying) {
			Trace.write('Animation is not currently playing.', Trace.categories.Animation, Trace.messageType.warn);

			return;
		}

		let i = 0;
		const length = this._mergedPropertyAnimations.length;
		for (; i < length; i++) {
			const propertyAnimation = this._mergedPropertyAnimations[i];
			propertyAnimation.target.nativeViewProtected.layer.removeAllAnimations();
			if (propertyAnimation._propertyResetCallback) {
				propertyAnimation._propertyResetCallback(propertyAnimation._originalValue, this._valueSource);
			}
		}
	}

	public _resolveAnimationCurve(curve: string | CubicBezierAnimationCurve | CAMediaTimingFunction): CAMediaTimingFunction | string {
		return _resolveAnimationCurve(curve);
	}

	private static _createiOSAnimationFunction(propertyAnimations: Array<PropertyAnimation>, index: number, playSequentially: boolean, valueSource: 'animation' | 'keyframe', finishedCallback: (cancelled?: boolean) => void): Function {
		return (cancelled?: boolean) => {
			if (cancelled && finishedCallback) {
				if (Trace.isEnabled()) {
					Trace.write('Animation ' + (index - 1).toString() + ' was cancelled. Will skip the rest of animations and call finishedCallback(true).', Trace.categories.Animation);
				}
				finishedCallback(cancelled);

				return;
			}

			const animation = propertyAnimations[index];
			const args = Animation._getNativeAnimationArguments(animation, valueSource);

			if (animation.curve === 'spring') {
				Animation._createNativeSpringAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
			} else {
				Animation._createNativeAnimation(propertyAnimations, index, playSequentially, args, animation, valueSource, finishedCallback);
			}
		};
	}

	private static _getNativeAnimationArguments(animation: PropertyAnimationInfo, valueSource: 'animation' | 'keyframe'): AnimationInfo {
		const view = animation.target;
		const style = view.style;
		const nativeView = <UIView>view.nativeViewProtected;
		const parent = view.parent as View;

		let propertyNameToAnimate = animation.property;
		let subPropertyNameToAnimate;
		let toValue = animation.value;
		let fromValue;
		if (nativeView?.layer) {
			const setLocal = valueSource === 'animation';

			switch (animation.property) {
				case Properties.backgroundColor:
					animation._originalValue = view.backgroundColor;
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? backgroundColorProperty.name : backgroundColorProperty.keyframe] = value;
					};
					fromValue = nativeView.layer.backgroundColor;
					if (nativeView instanceof UILabel) {
						nativeView.setValueForKey(UIColor.clearColor, 'backgroundColor');
					}
					toValue = toValue.CGColor;
					break;
				case Properties.opacity:
					animation._originalValue = view.opacity;
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? opacityProperty.name : opacityProperty.keyframe] = value;
					};
					fromValue = nativeView.layer.opacity;
					break;
				case Properties.rotate:
					animation._originalValue = {
						x: view.rotateX,
						y: view.rotateY,
						z: view.rotate,
					};
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value.z;
						style[setLocal ? rotateXProperty.name : rotateXProperty.keyframe] = value.x;
						style[setLocal ? rotateYProperty.name : rotateYProperty.keyframe] = value.y;
					};

					propertyNameToAnimate = 'transform.rotation';
					subPropertyNameToAnimate = ['x', 'y', 'z'];
					fromValue = {
						x: nativeView.layer.valueForKeyPath('transform.rotation.x'),
						y: nativeView.layer.valueForKeyPath('transform.rotation.y'),
						z: nativeView.layer.valueForKeyPath('transform.rotation.z'),
					};

					if (animation.target.rotateX !== undefined && animation.target.rotateX !== 0 && Math.floor(toValue / 360) - toValue / 360 === 0) {
						fromValue.x = (animation.target.rotateX * Math.PI) / 180;
					}
					if (animation.target.rotateY !== undefined && animation.target.rotateY !== 0 && Math.floor(toValue / 360) - toValue / 360 === 0) {
						fromValue.y = (animation.target.rotateY * Math.PI) / 180;
					}
					if (animation.target.rotate !== undefined && animation.target.rotate !== 0 && Math.floor(toValue / 360) - toValue / 360 === 0) {
						fromValue.z = (animation.target.rotate * Math.PI) / 180;
					}

					// Respect only value.z for back-compat until 3D rotations are implemented
					toValue = {
						x: (toValue.x * Math.PI) / 180,
						y: (toValue.y * Math.PI) / 180,
						z: (toValue.z * Math.PI) / 180,
					};
					break;
				case Properties.translate:
					animation._originalValue = {
						x: view.translateX,
						y: view.translateY,
					};
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.x;
						style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.y;
					};
					propertyNameToAnimate = 'transform';
					fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
					toValue = NSValue.valueWithCATransform3D(CATransform3DTranslate(nativeView.layer.transform, toValue.x, toValue.y, 0));
					break;
				case Properties.scale:
					if (toValue.x === 0) {
						toValue.x = 0.001;
					}
					if (toValue.y === 0) {
						toValue.y = 0.001;
					}
					animation._originalValue = { x: view.scaleX, y: view.scaleY };
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.x;
						style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.y;
					};
					propertyNameToAnimate = 'transform';
					fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
					toValue = NSValue.valueWithCATransform3D(CATransform3DScale(nativeView.layer.transform, toValue.x, toValue.y, 1));
					break;
				case _transform:
					fromValue = NSValue.valueWithCATransform3D(nativeView.layer.transform);
					animation._originalValue = {
						xs: view.scaleX,
						ys: view.scaleY,
						xt: view.translateX,
						yt: view.translateY,
						rx: view.rotateX,
						ry: view.rotateY,
						rz: view.rotate,
					};
					animation._propertyResetCallback = (value, valueSource) => {
						style[setLocal ? translateXProperty.name : translateXProperty.keyframe] = value.xt;
						style[setLocal ? translateYProperty.name : translateYProperty.keyframe] = value.yt;
						style[setLocal ? scaleXProperty.name : scaleXProperty.keyframe] = value.xs;
						style[setLocal ? scaleYProperty.name : scaleYProperty.keyframe] = value.ys;
						style[setLocal ? rotateXProperty.name : rotateXProperty.keyframe] = value.rx;
						style[setLocal ? rotateYProperty.name : rotateYProperty.keyframe] = value.ry;
						style[setLocal ? rotateProperty.name : rotateProperty.keyframe] = value.rz;
					};
					propertyNameToAnimate = 'transform';
					toValue = NSValue.valueWithCATransform3D(Animation._createNativeAffineTransform(animation));
					break;
				case Properties.width:
				case Properties.height: {
					const direction: string = animation.property;
					const isHeight: boolean = direction === 'height';
					propertyNameToAnimate = 'bounds';
					if (!parent) {
						console.error(`cannot animate ${direction} on root view`);
					}
					const parentExtent: number = isHeight ? parent.getMeasuredHeight() : parent.getMeasuredWidth();
					const asNumber = PercentLength.toDevicePixels(PercentLength.parse(toValue), parentExtent, parentExtent) / Screen.mainScreen.scale;
					const currentBounds = nativeView.layer.bounds;
					const extentX = isHeight ? currentBounds.size.width : asNumber;
					const extentY = isHeight ? asNumber : currentBounds.size.height;
					fromValue = NSValue.valueWithCGRect(currentBounds);
					toValue = NSValue.valueWithCGRect(CGRectMake(currentBounds.origin.x, currentBounds.origin.y, extentX, extentY));
					animation._originalValue = view.height;
					animation._propertyResetCallback = (value, valueSource) => {
						const prop = isHeight ? heightProperty : widthProperty;
						style[setLocal ? prop.name : prop.keyframe] = value;
					};
					break;
				}
				default:
					console.error(`Animating property '${animation.property}' is unsupported`);
			}
		}

		let duration = 0.3;
		if (animation.duration !== undefined) {
			duration = animation.duration / 1000.0;
		}

		let delay = undefined;
		if (animation.delay) {
			delay = animation.delay / 1000.0;
		}

		let repeatCount = undefined;
		if (animation.iterations !== undefined) {
			if (animation.iterations === Number.POSITIVE_INFINITY) {
				repeatCount = FLT_MAX;
			} else {
				repeatCount = animation.iterations;
			}
		}

		return {
			propertyNameToAnimate: propertyNameToAnimate,
			fromValue: fromValue,
			subPropertiesToAnimate: subPropertyNameToAnimate,
			toValue: toValue,
			duration: duration,
			repeatCount: repeatCount,
			delay: delay,
		};
	}

	private static _createNativeAnimation(propertyAnimations: Array<PropertyAnimation>, index: number, playSequentially: boolean, args: AnimationInfo, animation: PropertyAnimation, valueSource: 'animation' | 'keyframe', finishedCallback: (cancelled?: boolean) => void) {
		const nativeView = <UIView>animation.target.nativeViewProtected;
		if (nativeView?.layer) {
			let nativeAnimation;

			if (args.subPropertiesToAnimate) {
				nativeAnimation = this._createGroupAnimation(args, animation);
			} else {
				nativeAnimation = this._createBasicAnimation(args, animation);
			}

			const animationDelegate = AnimationDelegateImpl.initWithFinishedCallback(finishedCallback, animation, valueSource);
			nativeAnimation.setValueForKey(animationDelegate, 'delegate');

			nativeView.layer.addAnimationForKey(nativeAnimation, args.propertyNameToAnimate);

			let callback = undefined;
			if (index + 1 < propertyAnimations.length) {
				callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, valueSource, finishedCallback);
				if (!playSequentially) {
					callback();
				} else {
					animationDelegate.nextAnimation = callback;
				}
			}
		}
	}

	private static _createGroupAnimation(args: AnimationInfo, animation: PropertyAnimation) {
		const groupAnimation = CAAnimationGroup.new();
		groupAnimation.duration = args.duration;
		if (args.repeatCount !== undefined) {
			groupAnimation.repeatCount = args.repeatCount;
		}
		if (args.delay !== undefined) {
			groupAnimation.beginTime = CACurrentMediaTime() + args.delay;
		}
		if (animation.curve !== undefined) {
			groupAnimation.timingFunction = animation.curve;
		}
		const animations = NSMutableArray.alloc<CAAnimation>().initWithCapacity(3);

		args.subPropertiesToAnimate.forEach((property) => {
			const basicAnimationArgs = { ...args, duration: undefined, repeatCount: undefined, delay: undefined, curve: undefined };
			basicAnimationArgs.propertyNameToAnimate = `${args.propertyNameToAnimate}.${property}`;
			basicAnimationArgs.fromValue = args.fromValue[property];
			basicAnimationArgs.toValue = args.toValue[property];

			const basicAnimation = this._createBasicAnimation(basicAnimationArgs, animation);
			animations.addObject(basicAnimation);
		});

		groupAnimation.animations = animations;

		return groupAnimation;
	}

	private static _createBasicAnimation(args: AnimationInfo, animation: PropertyAnimation) {
		const basicAnimation = CABasicAnimation.animationWithKeyPath(args.propertyNameToAnimate);
		basicAnimation.fromValue = args.fromValue;
		basicAnimation.toValue = args.toValue;
		basicAnimation.duration = args.duration;
		if (args.repeatCount !== undefined) {
			basicAnimation.repeatCount = args.repeatCount;
		}
		if (args.delay !== undefined) {
			basicAnimation.beginTime = CACurrentMediaTime() + args.delay;
		}
		if (animation.curve !== undefined) {
			basicAnimation.timingFunction = animation.curve;
		}

		return basicAnimation;
	}

	private static _createNativeSpringAnimation(propertyAnimations: Array<PropertyAnimationInfo>, index: number, playSequentially: boolean, args: AnimationInfo, animation: PropertyAnimationInfo, valueSource: 'animation' | 'keyframe', finishedCallback: (cancelled?: boolean) => void) {
		const nativeView = <UIView>animation.target.nativeViewProtected;

		let callback = undefined;
		let nextAnimation;
		if (index + 1 < propertyAnimations.length) {
			callback = Animation._createiOSAnimationFunction(propertyAnimations, index + 1, playSequentially, valueSource, finishedCallback);
			if (!playSequentially) {
				callback();
			} else {
				nextAnimation = callback;
			}
		}

		let delay = 0;
		if (args.delay) {
			delay = args.delay;
		}

		UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
			args.duration,
			delay,
			0.2,
			0,
			UIViewAnimationOptions.CurveLinear,
			() => {
				if (args.repeatCount !== undefined) {
					UIView.setAnimationRepeatCount(args.repeatCount);
				}

				switch (animation.property) {
					case Properties.backgroundColor:
						animation.target.backgroundColor = args.toValue;
						break;
					case Properties.opacity:
						animation.target.opacity = args.toValue;
						break;
					case Properties.height:
					case Properties.width:
						animation._originalValue = animation.target[animation.property];
						nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
						animation._propertyResetCallback = function (value) {
							animation.target[animation.property] = value;
						};
						break;
					case _transform:
						animation._originalValue = nativeView.layer.transform;
						nativeView.layer.setValueForKey(args.toValue, args.propertyNameToAnimate);
						animation._propertyResetCallback = function (value) {
							nativeView.layer.transform = value;
						};
						break;
				}
			},
			function (animationDidFinish: boolean) {
				if (animationDidFinish) {
					if (animation.property === _transform) {
						if (animation.value[Properties.translate] !== undefined) {
							animation.target.translateX = animation.value[Properties.translate].x;
							animation.target.translateY = animation.value[Properties.translate].y;
						}
						if (animation.value[Properties.rotate] !== undefined) {
							animation.target.rotateX = animation.value[Properties.rotate].x;
							animation.target.rotateY = animation.value[Properties.rotate].y;
							animation.target.rotate = animation.value[Properties.rotate].z;
						}
						if (animation.value[Properties.scale] !== undefined) {
							animation.target.scaleX = animation.value[Properties.scale].x;
							animation.target.scaleY = animation.value[Properties.scale].y;
						}
					}
				} else {
					if (animation._propertyResetCallback) {
						animation._propertyResetCallback(animation._originalValue);
					}
				}
				if (finishedCallback) {
					const cancelled = !animationDidFinish;
					finishedCallback(cancelled);
				}
				if (animationDidFinish && nextAnimation) {
					nextAnimation();
				}
			}
		);
	}

	private static _createNativeAffineTransform(animation: PropertyAnimation): CATransform3D {
		const value = animation.value;
		let result: CATransform3D = CATransform3DIdentity;

		if (value[Properties.translate] !== undefined) {
			const x = value[Properties.translate].x;
			const y = value[Properties.translate].y;
			result = CATransform3DTranslate(result, x, y, 0);
		}

		if (value[Properties.scale] !== undefined) {
			const x = value[Properties.scale].x;
			const y = value[Properties.scale].y;
			result = CATransform3DScale(result, x === 0 ? 0.001 : x, y === 0 ? 0.001 : y, 1);
		}

		return result;
	}

	private static _isAffineTransform(property: string): boolean {
		return property === _transform || property === Properties.translate || property === Properties.scale;
	}

	private static _canBeMerged(animation1: PropertyAnimation, animation2: PropertyAnimation) {
		const result = Animation._isAffineTransform(animation1.property) && Animation._isAffineTransform(animation2.property) && animation1.target === animation2.target && animation1.duration === animation2.duration && animation1.delay === animation2.delay && animation1.iterations === animation2.iterations && animation1.curve === animation2.curve;

		return result;
	}

	private static _mergeAffineTransformAnimations(propertyAnimations: Array<PropertyAnimation>): Array<PropertyAnimation> {
		const result = new Array<PropertyAnimation>();

		let i = 0;
		let j;
		const length = propertyAnimations.length;
		for (; i < length; i++) {
			if (propertyAnimations[i][_skip]) {
				continue;
			}

			if (!Animation._isAffineTransform(propertyAnimations[i].property)) {
				// This is not an affine transform animation, so there is nothing to merge.
				result.push(propertyAnimations[i]);
			} else {
				// This animation has not been merged anywhere. Create a new transform animation.
				// The value becomes a JSON object combining all affine transforms together like this:
				// {
				//    translate: {x: 100, y: 100 },
				//    rotate: 90,
				//    scale: {x: 2, y: 2 }
				// }
				const newTransformAnimation: PropertyAnimation = {
					target: propertyAnimations[i].target,
					property: _transform,
					value: {},
					duration: propertyAnimations[i].duration,
					delay: propertyAnimations[i].delay,
					iterations: propertyAnimations[i].iterations,
					curve: propertyAnimations[i].curve,
				};
				if (Trace.isEnabled()) {
					Trace.write('Curve: ' + propertyAnimations[i].curve, Trace.categories.Animation);
				}
				newTransformAnimation.value[propertyAnimations[i].property] = propertyAnimations[i].value;
				if (Trace.isEnabled()) {
					Trace.write('Created new transform animation: ' + Animation._getAnimationInfo(newTransformAnimation), Trace.categories.Animation);
				}

				// Merge all compatible affine transform animations to the right into this new animation.
				j = i + 1;
				if (j < length) {
					for (; j < length; j++) {
						if (Animation._canBeMerged(propertyAnimations[i], propertyAnimations[j])) {
							if (Trace.isEnabled()) {
								Trace.write('Merging animations: ' + Animation._getAnimationInfo(newTransformAnimation) + ' + ' + Animation._getAnimationInfo(propertyAnimations[j]) + ';', Trace.categories.Animation);
							}
							newTransformAnimation.value[propertyAnimations[j].property] = propertyAnimations[j].value;
							// Mark that it has been merged so we can skip it on our outer loop.
							propertyAnimations[j][_skip] = true;
						}
					}
				}

				result.push(newTransformAnimation);
			}
		}

		return result;
	}
}

export function _getTransformMismatchErrorMessage(view: View): string {
	const expectedTransform = calculateTransform(view);
	const expectedTransformString = getCATransform3DString(expectedTransform);
	const actualTransformString = getCATransform3DString(view.nativeViewProtected.layer.transform);

	if (actualTransformString !== expectedTransformString) {
		return 'View and Native transforms do not match.\nActual: ' + actualTransformString + ';\nExpected: ' + expectedTransformString;
	}

	return undefined;
}

function calculateTransform(view: View): CATransform3D {
	const scaleX = view.scaleX || 1e-6;
	const scaleY = view.scaleY || 1e-6;
	const perspective = view.perspective || 300;

	// Order is important: translate, rotate, scale
	let expectedTransform = new CATransform3D(CATransform3DIdentity);

	// Only set perspective if there is 3D rotation
	if (view.rotateX || view.rotateY) {
		expectedTransform.m34 = -1 / perspective;
	}

	expectedTransform = CATransform3DTranslate(expectedTransform, view.translateX, view.translateY, 0);
	expectedTransform = iOSNativeHelper.applyRotateTransform(expectedTransform, view.rotateX, view.rotateY, view.rotate);
	expectedTransform = CATransform3DScale(expectedTransform, scaleX, scaleY, 1);

	return expectedTransform;
}

function getCATransform3DString(t: CATransform3D) {
	return `[
    ${t.m11}, ${t.m12}, ${t.m13}, ${t.m14},
    ${t.m21}, ${t.m22}, ${t.m23}, ${t.m24},
    ${t.m31}, ${t.m32}, ${t.m33}, ${t.m34},
    ${t.m41}, ${t.m42}, ${t.m43}, ${t.m44}]`;
}
