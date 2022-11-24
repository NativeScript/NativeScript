import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { TransitionAnimation, ShadeCoverOptions } from '.';
import { LinearGradient } from '../../styling/linear-gradient';
import { ios as iosViewUtils } from '../../utils';
import { parseLinearGradient } from '../../../css/parser';
export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	// perf optimization: only create and insert gradients if settings change
	private _currentGradient: string;
	private _gradientLayer: CAGradientLayer;

	constructor() {
		super();
	}

	protected _bringToFront(view: View) {
		(<UIView>this.nativeViewProtected).bringSubviewToFront(view.nativeViewProtected);
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const initialState = <TransitionAnimation>{
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
			if (view?.nativeViewProtected) {
				const duration = this._convertDurationToSeconds(options.animation?.enterFrom?.duration || defaultShadeCoverOptions.animation.enterFrom.duration);

				if (options.color && options.color.startsWith('linear-gradient')) {
					if (options.color !== this._currentGradient) {
						this._currentGradient = options.color;
						const parsedGradient = parseLinearGradient(options.color);
						this._gradientLayer = iosViewUtils.drawGradient(view.nativeViewProtected, LinearGradient.parse(parsedGradient.value), 0);
					}
				}
				UIView.animateWithDurationAnimationsCompletion(
					duration,
					() => {
						if (this._gradientLayer) {
							this._gradientLayer.opacity = 1;
						} else if (options.color && view?.nativeViewProtected) {
							view.nativeViewProtected.backgroundColor = new Color(options.color).ios;
						}
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
			const exitState = <TransitionAnimation>{
				...defaultShadeCoverOptions.animation.exitTo,
				...shadeOptions?.animation?.exitTo,
			};

			if (view && view.nativeViewProtected) {
				UIView.animateWithDurationAnimationsCompletion(
					this._convertDurationToSeconds(exitState.duration),
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

	protected _cleanupPlatformShadeCover(): void {
		this._currentGradient = null;
		this._gradientLayer = null;
	}

	private _applyAnimationProperties(view: View, shadeCoverAnimation: TransitionAnimation): void {
		if (view?.nativeViewProtected) {
			const translate = CGAffineTransformMakeTranslation(shadeCoverAnimation.translateX, shadeCoverAnimation.translateY);
			// ios doesn't like scale being 0, default it to a small number greater than 0
			const scale = CGAffineTransformMakeScale(shadeCoverAnimation.scaleX || 0.1, shadeCoverAnimation.scaleY || 0.1);
			const rotate = CGAffineTransformMakeRotation((shadeCoverAnimation.rotate * Math.PI) / 180); // convert degress to radians
			const translateAndScale = CGAffineTransformConcat(translate, scale);
			view.nativeViewProtected.transform = CGAffineTransformConcat(rotate, translateAndScale);
			view.nativeViewProtected.alpha = shadeCoverAnimation.opacity;
		}
	}

	private _convertDurationToSeconds(duration: number): number {
		return duration / 1000;
	}
}
