//
//  TNSFsWatcher.m
//  TNSWidgets
//
//  Created by Osei Fortune on 21/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsWatcher.h"
#import "TNSFsWatcher+Internal.h"
@implementation TNSFsWatcher

- (instancetype)initWithFilename:(NSString *)filename callback:(TNSFsCallback *)callback {
    if(self){
        self.filename = filename;
        self.callback = callback;
        self.changeListeners = [NSMutableSet set];
        self.closeListeners = [NSMutableSet set];
        self.errorListeners = [NSMutableSet set];
    }
    return self;
}

- (id)addChangeListener:(id (^)(NSString *, NSString *))listener {
    [self.changeListeners addObject:listener];
    return listener;
}

- (void)removeChangeListener:(id (^)(NSString *, NSString *))listener {
    [self.changeListeners removeObject:listener];
}

- (id)addCloseListener:(id (^)(void))listener{
    [self.closeListeners addObject:listener];
    return listener;
}

- (void)removeCloseListener:(id (^)(void))listener {
    [self.closeListeners removeObject:listener];
}

- (id)addErrorListener:(id (^)(NSError *))listener {
    [self.errorListeners addObject:listener];
    return listener;
}

- (void)removeErrorListener:(id (^)(NSError *))listener {
    [self.errorListeners removeObject:listener];
}


- (void)close {
    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
        [self.closeListeners enumerateObjectsUsingBlock:^(id (^ _Nonnull obj)(void), BOOL * _Nonnull stop) {
            dispatch_async(dispatch_get_main_queue(), ^{
                obj();
            });
        }];
    };
    
    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){};
    
    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
    [TNSFsCallback addCallback: cb];
    
    native_fs_watcher_close(self.filename.UTF8String, self.callback.callback, cb.callback);
}

- (void)ref {
    native_fs_watcher_ref(self.filename.UTF8String, self.callback.callback);
}

- (void)unref {
    native_fs_watcher_unref(self.filename.UTF8String, self.callback.callback);
}
- (void)dealloc {
    [TNSFsCallback removeCallback:self.callback];
}
@end

