/**
 * An object containing screen information.
 */
export interface ScreenMetrics {
	/**
	 * Gets the absolute width of the screen in pixels.
	 */
	widthPixels: number;

	/**
	 * Gets the absolute height of the screen in pixels.
	 */
	heightPixels: number;

	/**
	 * Gets the absolute width of the screen in density independent pixels.
	 */
	widthDIPs: number;

	/**
	 * Gets the absolute height of the screen in density independent pixels.
	 */
	heightDIPs: number;

	/**
	 * The logical density of the display. This is a scaling factor for the Density Independent Pixel unit.
	 */
	scale: number;

	_updateMetrics(): void;
}

/**
 * An object describing general information about a display.
 */
export class Screen {
	/**
	 * Gets information about the main screen of the current device.
	 */
	static mainScreen: ScreenMetrics;
}

/**
 * An object describing general information about a display.
 *
 * This retains compatibility with NS6
 */
export const screen: Screen;
