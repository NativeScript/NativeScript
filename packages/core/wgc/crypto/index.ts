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

	getRandomValues(typedArray: Exclude<TypedArray, Float32Array | Float64Array>) {
		if (__ANDROID__) {
			if (typedArray.BYTES_PER_ELEMENT !== 1) {
				typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset);
			}
			(<any>org).nativescript.winter_tc.Crypto.getRandomValues(typedArray);
		}
		if (__IOS__) {
			if (typedArray.BYTES_PER_ELEMENT !== 1) {
				typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
			}
			const data = NSMutableData.dataWithBytesNoCopyLength(typedArray as never, typedArray.byteLength);

			NSCCrypto.getRandomValues(data);
		}
		return typedArray;
	}
}
