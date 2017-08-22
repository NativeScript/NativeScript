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
 * Profiling mode to use.
 *  - `counters` Accumulates method call counts and times until dumpProfiles is called and then prints agregated statistic in the console. This is the default.
 *  - `timeline` Outputs method names along start/end timestamps in the console on the go.
 */
type InstrumentationMode = "counters" | "timeline";

/**
 * Enables profiling.
 * 
 * Upon loading of the module it will cache the package.json of the app and check if there is a "profiling" key set,
 * its value can be one of the options available for InstrumentationMode, and if set,
 * enable() will be called in pre app start with the value in the package.json.
 * 
 * An example for an `app/package.json` enabling the manual instrumentation profiling is:
 * ```
 * {
 *     "main": "main.js",
 *     "profiling": "timeline"
 * }
 * ```
 * 
 * @param type Profiling mode to use.
 *  - "counters" - Accumulates method call counts and times until dumpProfiles is called and then prints agregated statistic in the console. This is the default.
 *  - "timeline" - Outputs method names along start/end timestamps in the console on the go.
 */
export declare function enable(type?: InstrumentationMode): void;

/**
 * Disables profiling.
 */
export declare function disable(): void;

/**
 * Gets accurate system timestamp in ms.
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
export declare function stop(name: string): TimerInfo;

/**
 * Read a timer info.
 * @param name The name of the timer to obtain information about.
 */
export function timer(name: string): TimerInfo;

/**
 * Returns true if a timer is currently running.
 * @param name Name of the timer.
 * @returns true is the timer is currently running.
 */
export declare function isRunning(name: string): boolean;

/**
 * Method decorator factory. It will intercept the method call and start and pause a timer before and after the method call.
 * Works only if profiling is enabled.
 * @param name Name of the timer which will be used for method calls. If not provided - the name of the method will be used.
 */
export declare function profile(name?: string): MethodDecorator;

/**
 * Function factory. It will intercept the function call and start and pause a timer before and after the function call. Works only if profiling is enabled.
 * Works only if profiling is enabled.
 * @param fn The function to wrap. Uses the function name to track the times.
 */
export declare function profile<F extends Function>(fn: F): F;

/**
 * Function factory. It will intercept the function call and start and pause a timer before and after the function call. Works only if profiling is enabled.
 * @param name The name used to track calls and times.
 * @param fn The function to wrap.
 */
export declare function profile<F extends Function>(name: string, fn: F): F;

/**
 * Method decorator. It will intercept the method calls and start and pause a timer before and after the method call. Works only if profiling is enabled.
 */
export declare function profile<T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
export function profile(): any;

/**
 * Prints the timer for all methods instrumented with profile decorator.
 */
export declare function dumpProfiles(): void;

/**
 * Resets the timers for all methods instrumented with profile decorator.
 */
export function resetProfiles(): void;

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

/**
 * Gets the uptime of the current process in milliseconds.
 */
export function uptime(): number;
