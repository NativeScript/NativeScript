import { CoreTypes } from '../../core-types';

/**
 * Utility module related to layout.
 */
export namespace layout {
	/**
	 * Bits that provide the actual measured size.
	 */
	export const MEASURED_HEIGHT_STATE_SHIFT: number;
	export const MEASURED_SIZE_MASK: number;
	export const MEASURED_STATE_MASK: number;
	export const MEASURED_STATE_TOO_SMALL: number;
	export const UNSPECIFIED: number;
	export const EXACTLY: number;
	export const AT_MOST: number;

	/**
	 * Gets layout mode from a given specification as string.
	 * @param mode - The measure specification mode.
	 */
	export function getMode(mode: number): string;

	/**
	 * Gets measure specification mode from a given specification.
	 * @param spec - The measure specification.
	 */
	export function getMeasureSpecMode(spec: number): number;

	/**
	 * Gets measure specification size from a given specification.
	 * @param spec - The measure specification.
	 */
	export function getMeasureSpecSize(spec: number): number;

	/**
	 * Creates measure specification size from size and mode.
	 * @param size - The size component of measure specification.
	 * @param mode - The mode component of measure specification.
	 */
	export function makeMeasureSpec(px: number, mode: number): number;

	/**
	 * Gets display density for the current device.
	 */
	export function getDisplayDensity(): number;

	/**
	 * Convert device independent pixels to device pixels - dip to px.
	 * @param value - The pixel to convert.
	 */
	export function toDevicePixels(value: CoreTypes.dip): CoreTypes.px;

	/**
	 * Convert device pixels to device independent pixels - px to dip.
	 * @param value - The pixel to convert.
	 */
	export function toDeviceIndependentPixels(value: CoreTypes.px): CoreTypes.dip;

	/**
	 * Rounds value used in layout.
	 * @param px to round.
	 */
	export function round(px: CoreTypes.px): CoreTypes.px;

	/**
	 * Converts device pixels to device independent pixes and measure the nativeView.
	 * Returns the desired size of the nativeView in device pixels.
	 * @param nativeView the nativeView to measure (UIView or android.view.View)
	 * @param width the available width
	 * @param widthMode width mode - UNSPECIFIED, EXACTLY or AT_MOST
	 * @param height the available hegiht
	 * @param heightMode height mode - UNSPECIFIED, EXACTLY or AT_MOST
	 */
	export function measureNativeView(nativeView: any /* UIView or android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number };

	/**
	 * Prints user friendly version of the measureSpec.
	 * @param measureSpec the spec to print
	 */
	export function measureSpecToString(measureSpec: number): string;
}
