
declare function CCCalibratePBKDF(algorithm: number, passwordLen: number, saltLen: number, prf: number, derivedKeyLen: number, msec: number): number;

declare function CCCrypt(op: number, alg: number, options: number, key: interop.Pointer | interop.Reference<any>, keyLength: number, iv: interop.Pointer | interop.Reference<any>, dataIn: interop.Pointer | interop.Reference<any>, dataInLength: number, dataOut: interop.Pointer | interop.Reference<any>, dataOutAvailable: number, dataOutMoved: interop.Pointer | interop.Reference<number>): number;

declare function CCCryptorCreate(op: number, alg: number, options: number, key: interop.Pointer | interop.Reference<any>, keyLength: number, iv: interop.Pointer | interop.Reference<any>, cryptorRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CCCryptorCreateFromData(op: number, alg: number, options: number, key: interop.Pointer | interop.Reference<any>, keyLength: number, iv: interop.Pointer | interop.Reference<any>, data: interop.Pointer | interop.Reference<any>, dataLength: number, cryptorRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, dataUsed: interop.Pointer | interop.Reference<number>): number;

declare function CCCryptorCreateWithMode(op: number, mode: number, alg: number, padding: number, iv: interop.Pointer | interop.Reference<any>, key: interop.Pointer | interop.Reference<any>, keyLength: number, tweak: interop.Pointer | interop.Reference<any>, tweakLength: number, numRounds: number, options: number, cryptorRef: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

declare function CCCryptorFinal(cryptorRef: interop.Pointer | interop.Reference<any>, dataOut: interop.Pointer | interop.Reference<any>, dataOutAvailable: number, dataOutMoved: interop.Pointer | interop.Reference<number>): number;

declare function CCCryptorGetOutputLength(cryptorRef: interop.Pointer | interop.Reference<any>, inputLength: number, final: boolean): number;

declare function CCCryptorRelease(cryptorRef: interop.Pointer | interop.Reference<any>): number;

declare function CCCryptorReset(cryptorRef: interop.Pointer | interop.Reference<any>, iv: interop.Pointer | interop.Reference<any>): number;

declare function CCCryptorUpdate(cryptorRef: interop.Pointer | interop.Reference<any>, dataIn: interop.Pointer | interop.Reference<any>, dataInLength: number, dataOut: interop.Pointer | interop.Reference<any>, dataOutAvailable: number, dataOutMoved: interop.Pointer | interop.Reference<number>): number;

declare function CCHmac(algorithm: number, key: interop.Pointer | interop.Reference<any>, keyLength: number, data: interop.Pointer | interop.Reference<any>, dataLength: number, macOut: interop.Pointer | interop.Reference<any>): void;

interface CCHmacContext {
	ctx: interop.Reference<number>;
}
declare var CCHmacContext: interop.StructType<CCHmacContext>;

declare function CCHmacFinal(ctx: interop.Pointer | interop.Reference<CCHmacContext>, macOut: interop.Pointer | interop.Reference<any>): void;

declare function CCHmacInit(ctx: interop.Pointer | interop.Reference<CCHmacContext>, algorithm: number, key: interop.Pointer | interop.Reference<any>, keyLength: number): void;

declare function CCHmacUpdate(ctx: interop.Pointer | interop.Reference<CCHmacContext>, data: interop.Pointer | interop.Reference<any>, dataLength: number): void;

declare function CCKeyDerivationPBKDF(algorithm: number, password: string | interop.Pointer | interop.Reference<any>, passwordLen: number, salt: string | interop.Pointer | interop.Reference<any>, saltLen: number, prf: number, rounds: number, derivedKey: string | interop.Pointer | interop.Reference<any>, derivedKeyLen: number): number;

declare function CCRandomGenerateBytes(bytes: interop.Pointer | interop.Reference<any>, count: number): number;

declare function CCSymmetricKeyUnwrap(algorithm: number, iv: string | interop.Pointer | interop.Reference<any>, ivLen: number, kek: string | interop.Pointer | interop.Reference<any>, kekLen: number, wrappedKey: string | interop.Pointer | interop.Reference<any>, wrappedKeyLen: number, rawKey: string | interop.Pointer | interop.Reference<any>, rawKeyLen: interop.Pointer | interop.Reference<number>): number;

declare function CCSymmetricKeyWrap(algorithm: number, iv: string | interop.Pointer | interop.Reference<any>, ivLen: number, kek: string | interop.Pointer | interop.Reference<any>, kekLen: number, rawKey: string | interop.Pointer | interop.Reference<any>, rawKeyLen: number, wrappedKey: string | interop.Pointer | interop.Reference<any>, wrappedKeyLen: interop.Pointer | interop.Reference<number>): number;

declare function CCSymmetricUnwrappedSize(algorithm: number, wrappedKeyLen: number): number;

declare function CCSymmetricWrappedSize(algorithm: number, rawKeyLen: number): number;

declare function CC_MD2(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_MD2_CTX {
	num: number;
	data: interop.Reference<number>;
	cksm: interop.Reference<number>;
	state: interop.Reference<number>;
}
declare var CC_MD2_CTX: interop.StructType<CC_MD2_CTX>;

declare function CC_MD2_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_MD2_CTX>): number;

declare function CC_MD2_Init(c: interop.Pointer | interop.Reference<CC_MD2_CTX>): number;

declare function CC_MD2_Update(c: interop.Pointer | interop.Reference<CC_MD2_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_MD4(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_MD4_CTX {
	A: number;
	B: number;
	C: number;
	D: number;
	Nl: number;
	Nh: number;
	data: interop.Reference<number>;
	num: number;
}
declare var CC_MD4_CTX: interop.StructType<CC_MD4_CTX>;

declare function CC_MD4_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_MD4_CTX>): number;

declare function CC_MD4_Init(c: interop.Pointer | interop.Reference<CC_MD4_CTX>): number;

declare function CC_MD4_Update(c: interop.Pointer | interop.Reference<CC_MD4_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_MD5(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_MD5_CTX {
	A: number;
	B: number;
	C: number;
	D: number;
	Nl: number;
	Nh: number;
	data: interop.Reference<number>;
	num: number;
}
declare var CC_MD5_CTX: interop.StructType<CC_MD5_CTX>;

declare function CC_MD5_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_MD5_CTX>): number;

declare function CC_MD5_Init(c: interop.Pointer | interop.Reference<CC_MD5_CTX>): number;

declare function CC_MD5_Update(c: interop.Pointer | interop.Reference<CC_MD5_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_SHA1(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_SHA1_CTX {
	h0: number;
	h1: number;
	h2: number;
	h3: number;
	h4: number;
	Nl: number;
	Nh: number;
	data: interop.Reference<number>;
	num: number;
}
declare var CC_SHA1_CTX: interop.StructType<CC_SHA1_CTX>;

declare function CC_SHA1_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_SHA1_CTX>): number;

declare function CC_SHA1_Init(c: interop.Pointer | interop.Reference<CC_SHA1_CTX>): number;

declare function CC_SHA1_Update(c: interop.Pointer | interop.Reference<CC_SHA1_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_SHA224(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

declare function CC_SHA224_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_SHA256_CTX>): number;

declare function CC_SHA224_Init(c: interop.Pointer | interop.Reference<CC_SHA256_CTX>): number;

declare function CC_SHA224_Update(c: interop.Pointer | interop.Reference<CC_SHA256_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_SHA256(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_SHA256_CTX {
	count: interop.Reference<number>;
	hash: interop.Reference<number>;
	wbuf: interop.Reference<number>;
}
declare var CC_SHA256_CTX: interop.StructType<CC_SHA256_CTX>;

declare function CC_SHA256_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_SHA256_CTX>): number;

declare function CC_SHA256_Init(c: interop.Pointer | interop.Reference<CC_SHA256_CTX>): number;

declare function CC_SHA256_Update(c: interop.Pointer | interop.Reference<CC_SHA256_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_SHA384(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

declare function CC_SHA384_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_SHA512_CTX>): number;

declare function CC_SHA384_Init(c: interop.Pointer | interop.Reference<CC_SHA512_CTX>): number;

declare function CC_SHA384_Update(c: interop.Pointer | interop.Reference<CC_SHA512_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare function CC_SHA512(data: interop.Pointer | interop.Reference<any>, len: number, md: string | interop.Pointer | interop.Reference<any>): string;

interface CC_SHA512_CTX {
	count: interop.Reference<number>;
	hash: interop.Reference<number>;
	wbuf: interop.Reference<number>;
}
declare var CC_SHA512_CTX: interop.StructType<CC_SHA512_CTX>;

declare function CC_SHA512_Final(md: string | interop.Pointer | interop.Reference<any>, c: interop.Pointer | interop.Reference<CC_SHA512_CTX>): number;

declare function CC_SHA512_Init(c: interop.Pointer | interop.Reference<CC_SHA512_CTX>): number;

declare function CC_SHA512_Update(c: interop.Pointer | interop.Reference<CC_SHA512_CTX>, data: interop.Pointer | interop.Reference<any>, len: number): number;

declare var CCrfc3394_iv: string;

declare var CCrfc3394_ivLen: number;

declare const ccNoPadding: number;

declare const ccPKCS7Padding: number;

declare const kCCAlgorithm3DES: number;

declare const kCCAlgorithmAES: number;

declare const kCCAlgorithmAES128: number;

declare const kCCAlgorithmBlowfish: number;

declare const kCCAlgorithmCAST: number;

declare const kCCAlgorithmDES: number;

declare const kCCAlgorithmRC2: number;

declare const kCCAlgorithmRC4: number;

declare const kCCAlignmentError: number;

declare const kCCBlockSize3DES: number;

declare const kCCBlockSizeAES128: number;

declare const kCCBlockSizeBlowfish: number;

declare const kCCBlockSizeCAST: number;

declare const kCCBlockSizeDES: number;

declare const kCCBlockSizeRC2: number;

declare const kCCBufferTooSmall: number;

declare const kCCCallSequenceError: number;

declare const kCCContextSize3DES: number;

declare const kCCContextSizeAES128: number;

declare const kCCContextSizeCAST: number;

declare const kCCContextSizeDES: number;

declare const kCCContextSizeRC4: number;

declare const kCCDecodeError: number;

declare const kCCDecrypt: number;

declare const kCCEncrypt: number;

declare const kCCHmacAlgMD5: number;

declare const kCCHmacAlgSHA1: number;

declare const kCCHmacAlgSHA224: number;

declare const kCCHmacAlgSHA256: number;

declare const kCCHmacAlgSHA384: number;

declare const kCCHmacAlgSHA512: number;

declare const kCCInvalidKey: number;

declare const kCCKeySize3DES: number;

declare const kCCKeySizeAES128: number;

declare const kCCKeySizeAES192: number;

declare const kCCKeySizeAES256: number;

declare const kCCKeySizeDES: number;

declare const kCCKeySizeError: number;

declare const kCCKeySizeMaxBlowfish: number;

declare const kCCKeySizeMaxCAST: number;

declare const kCCKeySizeMaxRC2: number;

declare const kCCKeySizeMaxRC4: number;

declare const kCCKeySizeMinBlowfish: number;

declare const kCCKeySizeMinCAST: number;

declare const kCCKeySizeMinRC2: number;

declare const kCCKeySizeMinRC4: number;

declare const kCCMemoryFailure: number;

declare const kCCModeCBC: number;

declare const kCCModeCFB: number;

declare const kCCModeCFB8: number;

declare const kCCModeCTR: number;

declare const kCCModeECB: number;

declare const kCCModeOFB: number;

declare const kCCModeOptionCTR_BE: number;

declare const kCCModeRC4: number;

declare const kCCOptionECBMode: number;

declare const kCCOptionPKCS7Padding: number;

declare const kCCOverflow: number;

declare const kCCPBKDF2: number;

declare const kCCPRFHmacAlgSHA1: number;

declare const kCCPRFHmacAlgSHA224: number;

declare const kCCPRFHmacAlgSHA256: number;

declare const kCCPRFHmacAlgSHA384: number;

declare const kCCPRFHmacAlgSHA512: number;

declare const kCCParamError: number;

declare const kCCRNGFailure: number;

declare const kCCSuccess: number;

declare const kCCUnimplemented: number;

declare const kCCUnspecifiedError: number;

declare const kCCWRAPAES: number;
