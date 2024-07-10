type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Float32Array | Float64Array;
type HashTypes = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type Hash = HashTypes | { name: HashTypes };
export interface HmacKeyGenParams {
	name: 'HMAC';
	hash: Hash;
	length?: number;
}

export type KeyUsages = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';

const parent_ = Symbol('[[parent]]');
const native_ = Symbol('[[native]]');
const algorithm_ = Symbol('[[algorithm]]');
const usages_ = Symbol('[[usages]]');
const extractable_ = Symbol('[[extractable]]');
const type_ = Symbol('[[type]]');
const privateKey_ = Symbol('[[privateKey]]');
const publicKey_ = Symbol('[[publicKey]]');

declare const NSCCrypto;

function parseHash(hash: Hash): number | null {
	switch (hash) {
		case 'SHA-1':
			return 0;
		case 'SHA-256':
			return 1;
		case 'SHA-384':
			return 2;
		case 'SHA-512':
			return 3;
		default:
			return null;
	}
}

function parseUsages(usages: KeyUsages[]) {
	const ret = NSMutableArray.new();
	if (Array.isArray(usages)) {
		/*

    kNSCCryptoDecrypt,
    kNSCCryptoEncrypt,
    kNSCCryptoSign,
    kNSCCryptoVerify,
    kNSCCryptoDeriveKey,
    kNSCCryptoDeriveBits,
    kNSCCryptoWrapKey,
    kNSCCryptoUnwrapKey,
*/

		for (const usage of usages) {
			switch (usage) {
				case 'encrypt':
					ret.addObject(1);
					break;
				case 'decrypt':
					ret.addObject(0);
					break;
				case 'sign':
					ret.addObject(2);
					break;
				case 'verify':
					ret.addObject(3);
					break;
				case 'deriveKey':
					ret.addObject(4);
					break;
				case 'deriveBits':
					ret.addObject(5);
					break;
				case 'wrapKey':
					ret.addObject(6);
					break;
				case 'unwrapKey':
					ret.addObject(7);
					break;
			}
		}
	}
	return ret;
}

export class CryptoKey {
	[parent_];
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

	static fromNative(key) {
		if (key) {
			const ret = new CryptoKey();
			ret[native_] = key;
			return ret;
		}
		return null;
	}
}

export class CryptoKeyPair {
	[native_];
	[privateKey_] = null;
	[publicKey_] = null;

	get privateKey() {
		if (__IOS__) {
			const kp = this[native_];
			if (!this[privateKey_]) {
				this[privateKey_] = CryptoKey.fromNative(kp.privateKey);
			}
		}

		if (__ANDROID__) {
			const kp = this[native_];
			if (!this[privateKey_]) {
				this[privateKey_] = CryptoKey.fromNative(kp.getPrivate());
			}
		}

		return this[privateKey_];
	}

	get publicKey() {
		if (__IOS__) {
			const kp = this[native_];
			if (!this[publicKey_]) {
				this[publicKey_] = CryptoKey.fromNative(kp.publicKey);
			}
		}

		if (__ANDROID__) {
			const kp = this[native_];
			if (!this[publicKey_]) {
				this[publicKey_] = CryptoKey.fromNative(kp.getPublic());
			}
		}

		return this[publicKey_];
	}

	static fromNative(keyPair) {
		if (keyPair) {
			const ret = new CryptoKeyPair();
			ret[native_] = keyPair;
			return ret;
		}
		return null;
	}
}

interface RsaOaepParams {
	name: 'RSA-OAEP';
	label?: TypedArray | ArrayBuffer;
}

interface RsaHashedKeyGenParams {
	name: 'RSA-OAEP';
	modulusLength: number;
	publicExponent: Uint8Array;
	hash: Hash;
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

				const buffer = (<any>org).nativescript.winter_cg.Crypto.digest(mode, data);
				const ab = (<any>ArrayBuffer).from(buffer);

				if (!ab) {
					// todo throw failure
				}

				resolve(ab);

