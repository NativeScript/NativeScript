//
//  NSString+WinterCG.h
//  NSCWinterCG
//
//  Created by Osei Fortune and Nathan Walker on 07/09/2024.
//  Copyright © 2024 NativeScript. All rights reserved.
//

#import "NSString+WinterCG.h"

@implementation NSString (WinterCG)

+ (NSString*)atob:(nonnull NSString*)data {
    NSData* decodedData = [[NSData alloc] initWithBase64EncodedString:data options:0];
    return [[NSString alloc] initWithData:decodedData encoding:NSUTF8StringEncoding];
}

+ (NSString*)btoa:(nonnull NSString*)stringToEncode {
    NSData* encoded = [stringToEncode dataUsingEncoding: NSUTF8StringEncoding];
    return [encoded base64EncodedStringWithOptions:0];
}

@end
