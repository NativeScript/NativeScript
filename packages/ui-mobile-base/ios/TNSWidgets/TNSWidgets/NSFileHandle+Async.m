//
//  NSFileHandle+Async.m
//  TNSWidgets
//
//  Created by Osei Fortune on 03/05/2023.
//  Copyright © 2023 Telerik A D. All rights reserved.
//

#import "NSFileHandle+Async.h"

@implementation NSFileHandle(Async)

- (void)appendData:(NSData *)data completion:(void (^)(NSError*))callback {
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.fileHandle", NULL);
    dispatch_async(asyncQueue, ^(void) {
        NSError *error = nil;
        
        if (@available(iOS 13.0, *)) {
            [self seekToEndReturningOffset:nil error:&error];
            [self writeData:data error:&error];
        } else {
            @try {
                [self seekToEndOfFile];
                [self writeData:data];
            } @catch (NSException *exception) {
              
                NSMutableDictionary * info = [NSMutableDictionary dictionary];
                   [info setValue:exception.name forKey:@"ExceptionName"];
                   [info setValue:exception.reason forKey:@"ExceptionReason"];
                   [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
                   [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
                   [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];

                error = [[NSError alloc] initWithDomain:@"" code: 1 userInfo:info];
                
            }
        }
       
        
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(error);
        });
        
    });
}

+ (void)fileHandleWith:(NSString *)path data:(NSData *)data completion:(void (^)(NSFileHandle*, NSError*))callback {
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.fileHandle", NULL);
    dispatch_async(asyncQueue, ^(void) {
        NSFileHandle* handle = [NSFileHandle fileHandleForWritingAtPath: path];
        NSError *error = nil;
        
        if (@available(iOS 13.0, *)) {
            [handle seekToEndReturningOffset:nil error:&error];
            [handle writeData:data error:&error];
        } else {
            @try {
                [handle seekToEndOfFile];
                [handle writeData:data];
            } @catch (NSException *exception) {
              
                NSMutableDictionary * info = [NSMutableDictionary dictionary];
                   [info setValue:exception.name forKey:@"ExceptionName"];
                   [info setValue:exception.reason forKey:@"ExceptionReason"];
                   [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
                   [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
                   [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];

                error = [[NSError alloc] initWithDomain:@"" code: 1 userInfo:info];
                
            }
        }
       
        
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(handle,error);
        });
        
    });
}

@end
