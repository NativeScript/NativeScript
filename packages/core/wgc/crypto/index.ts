import { SubtleCrypto } from './SubtleCrypto';

declare const NSCCrypto;
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Float32Array | Float64Array;
const subtle = new SubtleCrypto();
export class Crypto {
	get subtle() {
		return subtle;
	}
	randomUUID() {
		if (__ANDROID__) {
			return (<any>org).nativescript.winter_tc.Crypto.randomUUID();
		}
		if (__IOS__) {
			return NSCCrypto.randomUUID();
		}
	}

	getRandomValues<T extends Exclude<TypedArray, Float32Array | Float64Array>>(typedArray: T): T {
		// Both natives fill bytes, so a wider element type is reinterpreted over the very same
		// window — never past it, and never in place of the caller's own view, which is what
		// getRandomValues has to hand back.
		const bytes = typedArray.BYTES_PER_ELEMENT === 1 ? typedArray : new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);

		if (__ANDROID__) {
			(<any>org).nativescript.winter_tc.Crypto.getRandomValues(bytes);
		}
		if (__IOS__) {
			// The view goes to Security directly: the runtime hands over V8's backing store at
			// the view's byte offset, so the bytes land in the caller's array. No NSData may
			// sit in between — NSMutableData copies bytes it does not own, so a no-copy wrapper
			// fills a private copy, and one that owns them frees V8's allocation.
			const status = SecRandomCopyBytes(kSecRandomDefault, bytes.byteLength, bytes);
			if (status !== errSecSuccess) {
				throw new Error(`getRandomValues: SecRandomCopyBytes failed (${status})`);
			}
		}

		return typedArray;
	}
}
