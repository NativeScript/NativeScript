import { O_APPEND, O_CREAT, O_DSYNC, O_EXCL, O_RDONLY, O_SYNC, O_TRUNC, O_WRONLY } from './constants';
export function parseFlags(flags: string) {
	let ret = 0;
	switch (flags) {
		case 'a':
			ret = O_APPEND | O_CREAT;
			break;
		case 'ax':
			ret = O_APPEND | O_CREAT | O_EXCL;
			break;
		case 'a+':
			ret = O_APPEND | O_CREAT | O_RDONLY;
			break;
		case 'ax+':
			ret = O_APPEND | O_CREAT | O_RDONLY | O_EXCL;
			break;
		case 'as':
			ret = O_APPEND | O_CREAT | O_DSYNC;
			break;
		case 'as+':
			ret = O_APPEND | O_CREAT | O_DSYNC | O_RDONLY;
			break;
		case 'r':
			ret = O_RDONLY;
			break;
		case 'r+':
			ret = O_RDONLY | O_WRONLY;
			break;
		case 'rs+':
			ret = O_RDONLY | O_WRONLY | O_DSYNC;
			break;
		case 'w':
			ret = O_WRONLY;
			break;
		case 'wx':
			ret = O_WRONLY | O_EXCL;
			break;
		case 'w+':
			ret = O_WRONLY | O_RDONLY | O_CREAT | O_TRUNC;
			break;
		case 'wx+':
			ret = O_WRONLY | O_RDONLY | O_CREAT | O_TRUNC | O_EXCL;
			break;
	}
	return ret;
}

export class NativeError extends Error {
	#native: any;
	static fromNative(native: any, message?: string) {
		if (global.isAndroid) {
			const error = new NativeError(message || native?.getMessage?.());
			error.#native = native;
			return error;
		} else if (global.isIOS) {
			const error = new NativeError(message || native?.localizedDescription);
			error.#native = native;
			return error;
		} else {
		}
	}

	get native() {
		return this.#native;
	}
}
