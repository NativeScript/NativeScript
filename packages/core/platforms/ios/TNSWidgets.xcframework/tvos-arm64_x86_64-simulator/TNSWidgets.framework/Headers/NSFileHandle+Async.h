//
//  NSFileHandle+Async.h
//  TNSWidgets
//
//  Created by Osei Fortune on 03/05/2023.
//  Copyright © 2023 NativeScript. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSFileHandle (Async)

- (void)appendData:(nonnull NSData*) data
         completion:(void (^) (NSError*))callback;

+ (void)fileHandleWith:(NSString *)path data:(NSData *)data completion:(void (^)(NSFileHandle*,NSError*))callback;

@end

NS_ASSUME_NONNULL_END
