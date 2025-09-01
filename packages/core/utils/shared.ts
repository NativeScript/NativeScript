// Note: these could be removed in the future - used internally largely with GC handling right now
/**
 * Creates a debounced function that delays invoking the provided function until after a specified delay
 * @param fn The function to debounce
 * @param delay The number of milliseconds to delay
 * @param param2 Options for the debounce behavior
 * @returns A new debounced function
 */
export function debounce(fn: any, delay = 300, { leading }: { leading?: boolean } = {}) {
	let timer: NodeJS.Timeout;
	return (...args: Array<any>) => {
		if (timer === undefined && leading) {
			fn.apply(this, args);
		}
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
			timer = undefined;
		}, delay);
	};
}

/**
 * Creates a throttled function that only invokes the provided function at most once per specified delay
 * @param fn The function to throttle
 * @param delay The number of milliseconds to delay
 * @returns A new throttled function
 */
export function throttle(fn: Function, delay = 300) {
	let waiting = false;
	return function (...args) {
		if (!waiting) {
			fn.apply(this, args);
			waiting = true;
			setTimeout(function () {
				waiting = false;
			}, delay);
		}
	};
}
