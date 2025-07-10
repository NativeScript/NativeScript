// Shared types and interfaces for http and image-source modules.
// Only put platform-agnostic types/interfaces here.

// Example: (add more as needed)
// TODO: look at removing this after circulars are completely resolved.
export interface ImageSourceLike {
	toBase64String(format: string, quality?: number): string;
	// ... add other shared methods/properties as needed
}

// Circular dependency resolution handling (http <--> image-source)
let _getImage: (arg: any) => Promise<ImageSourceLike>;
export function getImageRequest(arg: any): Promise<ImageSourceLike> {
	if (_getImage) {
		return _getImage(arg);
	}
	return Promise.reject(new Error('No getImage request handler set.'));
}
export function setGetImageRequest(fn: (arg: any) => Promise<ImageSourceLike>) {
	_getImage = fn;
}
