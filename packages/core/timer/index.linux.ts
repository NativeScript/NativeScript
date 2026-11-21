// GLib timers from the runtime (they also fire inside GTK main loops).
declare function __ns__setTimeout(callback: Function, ms: number): number;
declare function __ns__setInterval(callback: Function, ms: number): number;
declare function __ns__clearTimeout(id: number): void;

export function setTimeout(callback: Function, milliseconds = 0, ...args: any[]): number {
	const invoke = args.length ? () => callback(...args) : callback;
	return __ns__setTimeout(zonedCallback(invoke), milliseconds + 0);
}

export function clearTimeout(id: number): void {
	__ns__clearTimeout(id);
}

export function setInterval(callback: Function, milliseconds = 0, ...args: any[]): number {
	const invoke = args.length ? () => callback(...args) : callback;
	return __ns__setInterval(zonedCallback(invoke), milliseconds + 0);
}

export const clearInterval = clearTimeout;
