type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Float32Array | Float64Array;

export interface HmacKeyGenParams {
	name: 'HMAC';
	hash: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
	length?: number;
}

export type KeyUsages = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';

const native_ = Symbol('[[native]]');
const algorithm_ = Symbol('[[algorithm]]');
const usages_ = Symbol('[[usages]]');
const extractable_ = Symbol('[[extractable]]');
const type_ = Symbol('[[type]]');

declare const NSCCrypto;

export class CryptoKey {
	[native_];
	[algorithm_];
	[usages_];
	[extractable_];
	[type_];

	get algorithm() {
		return this[algorithm_];
	}

	get usages() {
		return this[usages_];
	}

	get extractable() {
		return this[extractable_];
	}

	get type() {
		return this[type_];
	}
}

export class SubtleCrypto {
	digest(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', data: TypedArray | ArrayBuffer) {
		return new Promise((resolve, reject) => {
			let error: Error;
			let mode: number;
			switch (algorithm) {
				case 'SHA-1':
					mode = 0;
					break;
				case 'SHA-256':
					mode = 1;
					break;
				case 'SHA-384':
					mode = 2;
					break;
				case 'SHA-512':
					mode = 3;
					break;
				default:
					error = new Error('Operation is not supported');
					break;
			}
			if (error !== undefined) {
				reject(error);
				return;
			}

			if (data instanceof ArrayBuffer || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
				// noop
			} else if (data?.BYTES_PER_ELEMENT !== 1) {
				data = new Uint8Array(data.buffer, data.byteOffset);
			} else {
				reject(new TypeError('Argument 2 could not be converted to any of: ArrayBufferView, ArrayBuffer.'));
				return;
			}

			if (__ANDROID__) {
				//const instance = java.security.MessageDigest.getInstance(algorithm);

				const buffer = (<any>org).nativescript.widgets.Crypto.digest(mode, data);
				const ab = (<any>ArrayBuffer).from(buffer);

				if (!ab) {
					// todo throw failure
				}

				resolve(ab);

				/* instance.update(data as any);
                const digest = instance.digest();
    
                const ab = new ArrayBuffer(digest.length);
                (<any>org).nativescript.widgets.Utils.copyToBuffer(ab, digest);
    
                resolve(ab);

                */
			}

			if (__IOS__) {
				const ab = NSCCrypto.digestLengthMode(data, data.byteLength, mode);
				if (!ab) {
					// todo throw failure
				}
				resolve(interop.bufferFromData(ab));
			}
		});
	}

	generateKey(algorithm: HmacKeyGenParams, extractable: boolean, keyUsages: KeyUsages[]) {
		return new Promise((resolve, reject) => {
			switch (algorithm?.name) {
				case 'HMAC':
					{
						let algo;
						let error: Error;
						switch (algorithm.hash) {
							case 'SHA-1':
								algo = 'HmacSHA1';
								break;
							case 'SHA-256':
								algo = 'HmacSHA256';
								break;
							case 'SHA-384':
								algo = 'HmacSHA384';
								break;
							case 'SHA-512':
								algo = 'HmacSHA512';
								break;
							default:
								error = new Error('Operation is not supported');
								break;
						}

						if (error) {
							reject(error);
							return;
						}

						const mac = javax.crypto.KeyGenerator.getInstance(algo);
						const key = mac.generateKey();
						const ret = new CryptoKey();
						ret[algorithm_] = { name: algorithm.name, hash: { name: algorithm.hash } };
						ret[native_] = key;
						ret[usages_] = keyUsages;
						ret[extractable_] = extractable;
						ret[type_] = 'secret';
						resolve(ret);
					}
					break;
				default:
					reject(
						new Error(
							`'subtle.generateKey()' is not implemented for ${algorithm.name}.
						  Unrecognized algorithm name`,
						),
					);
					break;
			}
		});
	}
}
