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
	// Cast to Number
	milliseconds += 0;

	const id = createHandlerAndGetId();
	const handler = timeoutHandler;
	const invoke = () => callback(...args);
	const zoneBound = zonedCallback(invoke);
	const startOffset = milliseconds > 0 ? Date.now() % milliseconds : 0;
	function nextCallMs() {
		return milliseconds > 0 ? milliseconds - ((Date.now() - startOffset) % milliseconds) : milliseconds;
	}

	const runnable = new java.lang.Runnable({
		run: () => {
			zoneBound();
			if (timeoutCallbacks[id]) {
				handler.postDelayed(runnable, long(nextCallMs()));
			}
		},
	});

	if (!timeoutCallbacks[id]) {
		timeoutCallbacks[id] = runnable;
		timeoutCallbacksCb[id] = callback;
	}

	timeoutHandler.postDelayed(runnable, long(nextCallMs()));

	return id;
}

export const clearInterval = clearTimeout;
