// Shared helpers and types for utils, used by both native-helper and common.
// Only put platform-agnostic logic here.

export function getFileExtension(path: string): string {
	if (!path) {
		return '';
	}
	const index = path.lastIndexOf('.');
	return index !== -1 ? path.substring(index + 1) : '';
}

// Add more shared helpers/types/constants as needed.
