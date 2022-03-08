//
//  TNSFsStat.h
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsStat_h
#define TNSFsStat_h
#import <Foundation/Foundation.h>
#import "nativescript_common.h"
@interface TNSFsStat: NSObject
@property (readonly)  long dev;
@property (readonly)  long ino;
@property (readonly)  int mode;
@property (readonly)  long nlink;
@property (readonly)  int uid;
@property (readonly)  int gid;
@property (readonly)  long rdev;
@property (readonly)  long size;
@property (readonly)  long blksize;
@property (readonly)  long blocks;
@property (readonly)  double atimeMs;
@property (readonly)  double mtimeMs;
@property (readonly)  double ctimeMs;
@property (readonly)  double birthtimeMs;
@property (readonly)  NSDate* atime;
@property (readonly)  NSDate* mtime;
@property (readonly)  NSDate* ctime;
@property (readonly)  NSDate* birthtime;
-(BOOL)isBlockDevice;
-(BOOL)isCharacterDevice;
-(BOOL)isDirectory;
-(BOOL)isFIFO;
-(BOOL)isFile;
-(BOOL)isSocket;
-(BOOL)isSymbolicLink;
@end

#endif /* TNSFsStat_h */
