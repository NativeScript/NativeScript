interface EventInitOptions extends EventInit {
	captures?: boolean;
	__event_data?: any;
}

export const EVENT_OPTIONS_DEFAULT: EventInit & { captures?: boolean } = {
	bubbles: false,
	captures: false,
	cancelable: false,
};

export const EventPhases = {
	BUBBLING_PHASE: 3,
	AT_TARGET: 2,
	CAPTURING_PHASE: 1,
	NONE: 0,
};

/**
 * Event.
 */
export class Event {
	BUBBLING_PHASE: number = 3;
	AT_TARGET: number = 2;
	CAPTURING_PHASE: number = 1;
	NONE: number = 0;

	public eventName: string = undefined;
	public object: any = undefined;
	public composed = false;
	public bubbles = false;
	public cancelable = false;
	public defaultPrevented = false;
	public captures = false;
	public passive = false;
	public _immediatePropagationStopped = false;
	public _propagationStopped = false;
	//@ts-ignore
	public _target: EventTarget = undefined;
	//@ts-ignore
	public _currentTarget: EventTarget = undefined;
	//@ts-ignore
	public type: string = undefined;

	public cancelBubble: boolean;
	public eventPhase: number = 0;
	public isTrusted: boolean = true;
	public returnValue: boolean;
	public srcElement: EventTarget;
	public timeStamp: number;

	constructor(type: string, options: EventInitOptions) {
		if (!options) options = EVENT_OPTIONS_DEFAULT;
		this.initEvent(type, options.bubbles, options.cancelable, options.captures);
		if (options.__event_data) {
			for (const key in options.__event_data) {
				if (/(eventName|object)/g.test(key)) {
					this[key] = options.__event_data[key];
					continue;
				}
				Object.defineProperty(this, key, {
					get: () => {
						return options.__event_data[key];
					},
					set: (v) => {
						options.__event_data[key] = v;
					},
					configurable: true,
				});
			}
		}
	}

	composedPath(): EventTarget[] {
		return [];
	}

	// eslint-disable-next-line max-params
	initEvent(type: string, bubbles?: boolean, cancelable = true, captures?: boolean) {
		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
		this.captures = captures;
	}
	public stopPropagation() {
		this._propagationStopped = true;
	}
	public stopImmediatePropagation() {
		this._immediatePropagationStopped = this._propagationStopped = true;
	}
	public preventDefault() {
		if (this.passive) {
			console.error('[DOM] Unable to preventDefault inside passive event listener invocation.');
			return;
		}
		this.defaultPrevented = true;
	}

	/**
	 * Returns target.
	 *
	 * @returns Target.
	 */
	public get target(): EventTarget {
		return this._target || this._currentTarget;
	}

	/**
	 * Returns target.
	 *
	 * @returns Target.
	 */
	public get currentTarget(): EventTarget {
		return this._currentTarget;
	}
}

new Proxy(Event.prototype, {
	get: (target, prop, reciever) => {
		console.log('proxy');
		return target[prop];
	},
});
