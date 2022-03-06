//
//  TNSFsDir.m
//  TNSWidgets
//
//  Created by Osei Fortune on 18/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsDir.h"
#import "TNSFsDir+Internal.h"
#import "TNSFsCallback+Internal.h"
#import "TNSFsDirent+Internal.h"

@implementation TNSFsDir
BOOL closed = NO;
- (instancetype)initWithDir:(FileDir *)dir {
    if (self) {
        self.dir = dir;
    }
    return self;
}
- (NSString *)path {
    return [NSString stringWithUTF8String: self.dir->path];
}

- (void)close:(void(^)(NSError*))callback {
    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
        closed = YES;
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(nil);
        });
    };
    
    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(error);
        });
    };
    
    
    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
    [TNSFsCallback addCallback: cb];
    
    native_fs_file_dir_close(self.dir, cb.callback);
}

- (void)closeSync {
    native_fs_file_dir_close_sync(self.dir);
    closed = YES;
}


- (void)read:(void(^)(TNSFsDirent*, NSError*))callback {
    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
        TNSFsDirent* dirent = [[TNSFsDirent init] initWithDirent:(FileDirent*)result];
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(dirent,nil);
        });
    };
    
    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(nil,error);
        });
    };
    
    
    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
    [TNSFsCallback addCallback: cb];
    
    native_fs_file_dir_readdir(self.dir, cb.callback);
}

- (TNSFsDirent*)readSync {
    return [[TNSFsDirent init] initWithDirent: native_fs_file_dir_readdir_sync(self.dir)];
}

- (void)dealloc {
    if(self.dir == nil){
        return;
    }
    if (!closed) {
        native_fs_file_dir_close_sync(self.dir);
    }
    native_dispose_file_dir(self.dir);
}
@end
