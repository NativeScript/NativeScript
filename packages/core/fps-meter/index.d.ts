/**
 * Starts the frames-per-second meter.
 */
export function start(): void;

/**
 * Stops the frames-per-second meter.
 */
export function stop(): void;

/**
 * Returns a valid indicating whether the frames-per-second meter is currently running.
 */
export function running(): boolean;

/**
 * Adds a callback function to be called each time FPS data is due to be reported. Returns an unique id which can be used to remove this callback later.
 */
export function addCallback(callback: (fps: number, minFps?: number) => void): number;

/**
 * Removes the callback with the specified id.
 */
export function removeCallback(id: number);
