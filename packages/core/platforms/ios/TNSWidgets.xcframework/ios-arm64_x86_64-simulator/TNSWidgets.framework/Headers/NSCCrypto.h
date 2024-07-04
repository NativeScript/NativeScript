//
//  NSCCrypto.h
//  TNSWidgets
//
//  Created by Osei Fortune on 03/07/2024.
//  Copyright © 2024 NativeScript. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCrypto.h>
#ifndef NSCCrypto_h
#define NSCCrypto_h

@interface NSCCrypto:NSObject
+ (nonnull NSString*)randomUUID;
+ (nullable NSString*)getRandomValues:(nonnull void*)buffer length:(unsigned int)length;
+ (nullable NSData*)digest:(nonnull void*)data length:(unsigned int)length mode:(int)mode;
@end
#endif /* NSCCrypto_h */
