/**
 * @module "fps-meter/fps-native"
 */ /** */

/**
 * An utility class used to measure frames per second.
 */
export class FPSCallback {

    /**
     * Initializes a new instance of FPSCallback class.
     */
    constructor(onFrame: (currentTimeMillis: number) => void);

    /**
     * Starts the frame per seconds measurement.
     */
    start(): void;

    /**
     * Stops the frame per seconds measurement.
     */
    stop(): void;

    /**
     * Gets if the current instance of FPSCallback is running.
     */
    running: boolean;
}
