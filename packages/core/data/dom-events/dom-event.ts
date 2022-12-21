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

enum EventPropagationState {
	resume,
	stop,
	stopImmediate,
}

export class DOMEvent implements Event {
	// Assigning properties directly to the prototype where possible avoids
	// wasted work in the constructor on each instance construction.
	static readonly NONE = 0;
	static readonly CAPTURING_PHASE = 1;
	static readonly AT_TARGET = 2;
	static readonly BUBBLING_PHASE = 3;

	// Assigning initial property values directly on the prototype where
	// possible avoids wasted work in the constructor on each instance
	// construction. It's ugly, but saves about 100 nanoseconds per
	// construction.
	static {
		Object.defineProperty(DOMEvent.prototype, 'NONE', { value: DOMEvent.NONE });
		Object.defineProperty(DOMEvent.prototype, 'CAPTURING_PHASE', { value: DOMEvent.CAPTURING_PHASE });
		Object.defineProperty(DOMEvent.prototype, 'AT_TARGET', { value: DOMEvent.AT_TARGET });
		Object.defineProperty(DOMEvent.prototype, 'BUBBLING_PHASE', { value: DOMEvent.BUBBLING_PHASE });
		Object.defineProperty(DOMEvent.prototype, 'cancelBubble', { value: false, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'defaultPrevented', { value: false, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'isTrusted', { value: false, writable: true, enumerable: true });
		Object.defineProperty(DOMEvent.prototype, 'eventPhase', { value: DOMEvent.NONE, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'currentTarget', { value: null, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'target', { value: null, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'propagationState', { value: EventPropagationState.resume, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'listenersLive', { value: emptyArray, writable: true });
		Object.defineProperty(DOMEvent.prototype, 'listenersLazyCopy', { value: emptyArray, writable: true });
	}

	declare NONE: 0;
	declare CAPTURING_PHASE: 1;
	declare AT_TARGET: 2;
	declare BUBBLING_PHASE: 3;

	/**
	 * Returns true or false depending on how event was initialized. Its return
	 * value does not always carry meaning, but true can indicate that part of
	 * the operation during which event was dispatched, can be canceled by
	 * invoking the preventDefault() method.
	 */
	declare readonly cancelable: boolean;

	/**
	 * Returns true or false depending on how event was initialized. True if
	 * event goes through its target's ancestors in reverse tree order, and
	 * false otherwise.
	 */
	declare readonly bubbles: boolean;

	/**
	 * @private
	 * Internal API to facilitate testing - to be removed once we've completed
	 * the breaking changes to migrate fully to DOMEvents.
	 *
	 * Gets the last event to be dispatched, allowing you to access the DOM
	 * Event that corresponds to the currently-running callback.
	 */
	static unstable_currentEvent: DOMEvent | null = null;

	/** @deprecated Setting this value does nothing. */
	declare cancelBubble: boolean;

	/**
	 * Returns true or false depending on how event was initialized. True if
	 * event invokes listeners past a ShadowRoot node that is the root of its
	 * target, and false otherwise.
	 */
	declare readonly composed: boolean;

	/**
	 * Returns true if event was dispatched by the user agent, and false
	 * otherwise.
	 * For now, all NativeScript events will have isTrusted: false.
	 */
	declare readonly isTrusted: boolean;

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
	declare defaultPrevented: boolean;

	// Strictly speaking, we should use { public get, private set } for all of
	// `eventPhase`, `currentTarget`, and `target`, but using simple properties
	// saves 800 nanoseconds per run of handleEvent() (and so is one of our
	// biggest optimisations).

	/**
	 * Returns the event's phase, which is one of NONE, CAPTURING_PHASE,
	 * AT_TARGET, and BUBBLING_PHASE.
	 */
	declare eventPhase: 0 | 1 | 2 | 3;

	/**
	 * Returns the object whose event listener's callback is currently being
	 * invoked.
	 */
	declare currentTarget: Observable | null;

	/** Returns the object to which event is dispatched (its target). */
	declare target: Observable | null;

	// From CustomEvent rather than Event. Can consider factoring out this
	// aspect into DOMCustomEvent.
	declare readonly detail: unknown | null;

	private declare propagationState: EventPropagationState;

	constructor(
		/**
		 * Returns the type of event, e.g. "click", "hashchange", or "submit".
		 */
		public type: string,
		options: CustomEventInit = {}
	) {
		// Avoid destructuring the options object (might save some nanoseconds).
		this.bubbles = options.bubbles === true;
		this.cancelable = options.cancelable === true;
		this.composed = options.composed === true;
		this.detail = options.detail === undefined ? null : options.detail;
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
		recycledEventPath.splice(0, recycledEventPath.length, responder);

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
		this.defaultPrevented = true;
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
	private declare listenersLive: MutationSensitiveArray<ListenerEntry>;
	private declare listenersLazyCopy: ListenerEntry[];

	// Creating this upon class construction as an arrow function rather than as
	// an inline function bound afresh on each usage saves about 210 nanoseconds
	// per run of dispatchTo().
	//
	// Creating it on the prototype and calling with the context instead saves a
	// further 125 nanoseconds per run of dispatchTo().
	//
	// Creating it on the prototype and binding the context instead saves a
	// further 30 nanoseconds per run of dispatchTo().
	private onCurrentListenersMutation() {
		// Cloning the array via spread syntax is up to 180 nanoseconds
		// faster per run than using Array.prototype.slice().
		this.listenersLazyCopy = [...this.listenersLive];
		this.listenersLive.onMutation = null;
	}

	/**
	 * Resets any internal state to allow the event to be redispatched. Call
	 * this before returning from dispatchTo().
	 */
	// Declaring this on the prototype rather than as an arrow function saves
	// 190 nanoseconds per dispatchTo().
	private resetForRedispatch() {
		this.currentTarget = null;
		this.target = null;
		this.eventPhase = DOMEvent.NONE;
		this.propagationState = EventPropagationState.resume;
		this.listenersLive = emptyArray;
		this.listenersLazyCopy = emptyArray;
	}
	/**
	 * Dispatches a synthetic event event to target and returns true if either
	 * event's cancelable attribute value is false or its preventDefault()
	 * method was not invoked, and false otherwise.
	 */
	// Taking multiple params rather than a single property bag saves about 100
	// nanoseconds per call.
	dispatchTo(target: Observable, data: EventData, getGlobalEventHandlersPreHandling?: () => MutationSensitiveArray<ListenerEntry>, getGlobalEventHandlersPostHandling?: () => MutationSensitiveArray<ListenerEntry>): boolean {
		if (this.eventPhase !== DOMEvent.NONE) {
			throw new Error('Tried to dispatch a dispatching event');
		}
		this.eventPhase = DOMEvent.CAPTURING_PHASE;
		this.target = target;
		this.defaultPrevented = false;

		// Internal API to facilitate testing - to be removed once we've
		// completed the breaking changes to migrate fully to DOMEvents.
		DOMEvent.unstable_currentEvent = this;

		// `Observable.removeEventListener` would likely suffice, but grabbing
		// the static method named `removeEventListener` on the target's class
		// allows us to be robust to the possiblity of the case of the target
		// overriding it (however unlikely).
		//
		// Rather than eagerly binding the context to the function right here,
		// we pass the function along with its context to handleEvent() to allow
		// binding only once needed - doing this for each of the
		// removeEventListener callbacks saves 100 nanoseconds per dispatchTo()
		// call.
		const removeGlobalEventListener = (target.constructor as unknown as typeof target).removeEventListener as Observable['removeEventListener'];

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
		this.handleEvent(data, true, DOMEvent.CAPTURING_PHASE, removeGlobalEventListener, target.constructor);

		const eventPath = this.getEventPath(target, 'capture');

		// Capturing phase, e.g. [Page, StackLayout, Button]
		// This traditional C loop runs 150 nanoseconds faster than a for...of
		// loop.
		for (let i = 0; i < eventPath.length; i++) {
			const currentTarget = eventPath[i];
			this.currentTarget = currentTarget;
			this.eventPhase = this.target === this.currentTarget ? DOMEvent.AT_TARGET : DOMEvent.CAPTURING_PHASE;

			this.listenersLazyCopy = this.listenersLive = currentTarget.getEventList(this.type) || emptyArray;
			this.handleEvent(data, false, DOMEvent.CAPTURING_PHASE, currentTarget.removeEventListener, currentTarget);

			if (this.propagationState !== EventPropagationState.resume) {
				this.resetForRedispatch();
				return !this.defaultPrevented;
			}
		}

		// Bubbling phase, e.g. [Button, StackLayout, Page]
		// It's correct to dispatch the event to the target during both phases.
		for (let i = eventPath.length - 1; i >= 0; i--) {
			const currentTarget = eventPath[i];
			this.eventPhase = this.target === this.currentTarget ? DOMEvent.AT_TARGET : DOMEvent.BUBBLING_PHASE;

			this.listenersLazyCopy = this.listenersLive = currentTarget.getEventList(this.type) || emptyArray;
			this.handleEvent(data, false, DOMEvent.BUBBLING_PHASE, currentTarget.removeEventListener, currentTarget);

			if (this.propagationState !== EventPropagationState.resume) {
				this.resetForRedispatch();
				return !this.defaultPrevented;
			}

			// If the event doesn't bubble, then, having dispatched it at the
			// target (the first iteration of this loop) we don't let it
			// propagate any further.
			if (!this.bubbles) {
				this.resetForRedispatch();
				break;
			}

			// Restore event phase in case it changed to AT_TARGET during
			// this.handleEvent().
			this.eventPhase = DOMEvent.BUBBLING_PHASE;
		}

		this.listenersLazyCopy = this.listenersLive = getGlobalEventHandlersPostHandling?.() || emptyArray;
		this.handleEvent(data, true, DOMEvent.BUBBLING_PHASE, removeGlobalEventListener, target.constructor);

		this.resetForRedispatch();
		return !this.defaultPrevented;
	}

	// Taking multiple params instead of a single property bag saves 250
	// nanoseconds per dispatchTo() call.
	private handleEvent(data: EventData, isGlobal: boolean, phase: 0 | 1 | 2 | 3, removeEventListener: (eventName: string, callback?: any, thisArg?: any, capture?: boolean) => void, removeEventListenerContext: unknown) {
		// Set a listener to clone the array just before any mutations.
		//
		// Lazy-binding this (binding it just before being called, rather than
		// up-front) unexpectedly seems to slow things down - v8 may be
		// optimising it for us or something.
		this.listenersLive.onMutation = this.onCurrentListenersMutation.bind(this);

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
			if (!isGlobal && ((phase === DOMEvent.CAPTURING_PHASE && !capture) || (phase === DOMEvent.BUBBLING_PHASE && capture))) {
				continue;
			}

			if (once) {
				removeEventListener.call(removeEventListenerContext, this.type, callback, thisArg, capture);
			}

			// Consistent with the original implementation, we only apply
			// context to the function if thisArg is truthy.
			//
			// We prefer Function.call() over Function.apply() as it avoids
			// having to allocate an array just to hold the args (saves 30
			// nanoseconds per dispatchTo() call).
			const returnValue = callback.call(thisArg || undefined, data);

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
