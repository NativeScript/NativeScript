import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { TransitionAnimation, ShadeCoverOptions } from '.';

export * from './root-layout-common';

export class RootLayout extends RootLayoutBase {
	protected _bringToFront(view: View) {
		const native = view.nativeViewProtected;
		const parent = this.nativeViewProtected;
		if (native && parent) {
			// the last child draws on top
			gtk_widget_insert_before(native, parent, null);
		}
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		this._apply(view, { ...defaultShadeCoverOptions.animation.enterFrom, ...shadeOptions?.animation?.enterFrom });
	}

	protected async _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const options = { ...defaultShadeCoverOptions, ...shadeOptions };
		if (!view?.nativeViewProtected) {
			return;
		}
		if (options.color && !options.color.startsWith('linear-gradient')) {
			view.backgroundColor = new Color(options.color);
		} else if (options.color) {
			view.style.backgroundImage = options.color;
		}
		await view.animate({
			translate: { x: 0, y: 0 },
			scale: { x: 1, y: 1 },
			rotate: 0,
			opacity: shadeOptions.opacity,
			duration: options.animation?.enterFrom?.duration ?? defaultShadeCoverOptions.animation.enterFrom.duration,
		});
	}

	protected async _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions): Promise<void> {
		const exit = { ...defaultShadeCoverOptions.animation.exitTo, ...shadeOptions?.animation?.exitTo };
		if (!view?.nativeViewProtected) {
			return;
		}
		await view.animate({
			translate: { x: exit.translateX, y: exit.translateY },
			scale: { x: exit.scaleX || 0.1, y: exit.scaleY || 0.1 },
			rotate: exit.rotate,
			opacity: exit.opacity,
			duration: exit.duration,
		});
	}

	private _apply(view: View, state: TransitionAnimation): void {
		view.translateX = state.translateX;
		view.translateY = state.translateY;
		view.scaleX = state.scaleX || 0.1;
		view.scaleY = state.scaleY || 0.1;
		view.rotate = state.rotate;
		view.opacity = state.opacity;
	}
}
