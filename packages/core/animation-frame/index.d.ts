/**
 * Callback called on frame rendered
 * @argument time Time of the current frame in milliseconds
 */
export interface FrameRequestCallback {
	(time: number): void;
}

/**
 * Requests an animation frame and returns the timer ID
 * @param cb Callback to be called on frame
 */
export function requestAnimationFrame(cb: FrameRequestCallback): number;

/**
 * Cancels a previously scheduled animation frame request
 * @param id timer ID to cancel
 */
export function cancelAnimationFrame(id: number): void;
