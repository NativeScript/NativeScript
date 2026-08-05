// __ns__setTimeout / __ns__setInterval are Rust-backed timers registered by
// the windows-runtime. They use a background scheduler thread and post
// callbacks back to the V8 thread via a per-thread channel that is drained
// on every pump() tick — no XAML dispatcher required.
declare function __ns__setTimeout(callback: Function, ms: number): number;
declare function __ns__setInterval(callback: Function, ms: number): number;
declare function __ns__clearTimeout(id: number): void;
declare function __ns__clearInterval(id: number): void;

export function setTimeout(callback: Function, milliseconds = 0, ...args: any[]): number {
    milliseconds += 0;
    const invoke = args.length ? () => callback(...args) : callback;
    return __ns__setTimeout(zonedCallback(invoke), milliseconds);
}

export function clearTimeout(id: number): void {
    __ns__clearTimeout(id);
}

export function setInterval(callback: Function, milliseconds = 0, ...args: []): number {
    const invoke = args.length ? () => callback(...args) : callback;
    return __ns__setInterval(zonedCallback(invoke), milliseconds);
}

export const clearInterval = clearTimeout;
