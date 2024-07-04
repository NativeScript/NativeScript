//
//  NSCCrypto.m
//  TNSWidgets
//
//  Created by Osei Fortune on 03/07/2024.
//  Copyright © 2024 NativeScript. All rights reserved.
//

#import "NSCCrypto.h"

@implementation NSCCrypto

+ (NSString *)randomUUID {
    return [[[NSUUID UUID] UUIDString] lowercaseString];
}

+ (NSString *)getRandomValues:(nonnull void *)buffer length:(unsigned int)length {
    if(buffer != nil){
        int result = SecRandomCopyBytes(kSecRandomDefault, length, buffer);
        if(result != errSecSuccess){
            return @"Failed to generate random values";
        }else {
            return nil;
        }
    }
    
    return @"Failed to generate random values";
}

+ (nullable NSData *)digest:(nonnull void *)data length:(unsigned int)length mode:(int)mode {
    switch (mode) {
        case 0:
        {
            unsigned char hash[CC_SHA1_DIGEST_LENGTH];
            CC_SHA1(data, length, hash);
            return [NSData dataWithBytes:hash length:CC_SHA1_DIGEST_LENGTH];
        }
            break;
            
        case 1:
        {
            unsigned char hash[CC_SHA256_DIGEST_LENGTH];
            CC_SHA1(data, length, hash);
            return [NSData dataWithBytes:hash length:CC_SHA256_DIGEST_LENGTH];
        }
            
            
        case 2:
        {
            unsigned char hash[CC_SHA384_DIGEST_LENGTH];
            CC_SHA1(data, length, hash);
            return [NSData dataWithBytes:hash length:CC_SHA384_DIGEST_LENGTH];
        }
            
        case 3:
        {
            unsigned char hash[CC_SHA512_DIGEST_LENGTH];
            CC_SHA1(data, length, hash);
            return [NSData dataWithBytes:hash length:CC_SHA512_DIGEST_LENGTH];
        }
            
        default:
            return nil;
    }
}

@end
