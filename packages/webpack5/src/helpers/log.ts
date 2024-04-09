import { env } from '@akylas/nativescript-webpack';
import dedent from 'ts-dedent';

// de-indents strings so multi-line string literals can be used
function cleanup(data: any[]) {
	return data.map((d) => {
		if (typeof d === 'string') {
			return dedent(d);
		}
		return d;
	});
}

export function error(...data: any): Error {
	console.warn(`[@akylas/nativescript-webpack] Error: \n`, ...cleanup(data));

	// we return the error - the caller can throw or ignore
	if (typeof data[0] === 'string') {
		return new Error(
			'\n\n[@akylas/nativescript-webpack]\n---\n\n' +
				dedent(data[0]) +
				'\n\n---\n',
		);
	}

	return new Error('@akylas/nativescript-webpack ran into a problem...');
}

export function warn(...data: any): void {
	console.warn(`[@akylas/nativescript-webpack] Warn: \n`, ...cleanup(data));
}

const warnedMap: any = {};
export function warnOnce(key: string, ...data: any): void {
	if (warnedMap[key]) {
		return;
	}

	warnedMap[key] = true;
	warn(...data);
}

export function info(...data: any): void {
	if (env.verbose) {
		console.log(`[@akylas/nativescript-webpack] Info: \n`, ...cleanup(data));
	}
}

// todo: refine
// export function error(message: string, info?: { possibleCauses?: string[] }) {
// 	console.error(`
// 	NativeScript Webpack encountered an error and cannot proceed with the build:
//
// 	${message}
//
// 	Possible causes:
// 	${info?.possibleCauses?.map((cause) => `- ${cause}`).join('\n')}
// 	`);
// }
