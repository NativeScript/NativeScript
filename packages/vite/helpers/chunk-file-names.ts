/**
 * File names for the app bundle's non-entry chunks.
 *
 * Core's Android activity (`ui/frame/activity.android`) is imported
 * dynamically, so it lands in a chunk of its own. The static binding
 * generator writes that chunk's path into the generated Java activity at
 * native build time, and the chunk is kept unhashed so the path stays valid:
 * with a hash, a rebuild that changed it left Java loading the previous
 * build's chunk, still on the device, against the new vendor chunk
 * ("isEmbedded is not a function").
 */
export function chunkFileNames(chunk: { name?: string }): string {
	if (chunk.name === 'vendor') return 'vendor.mjs';
	if (chunk.name?.startsWith('activity.android')) return '[name].mjs';
	// Place worker files at root level, not in assets/
	if (chunk.name && chunk.name.includes('worker')) {
		return '[name]-[hash].js';
	}
	return '[name]-[hash].mjs';
}
