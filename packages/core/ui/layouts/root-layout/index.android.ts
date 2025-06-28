import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { TransitionAnimation, ShadeCoverOptions } from '.';
import { parseLinearGradient } from '../../../css/parser';
import { LinearGradient } from '../../styling/linear-gradient';
import { layout } from '../../../utils';

export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	insertChild(view: View, atIndex: number): boolean {
		if (super.insertChild(view, atIndex)) {
			if (!view.hasGestureObservers()) {
				// block tap events from going through to layers behind the view
				if (view.nativeViewProtected) {
					view.nativeViewProtected.setOnTouchListener(
						new android.view.View.OnTouchListener({
							onTouch: function (view, event) {
								return true;
							},
						}),
					);
				}
			}
			return true;
		}
		return false;
	}
	removeChild(view: View): void {
		if (view.hasGestureObservers() && view.nativeViewProtected) {
			view.nativeViewProtected.setOnTouchListener(null);
		}
		super.removeChild(view);
	}

	protected _bringToFront(view: View) {
		(<android.view.View>view.nativeViewProtected).bringToFront();
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const options = <TransitionAnimation>{
			...defaultShadeCoverOptions.animation.enterFrom,
			...shadeOptions?.animation?.enterFrom,
		};
		const nativeView: android.view.View = view?.nativeViewProtected;

		if (nativeView) {
			nativeView.setAlpha(options.opacity);
			nativeView.setScaleX(float(options.scaleX));
			nativeView.setScaleY(float(options.scaleY));
			nativeView.setTranslationX(layout.toDevicePixels(options.translateX));
			nativeView.setTranslationY(layout.toDevicePixels(options.translateY));
			nativeView.setRotation(float(options.rotate));
		}
	}

	protected _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const options = <ShadeCoverOptions>{
			...defaultShadeCoverOptions,
			...shadeOptions,
		};
		const duration = options.animation?.enterFrom?.duration || defaultShadeCoverOptions.animation.enterFrom.duration;
		const isBackgroundGradient = options.color && options.color.startsWith('linear-gradient');

		if (isBackgroundGradient) {
			if (view.backgroundColor) {
				view.backgroundColor = undefined;
			}
			const parsedGradient = parseLinearGradient(options.color);
			view.backgroundImage = LinearGradient.parse(parsedGradient.value);
		} else {
			if (view.backgroundImage) {
				view.backgroundImage = undefined;
			}
		}

		return this._playAnimation(
			this._getAnimationSet(
				view,
				{
					translateX: 0,
					translateY: 0,
					scaleX: 1,
					scaleY: 1,
					rotate: 0,
					opacity: options.opacity,
				},
				isBackgroundGradient ? null : options.color,
			),
			duration,
		);
	}

	protected _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const exitState = <TransitionAnimation>{
			...defaultShadeCoverOptions.animation.exitTo,
			...shadeOptions?.animation?.exitTo,
		};
		return this._playAnimation(this._getAnimationSet(view, exitState), exitState?.duration);
	}

	private _getAnimationSet(view: View, shadeCoverAnimation: TransitionAnimation, backgroundColor?: string): Array<android.animation.Animator> {
		const animationSet = Array.create(android.animation.Animator, backgroundColor ? 7 : 6);
		animationSet[0] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationX', [layout.toDevicePixels(shadeCoverAnimation.translateX)]);
		animationSet[1] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationY', [layout.toDevicePixels(shadeCoverAnimation.translateY)]);
		animationSet[2] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleX', [shadeCoverAnimation.scaleX]);
		animationSet[3] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleY', [shadeCoverAnimation.scaleY]);
		animationSet[4] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'rotation', [shadeCoverAnimation.rotate]);
		animationSet[5] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'alpha', [shadeCoverAnimation.opacity]);

		if (backgroundColor) {
			animationSet[6] = this._getBackgroundColorAnimator(view, backgroundColor);
		}
		return animationSet;
	}

	private _getBackgroundColorAnimator(view: View, backgroundColor: string): android.animation.ValueAnimator {
		const nativeArray = Array.create(java.lang.Object, 2);

		nativeArray[0] = java.lang.Integer.valueOf(view.backgroundColor ? (<Color>view.backgroundColor).argb : -1);
		nativeArray[1] = java.lang.Integer.valueOf(backgroundColor ? new Color(backgroundColor).argb : -1);
		const backgroundColorAnimator = android.animation.ValueAnimator.ofObject(new android.animation.ArgbEvaluator(), nativeArray);
		backgroundColorAnimator.addUpdateListener(
			new android.animation.ValueAnimator.AnimatorUpdateListener({
				onAnimationUpdate(animator: android.animation.ValueAnimator) {
					const argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
					view.backgroundColor = new Color(argb);
				},
			}),
		);
		return backgroundColorAnimator;
	}

	private _playAnimation(animationSet: Array<android.animation.Animator>, duration: number = 0): Promise<void> {
		return new Promise((resolve) => {
			const animatorSet = new android.animation.AnimatorSet();
			animatorSet.playTogether(animationSet);
			animatorSet.setDuration(duration);
			animatorSet.addListener(
				new android.animation.Animator.AnimatorListener({
					onAnimationStart: function (animator: android.animation.Animator): void {},
					onAnimationEnd: function (animator: android.animation.Animator): void {
						resolve();
					},
					onAnimationRepeat: function (animator: android.animation.Animator): void {},
					onAnimationCancel: function (animator: android.animation.Animator): void {},
				}),
			);
			animatorSet.start();
		});
	}
}
