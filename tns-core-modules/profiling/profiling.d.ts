/**
 * Contains contains utility methods for profiling.
 * All methods in this module are experimental and may be changed in a non-major version.
 * @module "profiling"
 */ /** */

interface TimerInfo {
    totalTime: number;
    count: number;
}

/**
 * Enables profiling.
 */
export declare function enable(): void;

/**
 * Disables profiling.
 */
export declare function disable(): void;

/**
 * Gets accurate system timestamp in ms. 
 * Works only if profiling is enabled.
 */
export declare function time(): number;

/**
 * Starts a timer with a specific name.
 * Works only if profiling is enabled.
 * @param name Name of the timer.
 */
export declare function start(name: string): void;

/**
 * Pauses a timer with a specific name. This will increase call count and accumulate time.
 * Works only if profiling is enabled.
 * @param name Name of the timer.
 * @returns TimerInfo for the paused timer.
 */
export declare function pause(name: string): TimerInfo;

/**
 * Stops a timer with a specific name. This will print the count and the total time and will also reset the timer.
 * Works only if profiling is enabled.
 * @param name Name of the timer.
 * @returns TimerInfo for the stopped timer.
 */
export declare function stop(name: string): TimerInfo;

/**
 * Method decorator factory. It will intercept the method call and start and pause a timer before and after the method call.
 * Works only if profiling is enabled.
 * @param name Name of the timer which will be used for method calls. If not provided - the name of the method will be used.
 */
export declare function profile(name?: string): (target, key, descriptor) => void;

/**
 * Prints the timer for all methods instrumented with profile decorator.
 */
export declare function dumpProfiles(): void;

/**
 * Starts android cpu profiling.
 * @param name Name of the cpu profiling session.
 */
export declare function startCPUProfile(name: string): void;

/**
 * Stops android cpu profiling.
 * @param name Name of the cpu profiling session.
 */
export declare function stopCPUProfile(name: string): void;
