/**
 * Android specific timer functions implementation.
 */
let timeoutHandler;
const timeoutCallbacks = {};
// this is needed to keep a strong reference to the callback
// currently fixes a race condition in V8 with the android runtime implementation of WeakRef
// there are fixes in the android runtime that will remove the need for this
const timeoutCallbacksCb = {};
let timerId = 0;

function createHandlerAndGetId(): number {
	if (!timeoutHandler) {
		timeoutHandler = new android.os.Handler(android.os.Looper.myLooper());
	}

	timerId++;

	return timerId;
}

export function setTimeout(callback: Function, milliseconds = 0, ...args): number {
	// Cast to Number
	milliseconds += 0;

	const id = createHandlerAndGetId();
	const invoke = () => callback(...args);
	const zoneBound = zonedCallback(invoke);

	const runnable = new java.lang.Runnable({
		run: () => {
			zoneBound();

			if (timeoutCallbacks[id]) {
				delete timeoutCallbacks[id];
				delete timeoutCallbacksCb[id];
			}
		},
	});

	if (!timeoutCallbacks[id]) {
		timeoutCallbacks[id] = runnable;
		timeoutCallbacksCb[id] = callback;
	}

	timeoutHandler.postDelayed(runnable, long(milliseconds));

	return id;
}

export function clearTimeout(id: number): void {
	const index = id;
	if (timeoutCallbacks[index]) {
		timeoutHandler.removeCallbacks(timeoutCallbacks[index]);
		delete timeoutCallbacks[index];
		delete timeoutCallbacksCb[index];
	}
}

export function setInterval(callback: Function, milliseconds = 0, ...args): number {
	milliseconds += 0;

	const id = createHandlerAndGetId();
	const handler = timeoutHandler;
	const invoke = () => callback(...args);
	const zoneBound = zonedCallback(invoke);
	let nextDueTime = Date.now() + milliseconds;

	const runnable = new java.lang.Runnable({
		run: () => {
			const executionStart = Date.now();
			zoneBound();

			if (timeoutCallbacks[id]) {
				const executionTime = Date.now() - executionStart;

				// Update the next due time based on when this callback was supposed to execute
				nextDueTime += milliseconds;

				// If the callback took longer than the interval, skip ahead to avoid catch-up
				const now = Date.now();
				if (nextDueTime <= now) {
					// Calculate how many intervals we should skip
					const missedIntervals = Math.floor((now - nextDueTime) / milliseconds);
					nextDueTime += (missedIntervals + 1) * milliseconds;
				}

				const delay = Math.max(0, nextDueTime - now);
				handler.postDelayed(runnable, long(delay));
			}
		},
	});

	if (!timeoutCallbacks[id]) {
		timeoutCallbacks[id] = runnable;
		timeoutCallbacksCb[id] = callback;
	}

	handler.postDelayed(runnable, long(milliseconds));
	return id;
}

export const clearInterval = clearTimeout;
