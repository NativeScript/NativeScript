//
//  NSString+WinterCG.h
//  NSCWinterCG
//
//  Created by Osei Fortune and Nathan Walker on 07/09/2024.
//  Copyright © 2024 NativeScript. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSString (WinterCG)

+ (NSString*)atob:(nonnull NSString*)data;

+ (NSString*)btoa:(nonnull NSString*)stringToEncode;

@end

NS_ASSUME_NONNULL_END
