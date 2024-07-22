//
//  NSCCrypto.h
//  NSCWinterCG
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
@property (nonatomic, readonly, nonnull) SecKeyRef privateKey;
@property (nonatomic, readonly, nonnull) SecKeyRef publicKey;
-(nonnull id)initWithPrivateKey:(nonnull SecKeyRef)privKey andPublicKey:(nonnull SecKeyRef)pubKey;
@end

typedef void (^DigestCompletionHandler)(NSData * _Nullable result,NSError * _Nullable error);
typedef void (^GenerateKeyCompletionHandler)(NSCCryptoKeyPair * _Nullable result,NSError * _Nullable error);
typedef void (^DecryptCompletionHandler)(NSData * _Nullable result,NSError * _Nullable error);
typedef void (^EncryptCompletionHandler)(NSData * _Nullable result,NSError * _Nullable error);


@interface NSCCrypto:NSObject
+ (nonnull NSString*)randomUUID;
+ (nullable NSString*)getRandomValues:(nonnull NSMutableData*)buffer;
+ (nullable NSData*)digest:(nonnull NSData*)data mode:(int)mode;
+ (void)digest:(nonnull NSData*)data mode:(int)mode completion:(DigestCompletionHandler _Nonnull ) completion;
+ (nullable NSData *)generateKeyHmac:(int)hash length:(int)length;
+ (nullable NSData *)signHmac:(nonnull NSData*)key hash:(NSCCryptoHash)hash data:(nonnull NSData*)data;
+ (BOOL)verifyHmac:(nonnull NSData*)key hash:(NSCCryptoHash)hash signature:(nonnull NSData*)signature data:(nonnull NSData*)data;

+ (nullable NSCCryptoKeyPair*)generateKeyRsa:(NSCCryptoRsaHashedKeyGenParamsName)name modulusLength:(unsigned int)modulusLength publicExponent:(nullable void*)exponent size:(unsigned int)size hash:(NSCCryptoHash)hash extractable:(BOOL)extractable keyUsages:(nonnull NSArray*) usages;

+ (void)generateKeyRsa:(NSCCryptoRsaHashedKeyGenParamsName)name modulusLength:(unsigned int)modulusLength publicExponent:(nullable void*)exponent size:(unsigned int)size hash:(NSCCryptoHash)hash extractable:(BOOL)extractable keyUsages:(nonnull NSArray*) usages completion:(GenerateKeyCompletionHandler _Nonnull ) completion;



+ (nullable NSData *)encryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull NSData*)data;

+ (void)encryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull NSData*)data completion:(EncryptCompletionHandler _Nonnull ) completion;

+ (nullable NSData *)decryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull NSData*)data;

+ (void)decryptRsa:(BOOL)isPrivate key:(nonnull NSCCryptoKeyPair *)key hash:(NSCCryptoHash)hash data:(nonnull NSData*)data completion:(DecryptCompletionHandler _Nonnull ) completion;
@end
#endif /* NSCCrypto_h */
