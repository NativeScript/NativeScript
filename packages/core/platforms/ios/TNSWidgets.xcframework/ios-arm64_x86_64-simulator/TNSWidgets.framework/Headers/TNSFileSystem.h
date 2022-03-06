//
//  TNSFileSystem.h
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFileSystem_h
#define TNSFileSystem_h
#import <Foundation/Foundation.h>
#import "nativescript_common.h"
#import "TNSFileHandle.h"
#import "TNSFsDir.h"
#import "TNSFsDirent.h"
#import "TNSByteBuf.h"
#import "TNSFsCallback.h"
#import "TNSFsStat.h"
#import "TNSFsWatcher.h"
#import "TNSFsStatWatcher.h"

@interface TNSFileSystem : NSObject

+(void)accessSync:(NSString*)path withMode:(int)mode;
+(void)access:(NSString*)path withMode:(int)mode callback:(void(^)(NSError*))callback;

+(void)appendFileSync:(NSString*)path withString:(NSString*)string mode:(int)mode flags:(int)flags ;
+(void)appendFile:(NSString*)path withString:(NSString*)string mode:(int)mode flags:(int)flags  callback:(void(^)(NSError*))callback;

+(void)appendFileSync:(NSString*)path withData:(NSData*)data mode:(int)mode flags:(int)flags ;
+(void)appendFile:(NSString*)path withData:(NSData*)data mode:(int)mode flags:(int)flags  callback:(void(^)(NSError*))callback;

+(void)appendFileSyncWithFd:(int)fd withString:(NSString*)string;
+(void)appendFileWithFd:(int)fd withString:(NSString*)string callback:(void(^)(NSError*))callback;

+(void)appendFileSyncWithFd:(int)fd withData:(NSData*)data;
+(void)appendFileWithFd:(int)fd withData:(NSData*)data callback:(void(^)(NSError*))callback;

+(void)chmodSync:(NSString*)path mode:(uint)mode;
+(void)chmod:(NSString*)path mode:(uint)mode withCallback:(void(^)(NSError*))callback;

+(void)chownSync:(NSString*)path uid:(uint)uid gid:(uint)gid;
+(void)chown:(NSString*)path uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback;

+(void)closeSync:(int)handle;
+(void)close:(int)handle withCallback:(void(^)(NSError*))callback;

+(void)copyFileSyncWithSrc:(NSString*)src dest:(NSString*)dest flags:(uint)flags;
+(void)copyFileWithSrc:(NSString*)src dest:(NSString*)dest flags:(uint)flags callback:(void(^)(NSError*))callback;

+(BOOL)existsSync:(NSString*)path;
+(void)existsSync:(NSString*)path callback:(void(^)(BOOL))callback;

+(void)fchmodSync:(int)fd mode:(uint)mode;
+(void)fchmod:(int)fd mode:(uint)mode withCallback:(void(^)(NSError*))callback;

+(void)fchownSync:(int)fd uid:(uint)uid gid:(uint)gid;
+(void)fchown:(int)fd uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback;

+(void)fdatasyncSync:(int)fd;
+(void)fdatasync:(int)fd withCallback:(void(^)(NSError*))callback;

+(TNSFsStat*)fstatSync:(int)fd;
+(void)fstate:(int)fd withCallback:(void(^)(TNSFsStat*,NSError*))callback;

+(void)fsyncSync:(int)fd;
+(void)fsync:(int)fd withCallback:(void(^)(NSError*))callback;

+(void)ftruncateSync:(int)fd length:(long)length;
+(void)ftruncate:(int)fd length:(long)length withCallback:(void(^)(NSError*))callback;

+(void)futimesSync:(int)fd atime:(long)atime utime:(long)utime;
+(void)futimes:(int)fd atime:(long)atime utime:(long)utime withCallback:(void(^)(NSError*))callback;

+(void)lchmodSync:(NSString*)path mode:(uint)mode;
+(void)lchmod:(NSString*)path mode:(uint)mode withCallback:(void(^)(NSError*))callback;

+(void)lchownSync:(NSString*)path uid:(uint)uid gid:(uint)gid;
+(void)lchown:(NSString*)path uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback;

+(void)lutimesSync:(NSString*)path atime:(long)atime utime:(long)utime;
+(void)lutimes:(NSString*)path atime:(long)atime utime:(long)utime withCallback:(void(^)(NSError*))callback;

+(void)linkSync:(NSString*)existingPath newPath:(NSString*)newPath;
+(void)link:(NSString*)existingPath newPath:(NSString*)newPath withCallback:(void(^)(NSError*))callback;

+(TNSFsStat*)lstatSync:(NSString*)path;
+(void)lstat:(NSString*)path withCallback:(void(^)(TNSFsStat*,NSError*))callback;

+(void)mkdirSync:(NSString*)path mode:(uint)mode recursive:(BOOL)recursive;
+(void)mkdir:(NSString*)path mode:(uint)mode recursive:(BOOL)recursive callback:(void(^)(NSError*))callback;

+(NSString*)mkdtempSync:(NSString*)prefix;
+(void)mkdtemp:(NSString*)prefix callback:(void(^)(NSString*,NSError*))callback;

