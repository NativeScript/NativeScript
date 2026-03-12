// Example: (add more as needed)
// Note: Circular dep help between http and image-source.
// Interfaces can be moved around further in future to help avoid.
export interface ImageSourceLike {
	toBase64String(format: string, quality?: number): string;
	// ... add other shared methods/properties as needed
}
