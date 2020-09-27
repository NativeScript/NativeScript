import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { ShadeCoverAnimation, ShadeCoverOptions } from '.';
export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	constructor() {
		super();
	}

	protected _bringToFront(view: View) {
		(<UIView>this.nativeViewProtected).bringSubviewToFront(view.nativeViewProtected);
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const initialState = <ShadeCoverAnimation>{
			...defaultShadeCoverOptions.animation.enterFrom,
			...shadeOptions?.animation?.enterFrom,
		};
		this._applyAnimationProperties(view, initialState);
	}

	protected _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		return new Promise((resolve) => {
			const options = <ShadeCoverOptions>{
				...defaultShadeCoverOptions,
				...shadeOptions,
			};
			if (view && view.nativeViewProtected) {
				const duration = options.animation?.enterFrom?.duration || defaultShadeCoverOptions.animation.enterFrom.duration;
				UIView.animateWithDurationAnimationsCompletion(
					duration,
					() => {
						view.nativeViewProtected.frame = CGRectMake(0, options.height || 0, (<UIView>this.ios).frame.size.width, (<UIView>this.ios).frame.size.height);
						view.nativeViewProtected.backgroundColor = new Color(options.color).ios;
						this._applyAnimationProperties(view, {
							translateX: 0,
							translateY: 0,
							scaleX: 1,
							scaleY: 1,
							rotate: 0,
							opacity: shadeOptions.opacity,
						});
					},
					(completed: boolean) => {
						resolve();
					}
				);
			}
		});
	}

	protected _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		return new Promise((resolve) => {
			const exitState = <ShadeCoverAnimation>{
				...defaultShadeCoverOptions.animation.exitTo,
				...shadeOptions?.animation?.exitTo,
			};

			if (view && view.nativeViewProtected) {
				UIView.animateWithDurationAnimationsCompletion(
					exitState.duration,
					() => {
						this._applyAnimationProperties(view, exitState);
					},
					(completed: boolean) => {
						resolve();
					}
				);
			}
		});
	}

	private _applyAnimationProperties(view: View, shadeCoverAnimation: ShadeCoverAnimation): void {
		const translate = CGAffineTransformMakeTranslation(shadeCoverAnimation.translateX, shadeCoverAnimation.translateY);
		// ios doesn't like scale being 0, default it to a small number greater than 0
		const scale = CGAffineTransformMakeScale(shadeCoverAnimation.scaleX || 0.1, shadeCoverAnimation.scaleY || 0.1);
		const rotate = CGAffineTransformMakeRotation((shadeCoverAnimation.rotate * Math.PI) / 180); // convert degress to radians
		const translateAndScale = CGAffineTransformConcat(translate, scale);
		view.nativeViewProtected.transform = CGAffineTransformConcat(rotate, translateAndScale);
		view.nativeViewProtected.alpha = shadeCoverAnimation.opacity;
	}
}
