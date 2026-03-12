//
//  NSCCrypto.h
//  TNSWidgets
//
//  Created by Osei Fortune on 03/07/2024.
//  Copyright © 2024 NativeScript. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCrypto.h>
#import <Security/Security.h>
#import <Security/SecItem.h>
#ifndef NSCCrypto_h
#define NSCCrypto_h

typedef enum : NSUInteger {
    kNSCCryptoRSASSA_PKCS1_v1_5,
    kNSCCryptoRSA_PSS,
    kNSCCryptoRSA_OAEP,
} NSCCryptoRsaHashedKeyGenParamsName;


typedef enum : NSUInteger {
    kNSCCryptoHashSHA1,
    kNSCCryptoHashSHA256,
    kNSCCryptoHashSHA384,
    kNSCCryptoHashSHA512
} NSCCryptoHash;


typedef enum : NSUInteger {
    kNSCCryptoDecrypt,
    kNSCCryptoEncrypt,
    kNSCCryptoSign,
    kNSCCryptoVerify,
    kNSCCryptoDeriveKey,
    kNSCCryptoDeriveBits,
    kNSCCryptoWrapKey,
    kNSCCryptoUnwrapKey,
} NSCCryptoKeyUsages;



@interface NSCCryptoKeyPair : NSObject
@property (nonatomic, nonnull) SecKeyRef privateKey;
@property (nonatomic, nonnull) SecKeyRef publicKey;
-(nonnull id)initWithPrivateKey:(nonnull SecKeyRef)privKey andPublicKey:(nonnull SecKeyRef)pubKey;
@end

@interface NSCCrypto:NSObject
+ (nonnull NSString*)randomUUID;
+ (nullable NSString*)getRandomValues:(nonnull void*)buffer length:(unsigned int)length;
+ (nullable NSData*)digest:(nonnull void*)data length:(unsigned int)length mode:(int)mode;
+ (nullable NSData *)generateKeyHmac:(int)hash length:(int)length;
+ (nullable NSCCryptoKeyPair*)generateKeyRsa:(NSCCryptoRsaHashedKeyGenParamsName)name modulusLength:(unsigned int)modulusLength publicExponent:(nullable void*)exponent size:(unsigned int)size hash:(NSCCryptoHash)hash extractable:(BOOL)extractable keyUsages:(nonnull NSArray*) usages;
+ (nullable NSData *)encryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull void*)data size:(unsigned int) size;

+ (nullable NSData *)decryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull void*)data size:(unsigned int) size;
@end
#endif /* NSCCrypto_h */
