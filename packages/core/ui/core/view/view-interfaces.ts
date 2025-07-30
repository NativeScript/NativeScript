import type { EventData } from '../../../data/observable';
/**
 * Defines the data for the shownModally event.
 */
export interface ShownModallyData extends EventData {
	/**
	 * The context (optional, may be undefined) passed to the view when shown modally.
	 */
	context?: any;

	/**
	 * A callback to call when you want to close the modally shown view.
	 * Pass in any kind of arguments and you will receive when the callback parameter
	 * of View.showModal is executed.
	 */
	closeCallback?: Function;
}

/**
 * The Point interface describes a two dimensional location.
 * It has two properties x and y, representing the x and y coordinate of the location.
 */
export interface Point {
	/**
	 * Represents the x coordinate of the location.
	 */
	x: number;

	/**
	 * Represents the y coordinate of the location.
	 */
	y: number;

	/**
	 * Represents the z coordinate of the location.
	 */
	z?: number;
}

export interface Position {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/**
 * The Size interface describes abstract dimensions in two dimensional space.
 * It has two properties width and height, representing the width and height values of the size.
 */
export interface Size {
	/**
	 * Represents the width of the size.
	 */
	width: number;

	/**
	 * Represents the height of the size.
	 */
	height: number;
}
