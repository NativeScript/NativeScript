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

export function error(...data: any) {
	console.error(`[@nativescript/webpack]`, ...data);
}

export function warn(...data: any) {
	console.warn(`[@nativescript/webpack]`, ...data);
}

export function info(...data: any) {
	console.info(`[@nativescript/webpack]`, ...data);
}
