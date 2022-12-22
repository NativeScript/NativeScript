import type { EventData, ListenerEntry, Observable } from '../observable/index';

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
const emptyArray: ListenerEntry[] = [];

enum EventPropagationState {
	resume,
	stop,
	stopImmediate,
}

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
	// saves 800 nanoseconds per run of dispatchTo() (and so is one of our
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

	// During handleEvent(), we want to work on a copy of the listeners array,
	// as any callback could modify the original array during the loop.
	//
	// However, cloning arrays is expensive on this hot path, so we'll do it
	// lazily - i.e. only take a clone if a mutation is about to happen.
	// This optimisation is particularly worth doing as it's very rare that
	// an event listener callback will end up modifying the listeners array.
	private declare listeners: ListenerEntry[];

	/**
	 * Recycling the event path array rather than allocating a new one each time
	 * saves about 210 nanoseconds per dispatchTo() call (and avoids memory pressure
	 * and GC).
	 */
	private readonly recycledEventPath: Observable[] = [];

	/**
	 * Returns the event's timestamp as the number of milliseconds measured
	 * relative to the time origin.
	 */
	readonly timeStamp: DOMHighResTimeStamp = timeOrigin - Date.now();

	constructor(
		/**
		 * Returns the type of event, e.g. "click", "hashchange", or "submit".
		 */
		public type: string,
		options?: CustomEventInit
	) {
		// Avoid destructuring the options object (might save some nanoseconds).
		this.bubbles = options?.bubbles ?? false;
		this.cancelable = options?.cancelable ?? false;
		this.composed = options?.composed ?? false;
		this.detail = options?.detail ?? null;
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
		this.recycledEventPath.splice(0, this.recycledEventPath.length, responder);

		if (!responder.isViewBase()) {
			return this.recycledEventPath;
		}

		// Determining the function up-front (rather than inside the loop) saves
		// 50 nanoseconds per dispatchTo() call.
		const insert = path === 'capture' ? this.recycledEventPath.unshift.bind(this.recycledEventPath) : this.recycledEventPath.push.bind(this.recycledEventPath);

		let nextResponder = responder.parent;
		while (nextResponder) {
			insert(nextResponder);

			// TODO: decide whether to walk up from Page to Frame, and whether
			// to then walk from Frame to Application or something.
			nextResponder = nextResponder?.parent;
		}
		return this.recycledEventPath;
	}

	/** @deprecated */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
		// This would be trivial to implement, but we'd have to remove the
		// readonly modifier from `bubbles` and `cancelable`, which would be a
		// shame just for the sake of supporting a deprecated method.
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

	/**
	 * Dispatches a synthetic event event to target and returns true if either
	 * event's cancelable attribute value is false or its preventDefault()
	 * method was not invoked, and false otherwise.
	 */
	// Taking multiple params rather than a single property bag saves about 100
	// nanoseconds per call.
	dispatchTo(target: Observable, data: EventData, getGlobalEventHandlers?: (data: EventData, eventType: 'First' | '') => readonly ListenerEntry[] | undefined): boolean {
		if (this.eventPhase !== DOMEvent.NONE) {
			throw new Error('Tried to dispatch a dispatching event');
		}
		this.eventPhase = DOMEvent.CAPTURING_PHASE;
		this.target = target;
		this.defaultPrevented = false;

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

		this.handleEvent(data, true, () => getGlobalEventHandlers?.(data, 'First') || emptyArray, DOMEvent.CAPTURING_PHASE, removeGlobalEventListener, target.constructor);

		const eventPath = this.getEventPath(target, 'capture');

		// Capturing phase, e.g. [Page, StackLayout, Button]
		// This traditional C loop runs 150 nanoseconds faster than a for...of
		// loop.
		for (let i = 0; i < eventPath.length; i++) {
			const currentTarget = eventPath[i];
			this.currentTarget = currentTarget;
			this.eventPhase = this.target === this.currentTarget ? DOMEvent.AT_TARGET : DOMEvent.CAPTURING_PHASE;

			this.handleEvent(data, false, () => currentTarget.getEventList(this.type) || emptyArray, DOMEvent.CAPTURING_PHASE, currentTarget.removeEventListener, currentTarget);

			if (this.propagationState !== EventPropagationState.resume) {
				this.resetForRedispatch();
				return !this.defaultPrevented;
			}
		}

		// Bubbling phase, e.g. [Button, StackLayout, Page]
		// It's correct to dispatch the event to the target during both phases.
		for (let i = eventPath.length - 1; i >= 0; i--) {
			const currentTarget = eventPath[i];
			this.currentTarget = currentTarget;
			this.eventPhase = this.target === this.currentTarget ? DOMEvent.AT_TARGET : DOMEvent.BUBBLING_PHASE;

			this.handleEvent(data, false, () => currentTarget.getEventList(this.type) || emptyArray, DOMEvent.BUBBLING_PHASE, currentTarget.removeEventListener, currentTarget);

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

		this.handleEvent(data, true, () => getGlobalEventHandlers?.(data, '') || emptyArray, DOMEvent.BUBBLING_PHASE, removeGlobalEventListener, target.constructor);

		this.resetForRedispatch();
		return !this.defaultPrevented;
	}

	// Taking multiple params instead of a single property bag saves 250
	// nanoseconds per dispatchTo() call.
	private handleEvent(data: EventData, isGlobal: boolean, getListeners: () => readonly ListenerEntry[], phase: 0 | 1 | 2 | 3, removeEventListener: (eventName: string, callback?: any, thisArg?: any, capture?: boolean) => void, removeEventListenerContext: unknown) {
		// Clone the array just before any mutations. I tried swapping this out
		// for a copy-on-write array, but as it had to maintain its own array of
		// listeners for any write actions, it actually ran significantly
		// slower.
		//
		// There's no clear observable difference between array spread and slice
		// here, but I think slice has reason to run faster.
		const listeners = getListeners().slice();

		for (let i = listeners.length - 1; i >= 0; i--) {
			const listener = listeners[i];

			// Assigning variables this old-fashioned way is up to 50
			// nanoseconds faster per run than ESM destructuring syntax.
			const capture = listener.capture;

			// Handle only the events appropriate to the phase. Global events
			// (a NativeScript-only concept) are allowed to be handled
			// regardless of phase, for backwards-compatibility.
			if (!isGlobal && ((phase === DOMEvent.CAPTURING_PHASE && !capture) || (phase === DOMEvent.BUBBLING_PHASE && capture))) {
				continue;
			}

			// The event listener may have been removed since we took a copy of
			// the array, so bail out if so.
			//
			// We simply use a strict equality check here because we trust that
			// the listeners provider will never allow two deeply-equal
			// listeners into the array.
			//
			// This check costs 150 ns per dispatchTo(). I experimented with
			// optimising this by building a Set of ListenerEntries that got
			// removed during this handleEvent() (by introducing a method to
			// MutationSensitiveArray called afterRemoval, similar to
			// beforeMutation) to allow O(1) lookup, but it went 1000 ns slower
			// in practice, so it stays!
			if (!getListeners().includes(listener)) {
				continue;
			}

			const callback = listener.callback;
			const thisArg = listener.thisArg;

			if (listener.once) {
				// Calling with the context (rather than eagerly pre-binding it)
				// saves about 100 nanoseconds per dispatchTo() call.
				removeEventListener.call(removeEventListenerContext, this.type, callback, thisArg, capture);
			}

			// Internal API to facilitate testing - to be removed once we've
			// completed the breaking changes to migrate fully to DOMEvents.
			//
			// We update DOMEvent.unstable_currentEvent just before each call to
			// the callback. Doing it only in dispatchTo() would seem more
			// efficient, but it wouldn't technically be correct as it's
			// possible for a callback itself to dispatch another event. Because
			// we handle events synchronously rather than using a queue, it
			// would mean that DOMEvent.unstable_currentEvent would correctly
			// point at the sub-event, but subsequently fail to update to point
			// at the initial event.
			//
			// Note that this will fail to set itself back to null if the
			// callback throws an error, but that's unlikely to break anything
			// in practice as it's only intended be valid when accessed
			// during the callback anyway. We reset it mainly just to stop
			// retaining the event.
			DOMEvent.unstable_currentEvent = this;

			// Consistent with the original implementation, we only apply
			// context to the function if thisArg is truthy.
			//
			// We prefer Function.call() over Function.apply() as it avoids
			// having to allocate an array just to hold the args (saves 30
			// nanoseconds per dispatchTo() call).
			const returnValue = callback.call(thisArg || undefined, data);

			DOMEvent.unstable_currentEvent = null;

			// This ensures that errors thrown inside asynchronous functions do
			// not get swallowed.
			//
			// This check costs only 25 nanoseconds per dispatchTo(), so is not
			// a huge deal.
			if (returnValue instanceof Promise) {
				returnValue.catch(console.error);
			}

			if (listener.passive && this.defaultPrevented) {
				console.warn('Unexpected call to event.preventDefault() in passive event listener.');
			}

			if (this.propagationState === EventPropagationState.stopImmediate) {
				break;
			}
		}

		// Make sure we clear the callback before we exit the function,
		// otherwise we may wastefully clone the array on future mutations.
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
	}
}