				/* instance.update(data as any);
                const digest = instance.digest();
    
                const ab = new ArrayBuffer(digest.length);
                (<any>org).nativescript.winter_cg.Utils.copyToBuffer(ab, digest);
    
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

	encrypt(algorithm: RsaOaepParams, key: CryptoKey, data: TypedArray | ArrayBuffer) {
		return new Promise((resolve, reject) => {
			let error: Error;
			switch (algorithm?.name) {
				case 'RSA-OAEP':
					{
						try {
							if (__IOS__) {
								const hash = parseHash(key.algorithm.hash.name);
								const ret = NSCCrypto.encryptRsaKeyHashDataSize(key.type === 'private', key[parent_], hash, data, data.byteLength);
								if (ret) {
									resolve(interop.bufferFromData(ret));
								} else {
									reject(new Error('Failed to encrypt data'));
								}
							}

							if (__ANDROID__) {
								const hash = parseHash(key.algorithm.hash.name);
								const ret = (<any>org).nativescript.winter_cg.Crypto.encryptRsaOAEP(key[parent_], hash, data);
								if (ret) {
									resolve((<any>ArrayBuffer).from(ret));
								} else {
									reject(new Error('Failed to encrypt data'));
								}
							}
						} catch (error) {
							reject(error);
						}
					}
					break;
				default:
					error = new Error('Operation is not supported');
					break;
			}

			if (error) {
				reject(error);
				return;
			}
		});
	}

	decrypt(algorithm: RsaOaepParams, key: CryptoKey, data: TypedArray | ArrayBuffer) {
		return new Promise((resolve, reject) => {
			let error: Error;
			switch (algorithm?.name) {
				case 'RSA-OAEP':
					{
						try {
							if (__IOS__) {
								const hash = parseHash(key.algorithm.hash.name);

								const ret = NSCCrypto.decryptRsaKeyHashDataSize(key.type === 'private', key[parent_], hash, data, data.byteLength);
								if (ret) {
									resolve(interop.bufferFromData(ret));
								} else {
									reject(new Error('Failed to decrypt data'));
								}
							}

							if (__ANDROID__) {
								const hash = parseHash(key.algorithm.hash.name);
								const ret = (<any>org).nativescript.winter_cg.Crypto.decryptRsaOAEP(key[parent_], hash, data);
								if (ret) {
									resolve((<any>ArrayBuffer).from(ret));
								} else {
									reject(new Error('Failed to decrypt data'));
								}
							}
						} catch (error) {
							reject(error);
						}
					}
					break;
				default:
					error = new Error('Operation is not supported');
					break;
			}

			if (error) {
				reject(error);
				return;
			}
		});
	}

	sign(algorithm: { name: 'HMAC' } | 'HMAC', key: CryptoKey, data: TypedArray | ArrayBuffer) {
		return new Promise((resolve, reject) => {
			let error: Error;
			const algorithmName = typeof algorithm === 'object' ? algorithm?.name : algorithm;
			switch (algorithmName) {
				case 'HMAC':
					{
						try {
							if (__IOS__) {
								const hash = parseHash(key.algorithm.hash.name);
								const d = NSData.dataWithData(data as never);
								const ret = NSCCrypto.signHmacHashData(key[native_], hash, d);
								if (ret) {
									resolve(interop.bufferFromData(ret));
								} else {
									reject(new Error('Failed to sign data'));
								}
							}

							if (__ANDROID__) {
								let algo;
								switch (key.algorithm.hash.name) {
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

								const ab = (<any>org).nativescript.winter_cg.Crypto.signHMAC(algo, key[native_], data);
								resolve((<any>ArrayBuffer).from(ab));
							}
						} catch (error) {
							reject(error);
						}
					}
					break;
				default:
					error = new Error('Operation is not supported');
					break;
			}

			if (error) {
				reject(error);
				return;
			}
		});
	}

	verify(algorithm: { name: 'HMAC' } | 'HMAC', key: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer) {
		return new Promise((resolve, reject) => {
			let error: Error;
			const algorithmName = typeof algorithm === 'object' ? algorithm?.name : algorithm;
			switch (algorithmName) {
				case 'HMAC':
					{
						try {
							if (__IOS__) {
								const hash = parseHash(key.algorithm.hash.name);
								const s = NSData.dataWithData(signature as never);
								const d = NSData.dataWithData(data as never);

								const ret = NSCCrypto.verifyHmacHashSignatureData(key[native_], hash, s, d);
								resolve(ret);
							}

							if (__ANDROID__) {
								let algo;
								switch (key.algorithm.hash.name) {
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

								const ret = (<any>org).nativescript.winter_cg.Crypto.verifyHMAC(algo, key[native_], signature, data);
								resolve(ret);
							}
						} catch (error) {
							reject(error);
						}
					}
					break;
				default:
					error = new Error('Operation is not supported');
					break;
			}

			if (error) {
				reject(error);
				return;
			}
		});
	}

	generateKey(algorithm: HmacKeyGenParams | RsaHashedKeyGenParams, extractable: boolean, keyUsages: KeyUsages[]) {
		return new Promise((resolve, reject) => {
			const algorithmHash = typeof algorithm?.hash === 'object' ? algorithm?.hash?.name : algorithm.hash;
			switch (algorithm?.name) {
				case 'HMAC':
					{
						let algo;
						let error: Error;
						switch (algorithmHash) {
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

						if (__ANDROID__) {
							// const mac = javax.crypto.KeyGenerator.getInstance(algo);
							// const key = mac.generateKey();
							const key = (<any>org).nativescript.winter_cg.Crypto.generateKeyHMAC(algo);
							const ret = new CryptoKey();
							ret[algorithm_] = { name: algorithm.name, hash: { name: algorithmHash } };
							ret[native_] = key;
							ret[usages_] = keyUsages;
							ret[extractable_] = extractable;
							ret[type_] = 'secret';
							resolve(ret);
						}

						if (__IOS__) {
							const hash = parseHash(algorithmHash);
							const key = NSCCrypto.generateKeyHmacLength(hash, algorithm?.length ?? -1);
							const ret = new CryptoKey();
							ret[algorithm_] = { name: algorithm.name, hash: { name: algorithmHash } };
							ret[native_] = key;
							ret[usages_] = keyUsages;
							ret[extractable_] = extractable;
							ret[type_] = 'secret';
							resolve(ret);
						}
					}
					break;
				case 'RSA-OAEP':
					{
						if (__IOS__) {
							const hash = parseHash(algorithm.hash);
							if (hash === null) {
								// todo throw invalid hash
							}
							const usages = parseUsages(keyUsages);

							// ignore publicExponent for now
							const kp = NSCCrypto.generateKeyRsaModulusLengthPublicExponentSizeHashExtractableKeyUsages(2, algorithm.modulusLength, null, 0, hash, !!extractable, usages);

							if (!kp) {
								reject(new Error('Failed to generateKey'));
							} else {
								const ret = CryptoKeyPair.fromNative(kp);
								ret.privateKey[parent_] = kp;
								ret.privateKey[algorithm_] = { name: algorithm.name, hash: { name: algorithm.hash }, modulusLength: algorithm.modulusLength, publicExponent: new Uint8Array([1, 0, 1]) };
								ret.privateKey[type_] = 'private';
								ret.privateKey[extractable_] = extractable;

								ret.publicKey[parent_] = kp;
								ret.publicKey[algorithm_] = { name: algorithm.name, hash: { name: algorithm.hash }, modulusLength: algorithm.modulusLength, publicExponent: new Uint8Array([1, 0, 1]) };
								ret.publicKey[type_] = 'public';
								ret.publicKey[extractable_] = extractable;

								resolve(ret);
							}
						}

						if (__ANDROID__) {
							const hash = parseHash(algorithm.hash);
							if (hash === null) {
								// todo throw invalid hash
							}
							//	const usages = parseUsages(keyUsages);

							// ignore publicExponent for now
							const kp = (<any>org).nativescript.winter_cg.Crypto.generateKeyRsaOAEP(algorithm.modulusLength);

							if (!kp) {
								reject(new Error('Failed to generateKey'));
							} else {
								const ret = CryptoKeyPair.fromNative(kp);
								ret.privateKey[parent_] = kp;
								ret.privateKey[algorithm_] = { name: algorithm.name, hash: { name: algorithm.hash }, modulusLength: algorithm.modulusLength, publicExponent: new Uint8Array([1, 0, 1]) };
								ret.privateKey[type_] = 'private';
								ret.privateKey[extractable_] = extractable;

								ret.publicKey[parent_] = kp;
								ret.publicKey[algorithm_] = { name: algorithm.name, hash: { name: algorithm.hash }, modulusLength: algorithm.modulusLength, publicExponent: new Uint8Array([1, 0, 1]) };
								ret.publicKey[type_] = 'public';
								ret.publicKey[extractable_] = extractable;

								resolve(ret);
							}
						}
					}
					break;
				default:
					reject(
						new Error(
							`'subtle.generateKey()' is not implemented for ${algorithm?.name}.
						  Unrecognized algorithm name`,
						),
					);
					break;
			}
		});
	}
}
