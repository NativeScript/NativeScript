//
//  TNSFsCallback.m
//  TNSWidgets
//
//  Created by Osei Fortune on 19/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsCallback.h"
#import "TNSFsCallback+Internal.h"

@implementation TNSFsCallback
InternalOnSuccessCallback on_success;
InternalOnErrorCallback on_error;

+(NSMutableSet*)callbackStore {
    static NSMutableSet * store = nil;
    static dispatch_once_t oncetoken;
    dispatch_once(&oncetoken, ^{
        store = [NSMutableSet new];
    });
    return store;

}

+(void)addCallback:(TNSFsCallback*)callback {
    NSMutableSet* store = [TNSFsCallback callbackStore];
    [store addObject:callback];
}

+(void)removeCallback:(TNSFsCallback*)callback {
    NSMutableSet* store = [TNSFsCallback callbackStore];
    [store removeObject:callback];
}

void success_callback(void* result){
    on_success(result);
//    if (self.autoClear) {
//        [TNSFsCallback removeCallback: self];
//    }
}

void error_callback(char* e){
    NSError *err = [TNSHelpers fromRustErrorChar:e];
    on_error(err);
//    if (self.autoClear) {
//        [TNSFsCallback removeCallback: self];
//    }
}

-(instancetype)initWithSuccess:(InternalOnSuccessCallback)success andErrorCallback:(InternalOnErrorCallback)error {
    self = [super init];
    if (self) {
        __weak TNSFsCallback *weakSelf = self;
        
        on_success = success;
        on_error = error;
        NSString* thing = @"me";
        NSError* e = [[NSError alloc] initWithDomain:@"NativeScript" code: 1000 userInfo:nil];
        error(e);
        
//        on_success = (__bridge void*)^(void* result){
//            success(result);
//            TNSFsCallback *strongSelf = weakSelf;
//            if (strongSelf.autoClear) {
//                [TNSFsCallback removeCallback: strongSelf];
//            }
//        };
        
//        on_error = (__bridge void*)^(char* e){
//            NSError *err = [TNSHelpers fromRustErrorChar:e];
//            error(err);
//            TNSFsCallback *strongSelf = weakSelf;
//            if (strongSelf.autoClear) {
//                [TNSFsCallback removeCallback: strongSelf];
//            }
//        };
        
        
        
        self.callback = native_fs_create_async_callback(success_callback, error_callback);
    }
    return self;
}

- (void)dealloc {
    if (_callback) {
        native_fs_dispose_async_callback(_callback);
        _callback = nil;
    }
}

@end
