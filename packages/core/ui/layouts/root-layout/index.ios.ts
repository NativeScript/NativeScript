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
		(<UIView>this.nativeViewProtected).bringSubviewToFront(view.nativeViewProtected);
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const initialState = <ShadeCoverEnterAnimation>{
			...defaultShadeCoverOptions.enterAnimation,
			...shadeOptions?.enterAnimation,
		};
		const translate = CGAffineTransformMakeTranslation(initialState.translateXFrom, initialState.translateYFrom);
		const scale = CGAffineTransformMakeScale(initialState.scaleXFrom || 0.01, initialState.scaleYFrom || 0.01);
		const rotate = CGAffineTransformMakeRotation(initialState.rotateFrom);
		const translateAndScale = CGAffineTransformConcat(translate, scale);
		view.nativeViewProtected.transform = CGAffineTransformConcat(rotate, translateAndScale);
		view.nativeViewProtected.alpha = initialState.opacityFrom;
	}

	protected _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		return new Promise((resolve) => {
			const options = <ShadeCoverOptions>{
				...defaultShadeCoverOptions,
				...shadeOptions,
			};
			if (view && view.nativeViewProtected) {
				UIView.animateWithDurationAnimationsCompletion(
					options.enterAnimation.duration,
					() => {
						view.nativeViewProtected.frame = CGRectMake(0, options.height || 0, this.getActualSize().width, this.getActualSize().height);
						const translate = CGAffineTransformMakeTranslation(0, 0);
						const scale = CGAffineTransformMakeScale(1, 1);
						const rotate = CGAffineTransformMakeRotation(0);
						const translateAndScale = CGAffineTransformConcat(translate, scale);
						view.nativeViewProtected.transform = CGAffineTransformConcat(rotate, translateAndScale);
						view.nativeViewProtected.backgroundColor = new Color(options.color).ios;
						view.nativeViewProtected.alpha = shadeOptions.opacity;
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
			const exitState = <ShadeCoverExitAnimation>{
				...defaultShadeCoverOptions.exitAnimation,
				...shadeOptions?.exitAnimation,
			};

			if (view && view.nativeViewProtected) {
				UIView.animateWithDurationAnimationsCompletion(
					exitState.duration,
					() => {
						const translate = CGAffineTransformMakeTranslation(exitState.translateXTo, exitState.translateYTo);
						// ios doesn't like scale being 0, default it to a small number greater than 0
						const scale = CGAffineTransformMakeScale(exitState.scaleXTo || 0.01, exitState.scaleYTo || 0.01);
						const rotate = CGAffineTransformMakeRotation(exitState.rotateTo);
						const translateAndScale = CGAffineTransformConcat(translate, scale);
						view.nativeViewProtected.transform = CGAffineTransformConcat(rotate, translateAndScale);
						view.nativeViewProtected.alpha = exitState.opacityTo;
					},
					(completed: boolean) => {
						resolve();
					}
				);
			}
		});
	}
}
