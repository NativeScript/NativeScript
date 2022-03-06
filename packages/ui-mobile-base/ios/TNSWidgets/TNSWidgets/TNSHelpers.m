//
//  TNSHelpers.m
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "TNSHelpers.h"

@implementation TNSHelpers
+(NSError*)toError:(NSException*)exception {
    NSMutableDictionary * info = [NSMutableDictionary dictionary];
    [info setValue:exception.name forKey:@"ExceptionName"];
    [info setValue:exception.reason forKey:@"ExceptionReason"];
    [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
    [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
    [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];
    
    NSError *error = [[NSError alloc] initWithDomain:@"NativeScript" code: 1000 userInfo:info];
    return error;
}
+(NSError*)fromRustErrorChar:(char*) error {
    NSString* e = [NSString stringWithUTF8String:error];
    NSException *exception = [NSException exceptionWithName: NSGenericException reason:e userInfo:nil];
    native_dispose_string(error);
    return [TNSHelpers toError: exception];
}
@end
