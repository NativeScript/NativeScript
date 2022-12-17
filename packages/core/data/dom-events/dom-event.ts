import type { EventData, ListenerEntry, Observable } from '../observable/index';
import { MutationSensitiveArray } from '../mutation-sensitive-array';

// This file contains some of Core's hot paths, so attention has been taken to
// optimise it. Where specified, optimisations made have been informed based on
// profiles taken on an Apple M1 Max in a debug build on @nativescript/ios@8.3.3
// on an iOS Simulator.

const timeOrigin = Date.now();

/**
 * Purely a performance utility. We fall back to an empty array on various
 * optional accesses, so reusing the same one and treating it as immutable
 * avoids unnecessary allocations on a relatively hot path of the library.
 */
const emptyArray = new MutationSensitiveArray<ListenerEntry>();

/**
 * Recycling the event path array rather than allocating a new one each time
 * saves about 210 nanoseconds per dispatchTo() call (and avoids memory pressure
 * and GC).
 */
const recycledEventPath: Observable[] = [];

export class DOMEvent implements Event {
	/**
	 * @private
	 * Internal API to facilitate testing - to be removed once we've completed
	 * the breaking changes to migrate fully to DOMEvents.
	 *
	 * Gets the last event to be dispatched, allowing you to access the DOM
	 * Event that corresponds to the currently-running callback.
	 */
	static unstable_currentEvent: DOMEvent | null = null;

	readonly NONE = 0;
	readonly CAPTURING_PHASE = 1;
	readonly AT_TARGET = 2;
	readonly BUBBLING_PHASE = 3;

	/**
	 * Returns true or false depending on how event was initialized. Its return
	 * value does not always carry meaning, but true can indicate that part of
	 * the operation during which event was dispatched, can be canceled by
	 * invoking the preventDefault() method.
	 */
	readonly cancelable: boolean = false;

	/**
	 * Returns true or false depending on how event was initialized. True if
	 * event goes through its target's ancestors in reverse tree order, and
	 * false otherwise.
	 */
	readonly bubbles: boolean = false;

	private _canceled = false;

	/** @deprecated Setting this value does nothing. */
	cancelBubble = false;

	/**
	 * Returns true or false depending on how event was initialized. True if
	 * event invokes listeners past a ShadowRoot node that is the root of its
	 * target, and false otherwise.
	 */
	readonly composed: boolean;

	/**
	 * Returns true if event was dispatched by the user agent, and false
	 * otherwise.
	 * For now, all NativeScript events will have isTrusted: false.
	 */
	readonly isTrusted: boolean = false;

	/** @deprecated Use defaultPrevented instead. */
	get returnValue() {
		return !this.defaultPrevented;
	}

	/**
	 * Returns the event's timestamp as the number of milliseconds measured
	 * relative to the time origin.
	 */
	readonly timeStamp: DOMHighResTimeStamp = timeOrigin - Date.now();

	/** @deprecated */
	get srcElement(): Observable | null {
		return this.target;
	}

	/**
	 * Returns true if preventDefault() was invoked successfully to indicate
	 * cancelation, and false otherwise.
	 */
	get defaultPrevented() {
		return this._canceled;
	}

	private _eventPhase: 0 | 1 | 2 | 3 = this.NONE;
	/**
	 * Returns the event's phase, which is one of NONE, CAPTURING_PHASE,
	 * AT_TARGET, and BUBBLING_PHASE.
	 */
	get eventPhase() {
		return this._eventPhase;
	}
	private set eventPhase(value: 0 | 1 | 2 | 3) {
		this._eventPhase = value;
	}

	private _currentTarget: Observable | null = null;
	/**
	 * Returns the object whose event listener's callback is currently being
	 * invoked.
	 */
	get currentTarget() {
		return this._currentTarget;
	}
	private set currentTarget(value: Observable | null) {
		this._currentTarget = value;
	}

	private _target: Observable | null = null;
	/** Returns the object to which event is dispatched (its target). */
	get target() {
		return this._target;
	}
	private set target(value: Observable | null) {
		this._target = value;
	}

	// From CustomEvent rather than Event. Can consider factoring out this
	// aspect into DOMCustomEvent.
	readonly detail: unknown | null;

	private propagationState: EventPropagationState = EventPropagationState.resume;

	constructor(
		/**
		 * Returns the type of event, e.g. "click", "hashchange", or "submit".
		 */
		public type: string,
		options: CustomEventInit = {}
	) {
		const { bubbles = false, cancelable = false, composed = false, detail = null } = options;

		this.bubbles = bubbles;
		this.cancelable = cancelable;
		this.composed = composed;
		this.detail = detail;
	}

	/**
	 * Returns the invocation target objects of event's path (objects on which
	 * listeners will be invoked), except for any nodes in shadow trees of which
	 * the shadow root's mode is "closed" that are not reachable from event's
	 * currentTarget.
	 */
	composedPath(): Observable[] {
		if (!this.target) {
			return [];
		}

		// Walk up the target's parents if it has parents (is a ViewBase or
		// subclass of ViewBase) or not (is an Observable).
		return [...this.getEventPath(this.target, 'bubble')];
	}

