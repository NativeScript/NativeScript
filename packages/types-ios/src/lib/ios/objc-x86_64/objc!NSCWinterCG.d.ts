
declare class NSCCrypto extends NSObject {

	static alloc(): NSCCrypto; // inherited from NSObject

	static decryptRsaKeyHashData(isPrivate: boolean, key: NSCCryptoKeyPair, hash: NSCCryptoHash, data: NSData): NSData;

	static decryptRsaKeyHashDataCompletion(isPrivate: boolean, key: NSCCryptoKeyPair, hash: NSCCryptoHash, data: NSData, completion: (p1: NSData, p2: NSError) => void): void;

	static digestMode(data: NSData, mode: number): NSData;

	static digestModeCompletion(data: NSData, mode: number, completion: (p1: NSData, p2: NSError) => void): void;

	static encryptRsaKeyHashData(isPrivate: boolean, key: NSCCryptoKeyPair, hash: NSCCryptoHash, data: NSData): NSData;

	static encryptRsaKeyHashDataCompletion(isPrivate: boolean, key: NSCCryptoKeyPair, hash: NSCCryptoHash, data: NSData, completion: (p1: NSData, p2: NSError) => void): void;

	static generateKeyHmacLength(hash: number, length: number): NSData;

	static generateKeyRsaModulusLengthPublicExponentSizeHashExtractableKeyUsages(name: NSCCryptoRsaHashedKeyGenParamsName, modulusLength: number, exponent: interop.Pointer | interop.Reference<any>, size: number, hash: NSCCryptoHash, extractable: boolean, usages: NSArray<any> | any[]): NSCCryptoKeyPair;

	static generateKeyRsaModulusLengthPublicExponentSizeHashExtractableKeyUsagesCompletion(name: NSCCryptoRsaHashedKeyGenParamsName, modulusLength: number, exponent: interop.Pointer | interop.Reference<any>, size: number, hash: NSCCryptoHash, extractable: boolean, usages: NSArray<any> | any[], completion: (p1: NSCCryptoKeyPair, p2: NSError) => void): void;

	static getRandomValues(buffer: NSMutableData): string;

	static new(): NSCCrypto; // inherited from NSObject

	static randomUUID(): string;

	static signHmacHashData(key: NSData, hash: NSCCryptoHash, data: NSData): NSData;

	static verifyHmacHashSignatureData(key: NSData, hash: NSCCryptoHash, signature: NSData, data: NSData): boolean;
}

declare const enum NSCCryptoHash {

	kNSCCryptoHashSHA1 = 0,

	kNSCCryptoHashSHA256 = 1,

	kNSCCryptoHashSHA384 = 2,

	kNSCCryptoHashSHA512 = 3
}

declare class NSCCryptoKeyPair extends NSObject {

	static alloc(): NSCCryptoKeyPair; // inherited from NSObject

	static new(): NSCCryptoKeyPair; // inherited from NSObject

	readonly privateKey: any;

	readonly publicKey: any;

	constructor(o: { privateKey: any; andPublicKey: any; });

	initWithPrivateKeyAndPublicKey(privKey: any, pubKey: any): this;
}

declare const enum NSCCryptoKeyUsages {

	kNSCCryptoDecrypt = 0,

	kNSCCryptoEncrypt = 1,

	kNSCCryptoSign = 2,

	kNSCCryptoVerify = 3,

	kNSCCryptoDeriveKey = 4,

	kNSCCryptoDeriveBits = 5,

	kNSCCryptoWrapKey = 6,

	kNSCCryptoUnwrapKey = 7
}

declare const enum NSCCryptoRsaHashedKeyGenParamsName {

	kNSCCryptoRSASSA_PKCS1_v1_5 = 0,

	kNSCCryptoRSA_PSS = 1,

	kNSCCryptoRSA_OAEP = 2
}

declare var NSCWinterCGVersionNumber: number;

declare var NSCWinterCGVersionString: interop.Reference<number>;
