export interface NativeScriptAndroidView extends android.view.View {
	_cachedDrawable: android.graphics.drawable.Drawable;
}

export interface NativeScriptUIView extends UIView {
	hasNonUniformBorder: boolean;
	hasNonUniformBorderColor: boolean;
	borderLayer: CAShapeLayer;

	maskType: ios.LayerMaskType;
	originalMask: CALayer;

	gradientLayer: CAGradientLayer;
	outerShadowContainerLayer: CALayer;
}

export namespace ios {
	export type LayerMaskType = 'BORDER' | 'CLIP_PATH';
	export namespace LayerMask {
		export const BORDER = 'BORDER';
		export const CLIP_PATH = 'CLIP_PATH';
	}

	/**
	 * Gets actual height of a [UIView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/) widget in device pixels.
	 * @param uiView - An instance of UIView.
	 */
	export function getActualHeight(uiView: any /* UIView */): number;

	/**
	 * Gets the height of the status bar in device pixels.
	 * @param viewController when specified it is used to check preferStatusBarHidden property.
	 */
	export function getStatusBarHeight(viewController?: any): number;

	/**
	 * Draw gradient using CAGradientLayer and insert into UIView sublayer
	 * @param nativeView NativeScriptUIView
	 * @param gradientLayer CAGradientLayer
	 * @param gradient Parsed LinearGradient
	 * @param gradientLayerOpacity Initial layer opacity (in case you'd like to use with animation sequence)
	 */
	export function drawGradient(uiView: NativeScriptUIView, gradientLayer: CAGradientLayer, gradient: LinearGradient, gradientLayerOpacity?: number): void;
}
