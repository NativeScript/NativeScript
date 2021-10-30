import AbortSignal, { abortSignal, createAbortSignal } from "./abortsignal"
/**
 * The AbortController.
 * @see https://dom.spec.whatwg.org/#abortcontroller
 */
export default class AbortController {
    /**
     * Initialize this controller.
     */
    public constructor() {
        signals.set(this, createAbortSignal())
    }

    /**
     * Returns the `AbortSignal` object associated with this object.
     */
    public get signal(): AbortSignal {
        return getSignal(this)
    }

    /**
     * Abort and signal to any observers that the associated activity is to be aborted.
     */
    public abort(): void {
        abortSignal(getSignal(this))
    }
}

/**
 * Associated signals.
 */
const signals = new WeakMap<AbortController, AbortSignal>()

/**
 * Get the associated signal of a given controller.
 */
function getSignal(controller: AbortController): AbortSignal {
    const signal = signals.get(controller)
    if (signal == null) {
        throw new TypeError(
            `Expected 'this' to be an 'AbortController' object, but got ${
                controller === null ? "null" : typeof controller
            }`,
        )
    }
    return signal
}

// Properties should be enumerable.
Object.defineProperties(AbortController.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true },
})

if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController",
    })
}

export { AbortController, AbortSignal }