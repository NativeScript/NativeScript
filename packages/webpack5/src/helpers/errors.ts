// todo: refine
export function error(message: string, info?: { possibleCauses?: string[] }) {
	console.error(`
	NativeScript Webpack encountered an error and cannot proceed with the build:

	${message}

	Possible causes:
	${info?.possibleCauses?.map((cause) => `- ${cause}`).join('\n')}
	`);
}
