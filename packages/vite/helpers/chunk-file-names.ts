export function chunkFileNames(chunk: { name?: string }): string {
	if (chunk.name === 'vendor') return 'vendor.mjs';
	if (chunk.name?.startsWith('activity.android')) return '[name].mjs';
	// Place worker files at root level, not in assets/
	if (chunk.name && chunk.name.includes('worker')) {
		return '[name]-[hash].js';
	}
	return '[name]-[hash].mjs';
}
