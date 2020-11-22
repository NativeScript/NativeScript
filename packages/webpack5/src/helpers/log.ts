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
	console.error(`[@nativescript/webpack]`, ...cleanup(data));

	// we return the error - the caller can throw or ignore
	if (typeof data[0] === 'string') {
		return new Error(data[0]);
	}

	return new Error('@nativescript/webpack ran into a problem...');
}

export function warn(...data: any): void {
	console.warn(`[@nativescript/webpack]`, ...cleanup(data));
}

export function info(...data: any): void {
	console.info(`[@nativescript/webpack]`, ...cleanup(data));
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
