//
//  TNSFsStat.m
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//
#import "TNSFsStat.h"
#import "TNSFsStat+Internal.h"
@implementation TNSFsStat
- (instancetype)initWithFileStat:(FileStat *)fileStat {
    if (self) {
        self.fileStat = fileStat;
    }
    return self;
}

- (long)dev {
    return self.fileStat->dev;
}

- (long)ino {
    return self.fileStat->ino;
}
- (int)mode {
    return self.fileStat->mode;
}
- (long)nlink {
    return self.fileStat->nlink;
}
- (int)uid {
    return self.fileStat->uid;
}
- (int)gid {
    return self.fileStat->gid;
}
- (long)rdev {
    return self.fileStat->rdev;
}
- (long)size {
    return self.fileStat->size;
}
- (long)blksize{
    return self.fileStat->blksize;
}
- (long)blocks{
    return self.fileStat->blocks;
}

- (double)atimeMs {
    return self.fileStat->atimeMs;
}
- (double)mtimeMs {
    return self.fileStat->mtimeMs;
}
- (double)ctimeMs {
    return self.fileStat->ctimeMs;
}
- (double)birthtimeMs {
    return self.fileStat->birthtimeMs;
}

- (NSDate *)atime {
    return [NSDate dateWithTimeIntervalSince1970:self.fileStat->atime];
}
- (NSDate *)mtime {
    return [NSDate dateWithTimeIntervalSince1970:self.fileStat->mtime];
}
- (NSDate *)ctime {
    return [NSDate dateWithTimeIntervalSince1970:self.fileStat->ctime];
}
- (NSDate *)birthtime {
    return [NSDate dateWithTimeIntervalSince1970:self.fileStat->birthtime];
}

- (BOOL)isBlockDevice {
    return self.fileStat->isBlockDevice;
}

- (BOOL)isCharacterDevice {
    return self.fileStat->isCharacterDevice;
}

- (BOOL)isDirectory {
    return self.fileStat->isDirectory;
}
- (BOOL)isFIFO {
    return self.fileStat->isFIFO;
}
- (BOOL)isFile {
    return self.fileStat->isFile;
}
- (BOOL)isSocket {
    return self.fileStat->isSocket;
}
- (BOOL)isSymbolicLink {
    return self.fileStat->isSymbolicLink;
}
- (void)dealloc {
    native_dispose_file_stat(self.fileStat);
    self.fileStat = nil;
}
@end
