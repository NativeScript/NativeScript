export function sanitizeName(appName: string): string {
	return appName
		.split('')
		.filter((c) => /[a-zA-Z0-9]/.test(c))
		.join('');
}
