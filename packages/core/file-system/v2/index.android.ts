import { NativeError, parseFlags } from './utils';

class Callback<T> extends org.nativescript.widgets.filesystem.AsyncCallback<T> {}

export function open(path: string, flags: string | number, callback: (error: Error, fd: number) => void);
export function open(path: string, flags: string | number, mode: number | undefined | null, callback: (error: Error | null, fd: number) => void);
export function open(path: string, flags: string | number, callback: (error: Error | null, fd: number) => void);
export function open(path: string, flags: unknown, mode?: unknown, callback?: unknown) {
	let realflags = parseFlags('r');
	let realMode = 0o666;
	if (typeof flags === 'string') {
		realflags = parseFlags(flags);
	}

	if (typeof flags === 'number') {
		realflags = flags;
	}

	if (typeof mode === 'number') {
		realMode = mode;
	}
	org.nativescript.widgets.filesystem.FileSystem.open(path, realflags, realMode, (fd, error) => {
		const len = arguments.length;
		let cb;
		if (len === 2) {
			cb = flags;
		} else if (len === 3) {
			cb = mode;
		} else if (len === 4) {
			cb = callback;
		}
		if (typeof cb === 'function') {
			let e = null;
			if (error) {
				e = NativeError.fromNative(error);
			}

			cb(e, fd);
		}
	});
}
