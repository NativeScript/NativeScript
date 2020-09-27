import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { ShadeCoverEnterAnimation, ShadeCoverExitAnimation, ShadeCoverOptions } from '.';

export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	constructor() {
		super();
	}

	protected _bringToFront(view: View) {
		(<android.view.View>view.nativeViewProtected).bringToFront();
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const initialState = <ShadeCoverEnterAnimation>{
			...defaultShadeCoverOptions.enterAnimation,
			...shadeOptions?.enterAnimation,
		};
		const shadeCoverInitialState = Array.create(android.animation.Animator, 6);
		shadeCoverInitialState[0] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationX', [initialState.translateXFrom]);
		shadeCoverInitialState[1] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationY', [initialState.translateYFrom]);
		shadeCoverInitialState[2] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleX', [initialState.scaleXFrom]);
		shadeCoverInitialState[3] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleY', [initialState.scaleYFrom]);
		shadeCoverInitialState[4] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'rotate', [initialState.rotateFrom]);
		shadeCoverInitialState[5] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'alpha', [initialState.opacityFrom]);

		this._playAnimation(shadeCoverInitialState);
	}

	protected _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const options = <ShadeCoverOptions>{
			...defaultShadeCoverOptions,
			...shadeOptions,
		};
		const animationSet = Array.create(android.animation.Animator, 7);
		animationSet[0] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationX', [0]);
		animationSet[1] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationY', [0]);
		animationSet[2] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleX', [1]);
		animationSet[3] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleY', [1]);
		animationSet[4] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'rotate', [0]);
		animationSet[5] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'alpha', [options.opacity]);
		animationSet[6] = this._getBackgroundColorAnimator(view, options.color);

		return this._playAnimation(animationSet, options.enterAnimation?.duration);
	}
	private _getBackgroundColorAnimator(view: View, backgroundColor: string): android.animation.ValueAnimator {
		const nativeArray = Array.create(java.lang.Object, 2);
		nativeArray[0] = view.backgroundColor ? java.lang.Integer.valueOf((<Color>view.backgroundColor).argb) : java.lang.Integer.valueOf(-1);
		nativeArray[1] = java.lang.Integer.valueOf(new Color(backgroundColor).argb);
		const backgroundColorAnimator = android.animation.ValueAnimator.ofObject(new android.animation.ArgbEvaluator(), nativeArray);
		backgroundColorAnimator.addUpdateListener(
			new android.animation.ValueAnimator.AnimatorUpdateListener({
				onAnimationUpdate(animator: android.animation.ValueAnimator) {
					let argb = (<java.lang.Integer>animator.getAnimatedValue()).intValue();
					view.backgroundColor = new Color(argb);
				},
			})
		);
		return backgroundColorAnimator;
	}

	protected _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const exitState = <ShadeCoverExitAnimation>{
			...defaultShadeCoverOptions.exitAnimation,
			...shadeOptions?.exitAnimation,
		};
		const animationSet = Array.create(android.animation.Animator, 6);
		animationSet[0] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationX', [exitState.translateXTo]);
		animationSet[1] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'translationY', [exitState.translateYTo]);
		animationSet[2] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleX', [exitState.scaleXTo]);
		animationSet[3] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'scaleY', [exitState.scaleYTo]);
		animationSet[4] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'rotate', [exitState.rotateTo]);
		animationSet[5] = android.animation.ObjectAnimator.ofFloat(view.nativeViewProtected, 'alpha', [exitState.opacityTo]);

		return this._playAnimation(animationSet, exitState?.duration);
	}

	private _playAnimation(animationSet: Array<android.animation.Animator>, duration: number = 0): Promise<void> {
		return new Promise((resolve) => {
			if (duration) {
				duration = duration * 1000; // convert duration im milliseconds to seconds
			}
			const animatorSet = new android.animation.AnimatorSet();
			animatorSet.playTogether(animationSet);
			animatorSet.setDuration(duration);
			animatorSet.addListener(
				new android.animation.Animator.AnimatorListener({
					onAnimationStart: function (animator: android.animation.Animator): void {
						// if (Trace.isEnabled()) {
						// 	Trace.write('MainAnimatorListener.onAndroidAnimationStart(' + animator + ')', Trace.categories.Animation);
						// }
					},
					onAnimationEnd: function (animator: android.animation.Animator): void {
						// if (Trace.isEnabled()) {
						// 	Trace.write('MainAnimatorListener.onAnimationEnd(' + animator + ')', Trace.categories.Animation);
						// }
						resolve();
					},
					onAnimationRepeat: function (animator: android.animation.Animator): void {},
					onAnimationCancel: function (animator: android.animation.Animator): void {},
				})
			);
			animatorSet.start();
		});
	}
}
