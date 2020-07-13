// This method iterates all the keys in the source exports object and copies them to the destination exports one.
// Note: the method will not check for naming collisions and will override any already existing entries in the destination exports.
export function merge(sourceExports: any, destExports: any) {
	for (let key in sourceExports) {
		destExports[key] = sourceExports[key];
	}
}
