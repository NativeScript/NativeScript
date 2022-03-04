export interface NativeScriptUIView extends UIView {
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
	 * draw gradient using CAGradientLayer and insert into UIView sublayer
	 * @param nativeView UIView
	 * @param gradient Parsed LinearGradient
	 * @param gradientLayerOpacity Initial layer opacity (in case you'd like to use with animation sequence)
	 * @param index sublayer index to insert layer at (defaults to 0)
	 */
	export function drawGradient(uiView: any /* UIView */, gradient: LinearGradient, gradientLayerOpacity?: number, index?: number): any; /* CAGradientLayer */

	/**
	 * clear gradientLayer if found on provided UIView
	 * @param nativeView UIView
	 */
	export function clearGradient(uiView: any /* UIView */): void;
}
