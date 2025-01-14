﻿import { Screen } from '../platform';
import * as utils from '../utils';
import { LinearGradient } from './styling/linear-gradient';
import { NativeScriptUIView } from './utils';

export namespace ios {
	export type LayerMaskType = 'BORDER' | 'CLIP_PATH';
	export namespace LayerMask {
		export const BORDER = 'BORDER';
		export const CLIP_PATH = 'CLIP_PATH';
	}

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

	export function drawGradient(nativeView: UIView, gradientLayer: CAGradientLayer, gradient: LinearGradient, gradientLayerOpacity?: number): void {
		if (!nativeView || !gradient) {
			return;
		}

		if (typeof gradientLayerOpacity === 'number') {
			gradientLayer.opacity = gradientLayerOpacity;
		}

		// Update these properties instead of layer frame as the latter messes with animations
		gradientLayer.bounds = nativeView.bounds;
		gradientLayer.anchorPoint = CGPointMake(0, 0);

		gradientLayer.allowsEdgeAntialiasing = true;
		gradientLayer.contentsScale = Screen.mainScreen.scale;

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
	}
}
