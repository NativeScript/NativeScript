export function getFileExtension(path: string): string {
	if (!path) {
		return '';
	}
	const index = path.lastIndexOf('.');
	return index !== -1 ? path.substring(index + 1) : '';
}
