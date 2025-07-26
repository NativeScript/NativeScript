import { Observable } from '../data/observable';
import { trace as profilingTrace, time, uptime, level as profilingLevel } from '../profiling';
console.log('here in globals/global-utils!');

/**
 * Manages internal framework global state
 */
export class NativeScriptGlobalState {
	events: Observable;
	launched = false;
	// used by various classes to setup callbacks to wire up global app event handling when the app instance is ready
	appEventWiring: Array<any>;
	private _appInstanceReady = false;
	private _setLaunched: () => void;
	constructor() {
		// console.log('creating NativeScriptGlobals...')
		this.events = new Observable();
		this._setLaunched = this._setLaunchedFn.bind(this);
		this.events.on('launch', this._setLaunched);
		if (profilingLevel() > 0) {
			this.events.on('displayed', () => {
				const duration = uptime();
				const end = time();
				const start = end - duration;
				profilingTrace(`Displayed in ${duration.toFixed(2)}ms`, start, end);
			});
		}
	}

	get appInstanceReady() {
		return this._appInstanceReady;
	}

	set appInstanceReady(value: boolean) {
		this._appInstanceReady = value;
		// app instance ready, wire up any app events waiting in startup queue
		if (this.appEventWiring && this.appEventWiring.length) {
			for (const callback of this.appEventWiring) {
				callback();
			}
			// cleanup
			this.appEventWiring = null;
		}
	}

	/**
	 * Ability for classes to initialize app event handling early even before the app instance is ready during boot cycle avoiding boot race conditions
	 * @param callback wire up any global event handling inside the callback
	 */
	addEventWiring(callback: () => void) {
		if (this._appInstanceReady) {
			callback();
		} else {
			if (!this.appEventWiring) {
				this.appEventWiring = [];
			}
			this.appEventWiring.push(callback);
		}
	}

	private _setLaunchedFn() {
		// console.log('NativeScriptGlobals launch fired!');
		this.launched = true;
		this.events.off('launch', this._setLaunched);
		this._setLaunched = null;
	}
}
export function getNativeScriptGlobals() {
	if (!global.NativeScriptGlobals) {
		// init global state handler
		global.NativeScriptGlobals = new NativeScriptGlobalState();
	}
	return global.NativeScriptGlobals;
}