+(int)openSync:(NSString*)path flags:(int)flags mode:(int)mode;
+(void)open:(NSString*)path flags:(int)flags mode:(int)mode callback:(void(^)(int,NSError*))callback;

+(TNSFsDir*)opendirSync:(NSString*)path;
+(void)opendir:(NSString*)path callback:(void(^)(TNSFsDir*,NSError*))callback;

+(long)readSync:(int)fd withBuffer:(NSMutableData*)buffer offset:(int)offset length:(int)length position:(int)position;
+(void)read:(int)fd withBuffer:(NSMutableData*)buffer offset:(int)offset length:(int)length position:(int)position callback:(void(^)(long,NSMutableData*,NSError*))callback;

+(NSArray<TNSFsDirent*>*)readdirSync:(NSString*)path;
+(void)readdir:(NSString*)path callback:(void(^)(NSArray<TNSFsDirent*>*,NSError*))callback;

+(TNSByteBufMut*)readFileSync:(NSString*)path flag:(int)flags;
+(void)readFile:(NSString*)path flag:(int)flags callback:(void(^)(TNSByteBufMut*,NSError*))callback;

+(NSString*)readlinkSync:(NSString*)path;
+(void)readlink:(NSString*)path callback:(void(^)(NSString*,NSError*))callback;

+(long)readvSync:(int)fd buffer:(NSArray<NSMutableData*>*)buffer position:(long)position;
+(void)readv:(int)fd buffer:(NSArray<NSMutableData*>*)buffer position:(long)position callback:(void(^)(long,NSError*))callback;

+(NSString*)realpathSync:(NSString*)path;
+(void)realpath:(NSString*)path callback:(void(^)(NSString*,NSError*))callback;

+(void)renameSync:(NSString*)oldPath newPath:(NSString*)newPath;
+(void)rename:(NSString*)oldPath newPath:(NSString*)newPath callback:(void(^)(NSError*))callback;

+(void)rmdirSync:(NSString*)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay;
+(void)rmdir:(NSString*)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay callback:(void(^)(NSError*))callback;

+(void)rmSync:(NSString*)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay;
+(void)rm:(NSString*)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay callback:(void(^)(NSError*))callback;

+(TNSFsStat*)statSync:(NSString*)path throwIfNoEntry:(BOOL)throwIfNoEntry;
+(void)stat:(NSString*)path throwIfNoEntry:(BOOL)throwIfNoEntry withCallback:(void(^)(TNSFsStat*,NSError*))callback;

+(void)symlinkSync:(NSString*)target path:(NSString*)path type:(NSString*)type;
+(void)symlink:(NSString*)target path:(NSString*)path type:(NSString*)type callback:(void(^)(NSError*))callback;

+(void)truncateSync:(NSString*)path length:(unsigned long)length;
+(void)truncate:(NSString*)path length:(unsigned long)length withCallback:(void(^)(NSError*))callback;

+(void)unlinkSync:(NSString*)path;
+(void)unlink:(NSString*)path callback:(void(^)(NSError*))callback;

+(void)unwatchFile:(NSString*)filename;

+(void)utimesSync:(NSString*)path atime:(long)atime utime:(long)utime;
+(void)utimes:(NSString*)path atime:(long)atime utime:(long)utime withCallback:(void(^)(NSError*))callback;


+(TNSFsStatWatcher*)watchWithFileName:(NSString*)filename persistent:(BOOL)persistent recursive:(BOOL)recursive encoding:(NSString*)encoding signal:(void(^)(NSError*))signal listener:(void(^)(NSString*,NSString*))listener;

+(TNSFsWatcher*)watchFileWithFileName:(NSString*)filename bigint:(BOOL)bigint persistent:(BOOL)persistent interval:(unsigned long)interval listener:(void(^)(TNSFsStat*,TNSFsStat*))listener;


+(void)writeFileSync:(int)fd data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags;
+(void)writeFile:(int)fd data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback;

+(void)writeFileWithPathSync:(NSString*)path data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags;
+(void)writeFileWithPath:(NSString*)path data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback;


+(void)writeFileSync:(int)fd string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags;
+(void)writeFile:(int)fd string:(NSString*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback;

+(void)writeFileWithPathSync:(NSString*)path string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags;
+(void)writeFileWithPath:(NSString*)path string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback;


+(long)writeSync:(int)fd withBuffer:(NSData*)buffer offset:(int)offset length:(int)length position:(int)position;
+(void)write:(int)fd withBuffer:(NSData*)buffer offset:(int)offset length:(int)length position:(int)position callback:(void(^)(long,TNSByteBuf*,NSError*))callback;


+(long)writeSync:(int)fd withString:(NSString*)string position:(int)position encoding:(NSString*)encoding;
+(void)write:(int)fd withString:(NSString*)string position:(int)position encoding:(NSString*)encoding callback:(void(^)(long,NSError*))callback;


+(long)writevSync:(int)fd buffers:(NSArray<NSData*>*)buffers position:(long)position;
+(void)writev:(int)fd buffers:(NSArray<NSData*>*)buffers position:(long)position callback:(void(^)(long,NSError*))callback;


+(void) openWithPath:(NSString*)path flags:(int)flag mode:(int)mode callback:(void(^)(TNSFileHandle*,NSError*))callback;

@end


#endif /* TNSFileSystem_h */
