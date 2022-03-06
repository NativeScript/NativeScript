//
//  TNSFsStatWatcher.m
//  TNSWidgets
//
//  Created by Osei Fortune on 21/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsStatWatcher+Internal.h"
@implementation TNSFsStatWatcher
- (instancetype)initWithCallback:(TNSFsCallback *)callback {
    if (self) {
        self.callback = callback;
    }
    return self;
}

- (void)ref {
    native_fs_file_watcher_ref(self.filename.UTF8String, self.callback.callback);
}
- (void)unref {
    native_fs_file_watcher_unref(self.filename.UTF8String, self.callback.callback);
}
@end