	/**
	 * Returns the event path by walking up the target's parents.
	 *
	 * - 'capture' paths are ordered from root to target.
	 * - 'bubble' paths are ordered from target to root.
	 * @example
	 * [Page, StackLayout, Button] // 'capture'
	 * @example
	 * [Button, StackLayout, Page] // 'bubble'
	 */
	private getEventPath(responder: Observable, path: 'capture' | 'bubble'): Observable[] {
		recycledEventPath.splice(0, recycledEventPath.length);
		recycledEventPath.push(responder);

		if (!responder.isViewBase()) {
			return recycledEventPath;
		}

		let nextResponder = responder.parent;
		while (nextResponder) {
			path === 'capture' ? recycledEventPath.unshift(nextResponder) : recycledEventPath.push(nextResponder);

			// TODO: decide whether to walk up from Page to Frame, and whether
			// to then walk from Frame to Application or something.
			nextResponder = nextResponder?.parent;
		}
		return recycledEventPath;
	}

	/** @deprecated */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
		// This would be trivial to implement, but it's quite nice for `bubbles`
		// and `cancelable` to not have backing variables.
		throw new Error('Deprecated; use Event() instead.');
	}

	/**
	 * If invoked when the cancelable attribute value is true, and while
	 * executing a listener for the event with passive set to false, signals to
	 * the operation that caused event to be dispatched that it needs to be
	 * canceled.
	 */
	preventDefault(): void {
		if (!this.cancelable) {
			return;
		}
		this._canceled = true;
	}
	/**
	 * Invoking this method prevents event from reaching any registered event
	 * listeners after the current one finishes running and, when dispatched in
	 * a tree, also prevents event from reaching any other objects.
	 */
	stopImmediatePropagation(): void {
		this.propagationState = EventPropagationState.stopImmediate;
	}
	/**
	 * When dispatched in a tree, invoking this method prevents event from
	 * reaching any objects other than the current object.
	 */
	stopPropagation(): void {
		this.propagationState = EventPropagationState.stop;
	}

	// During handleEvent(), we want to work on a copy of the listeners array,
	// as any callback could modify the original array during the loop.
	//
	// However, cloning arrays is expensive on this hot path, so we'll do it
	// lazily - i.e. only take a clone if a mutation is about to happen.
	// This optimisation is particularly worth doing as it's very rare that
	// an event listener callback will end up modifying the listeners array.
	private listenersLive: MutationSensitiveArray<ListenerEntry> = emptyArray;
	private listenersLazyCopy: ListenerEntry[] = emptyArray;

	// Creating this upon class construction as an arrow function rather than as
	// an inline function bound afresh on each usage saves about 210 nanoseconds
	// per run of handleEvent().
	private onCurrentListenersMutation = () => {
		// Cloning the array via spread syntax is up to 180 nanoseconds
		// faster per run than using Array.prototype.slice().
		this.listenersLazyCopy = [...this.listenersLive];
		this.listenersLive.onMutation = null;
	};

	/**
	 * Dispatches a synthetic event event to target and returns true if either
	 * event's cancelable attribute value is false or its preventDefault()
	 * method was not invoked, and false otherwise.
	 */
	dispatchTo({ target, data, getGlobalEventHandlersPreHandling, getGlobalEventHandlersPostHandling }: { target: Observable; data: EventData; getGlobalEventHandlersPreHandling?: () => MutationSensitiveArray<ListenerEntry>; getGlobalEventHandlersPostHandling?: () => MutationSensitiveArray<ListenerEntry> }): boolean {
		if (this.eventPhase !== this.NONE) {
			throw new Error('Tried to dispatch a dispatching event');
		}
		this.eventPhase = this.CAPTURING_PHASE;
		this.target = target;
		this._canceled = false;

		// Internal API to facilitate testing - to be removed once we've
		// completed the breaking changes to migrate fully to DOMEvents.
		DOMEvent.unstable_currentEvent = this;

		/**
		 * Resets any internal state to allow the event to be redispatched. Call
		 * this before returning.
		 */
		const reset = () => {
			this.currentTarget = null;
			this.target = null;
			this.eventPhase = this.NONE;
			this.propagationState = EventPropagationState.resume;
			this.listenersLive = emptyArray;
			this.listenersLazyCopy = emptyArray;
		};

		// `Observable.removeEventListener` would likely suffice, but grabbing
		// the static method named `removeEventListener` on the target's class
		// allows us to be robust to the possiblity of the case of the target
		// overriding it (however unlikely).
		const removeGlobalEventListener = (target.constructor as unknown as typeof target).removeEventListener.bind(target.constructor) as Observable['removeEventListener'];

		// Global event handlers are a NativeScript-only concept, so we'll not
		// try to add new formal event phases for them (as that could break DOM
		// libraries expecting strictly four phases).
		//
		// Instead, events handled by global event handlers will exhibit the
		// following values:
		// - For 'pre-handling phase' global event handlers:
		//   - eventPhase: CAPTURING_PHASE
		//   - currentTarget: null
		// - For 'post-handling phase' global event handlers:
		//   - eventPhase: BUBBLING_PHASE
		//   - currentTarget: The value of currentTarget following the capturing
		//     and bubbling phases.
		// So effectively, we don't make any changes when handling a global
		// event. This keeps behaviour as consistent with DOM Events as
		// possible.

		this.listenersLazyCopy = this.listenersLive = getGlobalEventHandlersPreHandling?.() || emptyArray;
		this.handleEvent({
			data,
			isGlobal: true,
			removeEventListener: removeGlobalEventListener,
			phase: this.CAPTURING_PHASE,
		});

		const eventPath = this.getEventPath(target, 'capture');

		// Capturing phase, e.g. [Page, StackLayout, Button]
		for (const currentTarget of eventPath) {
			this.currentTarget = currentTarget;
			this.eventPhase = this.target === this.currentTarget ? this.AT_TARGET : this.CAPTURING_PHASE;

			this.listenersLazyCopy = this.listenersLive = currentTarget.getEventList(this.type) || emptyArray;
			this.handleEvent({
				data,
				isGlobal: false,
				removeEventListener: currentTarget.removeEventListener.bind(currentTarget) as Observable['removeEventListener'],
				phase: this.CAPTURING_PHASE,
			});

			if (this.propagationState !== EventPropagationState.resume) {
				reset();
				return this.returnValue;
			}
		}

		// Bubbling phase, e.g. [Button, StackLayout, Page]
		// It's correct to dispatch the event to the target during both phases.
		for (let i = eventPath.length - 1; i >= 0; i--) {
			const currentTarget = eventPath[i];
			this.eventPhase = this.target === this.currentTarget ? this.AT_TARGET : this.BUBBLING_PHASE;

			this.listenersLazyCopy = this.listenersLive = currentTarget.getEventList(this.type) || emptyArray;
			this.handleEvent({
				data,
				isGlobal: false,
				removeEventListener: currentTarget.removeEventListener.bind(currentTarget) as Observable['removeEventListener'],
				phase: this.BUBBLING_PHASE,
			});

			if (this.propagationState !== EventPropagationState.resume) {
				reset();
				return this.returnValue;
			}

			// If the event doesn't bubble, then, having dispatched it at the
			// target (the first iteration of this loop) we don't let it
			// propagate any further.
			if (!this.bubbles) {
				reset();
				break;
			}

			// Restore event phase in case it changed to AT_TARGET during
			// this.handleEvent().
			this.eventPhase = this.BUBBLING_PHASE;
		}

		this.listenersLazyCopy = this.listenersLive = getGlobalEventHandlersPostHandling?.() || emptyArray;
		this.handleEvent({
			data,
			isGlobal: true,
			removeEventListener: removeGlobalEventListener,
			phase: this.BUBBLING_PHASE,
		});

		reset();
		return this.returnValue;
	}

	private handleEvent({ data, isGlobal, phase, removeEventListener }: { data: EventData; isGlobal: boolean; phase: 0 | 1 | 2 | 3; removeEventListener: (eventName: string, callback?: any, thisArg?: any, capture?: boolean) => void }) {
		// Set a listener to clone the array just before any mutations.
		this.listenersLive.onMutation = this.onCurrentListenersMutation;

		for (let i = this.listenersLazyCopy.length - 1; i >= 0; i--) {
			const listener = this.listenersLazyCopy[i];

			// Assigning variables this old-fashioned way is up to 50
			// nanoseconds faster per run than ESM destructuring syntax.
			const callback = listener.callback;
			const capture = listener.capture;
			const thisArg = listener.thisArg;
			const once = listener.once;
			const passive = listener.once;

			// The event listener may have been removed since we took a copy of
			// the array, so bail out if so.
			//
			// We simply use a strict equality check here because we trust that
			// the listeners provider will never allow two deeply-equal
			// listeners into the array.
			if (!this.listenersLive.includes(listener)) {
				continue;
			}

			// Handle only the events appropriate to the phase. Global events
			// (a NativeScript-only concept) are allowed to be handled
			// regardless of phase, for backwards-compatibility.
			if (!isGlobal && ((phase === this.CAPTURING_PHASE && !capture) || (phase === this.BUBBLING_PHASE && capture))) {
				continue;
			}

			if (once) {
				removeEventListener(this.type, callback, thisArg, capture);
			}

			// Consistent with the original implementation, we only apply
			// context to the function if thisArg is truthy.
			const returnValue = callback.apply(thisArg || undefined, [data]);

			// This ensures that errors thrown inside asynchronous functions do
			// not get swallowed.
			if (returnValue instanceof Promise) {
				returnValue.catch(console.error);
			}

			if (passive && this.defaultPrevented) {
				console.warn('Unexpected call to event.preventDefault() in passive event listener.');
			}

			if (this.propagationState === EventPropagationState.stopImmediate) {
				break;
			}
		}

		// Make sure we clear the callback before we exit the function,
		// otherwise we may wastefully clone the array on future mutations.
		this.listenersLive.onMutation = null;
	}
}

enum EventPropagationState {
	resume,
	stop,
	stopImmediate,
}
