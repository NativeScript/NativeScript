// Shared types and interfaces for http and image-source modules.
// Only put platform-agnostic types/interfaces here.

// Example: (add more as needed)
// TODO: look at removing this after circulars are completely resolved.
export interface ImageSourceLike {
	toBase64String(format: string, quality?: number): string;
	// ... add other shared methods/properties as needed
}
