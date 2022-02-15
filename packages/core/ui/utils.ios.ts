import * as utils from '../utils';
import { LinearGradient } from './styling/linear-gradient';

interface NativeScriptUIView extends UIView {
	hasNonUniformBorder: boolean;
	borderLayer: CALayer;

	hasBorderMask: boolean;
	borderOriginalMask: CALayer;

	topBorderLayer: CALayer;
	rightBorderLayer: CALayer;
	bottomBorderLayer: CALayer;
	leftBorderLayer: CALayer;

	gradientLayer: CAGradientLayer;
	boxShadowLayer: CALayer;
}

export namespace ios {
	export function getActualHeight(view: UIView): number {
		if (view.window && !view.hidden) {
			return utils.layout.toDevicePixels(view.frame.size.height);
		}

		return 0;
	}

	export function getStatusBarHeight(viewController?: UIViewController): number {
		const app = UIApplication.sharedApplication;
		if (!app || app.statusBarHidden) {
			return 0;
		}

		if (viewController && viewController.prefersStatusBarHidden) {
			return 0;
		}

		const statusFrame = app.statusBarFrame;
		const min = Math.min(statusFrame.size.width, statusFrame.size.height);

		return utils.layout.toDevicePixels(min);
	}

	export function drawGradient(nativeView: NativeScriptUIView, gradient: LinearGradient, gradientLayerOpacity?: number, index?: number): CAGradientLayer {
		let gradientLayer: CAGradientLayer;
		if (nativeView && gradient) {
			gradientLayer = CAGradientLayer.layer();
			if (typeof gradientLayerOpacity === 'number') {
				gradientLayer.opacity = gradientLayerOpacity;
			}
			gradientLayer.frame = nativeView.bounds;
			nativeView.gradientLayer = gradientLayer;

			const iosColors = NSMutableArray.alloc().initWithCapacity(gradient.colorStops.length);
			const iosStops = NSMutableArray.alloc<number>().initWithCapacity(gradient.colorStops.length);
			let hasStops = false;

			gradient.colorStops.forEach((stop) => {
				iosColors.addObject(stop.color.ios.CGColor);
				if (stop.offset) {
					iosStops.addObject(stop.offset.value);
					hasStops = true;
				}
			});

			gradientLayer.colors = iosColors;

			if (hasStops) {
				gradientLayer.locations = iosStops;
			}

			const alpha = gradient.angle / (Math.PI * 2);
			const startX = Math.pow(Math.sin(Math.PI * (alpha + 0.75)), 2);
			const startY = Math.pow(Math.sin(Math.PI * (alpha + 0.5)), 2);
			const endX = Math.pow(Math.sin(Math.PI * (alpha + 0.25)), 2);
			const endY = Math.pow(Math.sin(Math.PI * alpha), 2);
			gradientLayer.startPoint = { x: startX, y: startY };
			gradientLayer.endPoint = { x: endX, y: endY };

			nativeView.layer.insertSublayerAtIndex(gradientLayer, index || 0);
		}
		return gradientLayer;
	}

	export function clearGradient(nativeView: NativeScriptUIView): void {
		if (nativeView?.gradientLayer) {
			nativeView.gradientLayer.removeFromSuperlayer();
		}
	}
}
