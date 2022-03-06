//
//  TNSFsDirent.m
//  TNSWidgets
//
//  Created by Osei Fortune on 18/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsDirent.h"
#import "TNSFsDirent+Internal.h"
@implementation TNSFsDirent
- (instancetype)initWithDirent:(FileDirent *)dirent {
    if (self) {
        self.dirent = dirent;
    }
    return self;
}

- (BOOL)isBlockDevice {
    return native_fs_file_dirent_is_block_device(self.dirent);
}

- (BOOL)isCharacterDevice {
    return native_fs_file_dirent_is_character_device(self.dirent);
}

- (BOOL)isDirectory {
    return native_fs_file_dirent_is_directory(self.dirent);
}
- (BOOL)isFIFO {
    return native_fs_file_dirent_is_fifo(self.dirent);
}
- (BOOL)isFile {
    return native_fs_file_dirent_is_file(self.dirent);
}
- (BOOL)isSocket {
    return native_fs_file_dirent_is_socket(self.dirent);
}
- (BOOL)isSymbolicLink {
    return native_fs_file_dirent_is_symbolic_link(self.dirent);
}

- (NSString *)name {
    char* name = native_fs_file_dirent_name(self.dirent);
    NSString* ret = [NSString stringWithUTF8String: name];
    return  ret;
}
- (void)dealloc {
    native_dispose_file_dirent(self.dirent);
}

@end
