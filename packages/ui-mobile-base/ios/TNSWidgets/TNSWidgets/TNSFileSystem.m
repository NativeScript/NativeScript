//
//  TNSFileSystem.m
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#import "TNSFileSystem.h"
#import "TNSFsCallback+Internal.h"
#import "TNSFsStat+Internal.h"
#import "TNSFsDir+Internal.h"
#import "TNSByteBuf+Internal.h"
#import "TNSFsDirent+Internal.h"
#import "TNSFsDirent+Internal.h"
#import "TNSFsWatcher+Internal.h"
#import "TNSFsStatWatcher+Internal.h"
#import "TNSFileHandle+Internal.h"

@implementation TNSFileSystem
+ (void)accessSync:(NSString *)path withMode:(int)mode {
    native_fs_access_sync(path.UTF8String, mode);
}

+ (void)access:(NSString *)path withMode:(int)mode callback:(void (^)(NSError *))callback {
    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(nil);
        });
    };
    
    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(error);
        });
    };
    
    
    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
    [TNSFsCallback addCallback: cb];
    native_fs_access(path.UTF8String, mode, cb.callback);
}

//
//+(void)appendFileSync:(NSString*)path withString:(NSString*)string mode:(int)mode flags:(int)flags {
//    native_fs_append_file_with_path_string_sync(path.UTF8String, string.UTF8String,mode, flags);
//}
//+(void)appendFile:(NSString*)path withString:(NSString*)string mode:(int)mode flags:(int)flags  callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_append_file_with_path_string(path.UTF8String, string.UTF8String,mode, flags, cb.callback);
//}
//
//+(void)appendFileSync:(NSString*)path withData:(NSData*)data mode:(int)mode flags:(int)flags {
//    native_fs_append_file_with_path_bytes_sync(path.UTF8String, data.bytes, data.length, mode, flags);
//}
//
//+(void)appendFile:(NSString*)path withData:(NSData*)data mode:(int)mode flags:(int)flags callback:(void(^)(NSError*))callback{
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_append_file_with_path_bytes(path.UTF8String, data.bytes,data.length,mode, flags, cb.callback);
//}
//
//+(void)appendFileSyncWithFd:(int)fd withString:(NSString*)string {
//    native_fs_append_file_with_string_sync(fd, string.UTF8String);
//}
//
//+(void)appendFileWithFd:(int)fd withString:(NSString*)string callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_append_file_with_string(fd, string.UTF8String, cb.callback);
//}
//
//+(void)appendFileSyncWithFd:(int)fd withData:(NSData*)data {
//    native_fs_append_file_with_bytes_sync(fd, data.bytes, data.length);
//}
//
//+(void)appendFileWithFd:(int)fd withData:(NSData*)data callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_append_file_with_bytes(fd, data.bytes, data.length, cb.callback);
//}
//
//
//
//+(void)chmodSync:(NSString*)path mode:(uint)mode {
//    native_fs_chmod_sync(path.UTF8String, mode);
//}
//+(void)chmod:(NSString*)path mode:(uint)mode withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_chmod(path.UTF8String, mode, cb.callback);
//}
//
//
//+(void)chownSync:(NSString*)path uid:(uint)uid gid:(uint)gid {
//    native_fs_chown_sync(path.UTF8String, uid, gid);
//}
//
//+(void)chown:(NSString*)path uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_chown(path.UTF8String, uid, gid, cb.callback);
//}
//
//
//
//+(void) closeSync:(int) fd {
//    native_fs_close_sync(fd);
//}
//
//+(void)close:(int)fd withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_close(fd, cb.callback);
//}
//
//+(void)copyFileSyncWithSrc:(NSString*)src dest:(NSString*)dest flags:(uint)flags {
//    native_fs_copy_file_sync(src.UTF8String, dest.UTF8String, flags);
//}
//
//+(void)copyFileWithSrc:(NSString*)src dest:(NSString*)dest flags:(uint)flags callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_copy_file(src.UTF8String,dest.UTF8String, flags, cb.callback);
//}
//
//
//+(BOOL)existsSync:(NSString*)path {
//    return native_fs_exists_sync(path.UTF8String);
//}
//
//+(void)existsSync:(NSString*)path callback:(void(^)(BOOL))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback((BOOL)result);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_exists(path.UTF8String, cb.callback);
//}
//
//
//
//+(void)fchmodSync:(int)fd mode:(uint)mode {
//    native_fs_fchmod_sync(fd, mode);
//}
//
//+(void)fchmod:(int)fd mode:(uint)mode withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_fchmod(fd,mode, cb.callback);
//}
//
//
//+(void)fchownSync:(int)fd uid:(uint)uid gid:(uint)gid {
//    native_fs_fchown_sync(fd, uid, gid);
//}
//
//+(void)fchown:(int)fd uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_fchown(fd,uid, gid, cb.callback);
//}
//
//
//+(void)fdatasyncSync:(int)fd {
//    native_fs_fdatasync_sync(fd);
//}
//
//+(void)fdatasync:(int)fd withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_fdatasync(fd, cb.callback);
//}
//
//+(TNSFsStat*)fstatSync:(int)fd {
//    return [[TNSFsStat alloc] initWithFileStat:native_fs_fstat_sync(fd)];
//}
//
//+(void)fstate:(int)fd withCallback:(void(^)(TNSFsStat*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        TNSFsStat* stat = [[TNSFsStat alloc] initWithFileStat:(FileStat*)result];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(stat, nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil, error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_fstat(fd, cb.callback);
//}
//
//+(void)fsyncSync:(int)fd {
//    native_fs_fsync_sync(fd);
//}
//+(void)fsync:(int)fd withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_fsync(fd, cb.callback);
//}
//
//+(void)ftruncateSync:(int)fd length:(long)length {
//    native_fs_ftruncate_sync(fd, length);
//}
//
//+(void)ftruncate:(int)fd length:(long)length withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_ftruncate(fd,length, cb.callback);
//}
//
//
//
//+(void)futimesSync:(int)fd atime:(long)atime utime:(long)utime {
//    native_fs_futimes_sync(fd, atime, utime);
//}
//
//+(void)futimes:(int)fd atime:(long)atime utime:(long)utime withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_futimes(fd,atime, utime, cb.callback);
//}
//
//
//+(void)lchmodSync:(NSString*)path mode:(uint)mode {
//    native_fs_lchmod_sync(path.UTF8String, mode);
//}
//
//+(void)lchmod:(NSString*)path mode:(uint)mode withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_lchmod(path.UTF8String,mode, cb.callback);
//}
//
//+(void)lchownSync:(NSString*)path uid:(uint)uid gid:(uint)gid {
//    native_fs_lchown_sync(path.UTF8String, uid, gid);
//}
//
//+(void)lchown:(NSString*)path uid:(uint)uid gid:(uint)gid withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_lchown(path.UTF8String,uid, gid, cb.callback);
//}
//
//
//+(void)lutimesSync:(NSString*)path atime:(long)atime utime:(long)utime {
//    native_fs_lutimes_sync(path.UTF8String, atime, utime);
//}
//+(void)lutimes:(NSString*)path atime:(long)atime utime:(long)utime withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_lutimes(path.UTF8String,atime, utime, cb.callback);
//}
//
//+(void)linkSync:(NSString*)existingPath newPath:(NSString*)newPath {
//    native_fs_link_sync(existingPath.UTF8String, newPath.UTF8String);
//}
//
//+(void)link:(NSString*)existingPath newPath:(NSString*)newPath withCallback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_link(existingPath.UTF8String, newPath.UTF8String, cb.callback);
//}
//
//
//
//+(TNSFsStat*)lstatSync:(NSString*)path {
//    return [[TNSFsStat alloc] initWithFileStat:native_fs_lstat_sync(path.UTF8String)];
//}
//
//+(void)lstat:(NSString*)path withCallback:(void(^)(TNSFsStat*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        TNSFsStat* stat = [[TNSFsStat alloc] initWithFileStat:(FileStat*)result];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(stat, nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil, error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_lstat(path.UTF8String, cb.callback);
//}
//
//
//+(void)mkdirSync:(NSString*)path mode:(uint)mode recursive:(BOOL)recursive {
//    native_fs_mkdir_sync(path.UTF8String, mode, recursive);
//}
//+(void)mkdir:(NSString*)path mode:(uint)mode recursive:(BOOL)recursive callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_mkdir(path.UTF8String, mode, recursive, cb.callback);
//}
//
//+(NSString*)mkdtempSync:(NSString*)prefix {
//    char* res = native_fs_mkdtemp_sync(prefix.UTF8String);
//    NSString* ret = [NSString stringWithUTF8String:res];
//    native_dispose_string(res);
//    return ret;
//}
//+(void)mkdtemp:(NSString*)prefix callback:(void(^)(NSString*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        char* res = (char*)result;
//        NSString* ret = [NSString stringWithUTF8String:res];
//        native_dispose_string(res);
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(ret,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_mkdtemp(prefix.UTF8String,cb.callback);
//}
//
//
//+(int)openSync:(NSString*)path flags:(int)flags mode:(int)mode {
//    return native_fs_open_sync(path.UTF8String, flags, mode);
//}
//+(void)open:(NSString*)path flags:(int)flags mode:(int)mode callback:(void(^)(int,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        int ret = *(int*)result;
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(ret,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(0,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_open(path.UTF8String,flags,mode,cb.callback);
//}
//
//
//+(TNSFsDir*)opendirSync:(NSString*)path {
//    return [[TNSFsDir alloc] initWithDir:native_fs_open_dir_sync(path.UTF8String)];
//}
//
//+(void)opendir:(NSString*)path callback:(void(^)(TNSFsDir*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        TNSFsDir* fsDir = [[TNSFsDir alloc] initWithDir:(FileDir*)result];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(fsDir,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_open_dir(path.UTF8String,cb.callback);
//}
//
//
//+(long)readSync:(int)fd withBuffer:(NSMutableData*)buffer offset:(int)offset length:(int)length position:(int)position {
//    return native_fs_read_sync(fd, buffer.mutableBytes, buffer.length, offset, length, position);
//}
//
//+(void)read:(int)fd withBuffer:(NSMutableData*)buffer offset:(int)offset length:(int)length position:(int)position callback:(void(^)(long,NSMutableData*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        uint read = *(uint*)result;
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(read,buffer,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(0,nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_read(fd, buffer.mutableBytes, buffer.length, offset, length, position, cb.callback);
//}
//
//+(NSArray<TNSFsDirent*>*)readdirSync:(NSString*)path {
//    FileDirentBuf* buf = native_fs_readdir_with_file_type_sync(path.UTF8String);
//    int size = sizeof(buf->data);
//    NSMutableArray<TNSFsDirent*>* dirent = [NSMutableArray array];
//    for (int i = 0; i < buf->len; i++) {
//        TNSFsDirent* fsDir = [[TNSFsDirent alloc] initWithDirent:native_fs_file_dirent_clone((&buf->data)[i + size])];
//        [dirent addObject: fsDir];
//    }
//    return dirent;
//}
//+(void)readdir:(NSString*)path callback:(void(^)(NSArray<TNSFsDirent*>*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        FileDirentBuf* buf = (FileDirentBuf*)result;
//        int size = sizeof(buf->data);
//        NSMutableArray<TNSFsDirent*>* dirent = [NSMutableArray array];
//        for (int i = 0; i < buf->len; i++) {
//            TNSFsDirent* fsDir = [[TNSFsDirent alloc] initWithDirent:native_fs_file_dirent_clone((&buf->data)[i + size])];
//            [dirent addObject: fsDir];
//        }
//        
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(dirent,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_readdir(path.UTF8String,"", cb.callback);
//}
//
//
//+(TNSByteBufMut*)readFileSync:(NSString*)path flag:(int)flags {
//    return [[TNSByteBufMut alloc] initWithByteBufMut: native_fs_read_file_sync(path.UTF8String, flags)];
//}
//
//+(void)readFile:(NSString*)path flag:(int)flags callback:(void(^)(TNSByteBufMut*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        ByteBufMut* buf = (ByteBufMut*)result;
//        TNSByteBufMut* buffer = [[TNSByteBufMut alloc] initWithByteBufMut:buf];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(buffer,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_read_file(path.UTF8String, flags, cb.callback);
//}
//
//
//+(NSString*)readlinkSync:(NSString*)path {
//    char* res = native_fs_readlink_sync(path.UTF8String);
//    NSString* ret = [NSString stringWithUTF8String: res];
//    native_dispose_string(res);
//    return ret;
//}
//
//+(void)readlink:(NSString*)path callback:(void(^)(NSString*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        char* res = (char*)result;
//        NSString* ret = [NSString stringWithUTF8String: res];
//        native_dispose_string(res);
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(ret,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_readlink(path.UTF8String, "", cb.callback);
//}
//
//+ (long)readvSync:(int)fd buffer:(NSArray<NSMutableData *> *)buffer position:(long)position {
//    long count = buffer.count;
//    int size = sizeof(ByteBufMut);
//    long length = size * count;
//    ByteBufMut** buf = malloc(length);
//    for (int i = 0;i<count;i++) {
//        NSMutableData* data = buffer[i];
//        ByteBufMut* item = NULL;
//        item->data = data.mutableBytes;
//        item->len = data.length;
//        buf[size * count] = item;
//    }
//    
//    long ret = native_fs_readv_sync(fd, buf, length, position);
//    if (buf) {
//        free(buf);
//    }
//    return ret;
//}
//
//+(void)readv:(int)fd buffer:(NSArray<NSMutableData*>*)buffer position:(long)position callback:(void(^)(long,NSError*))callback {
//    long count = buffer.count;
//    int size = sizeof(ByteBuf);
//    long length = size * count;
//    ByteBuf** buf = malloc(length);
//    for (int i = 0;i<count;i++) {
//        NSMutableData* data = buffer[i];
//        ByteBuf item = {
//            .data = data.mutableBytes,
//            .len = data.length,
//            .inner = false
//        };
//        buf[size * count] = &item;
//    }
//    
//    
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        long read = *(long*)result;
//        if(buf){
//            free(buf);
//        }
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(read,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        if(buf){
//            free(buf);
//        }
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(0,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    
//    native_fs_readv(fd, buf, length, position, cb.callback);
//}
//
//
//+ (NSString *)realpathSync:(NSString *)path {
//    char* res = native_fs_realpath_sync(path.UTF8String);
//    NSString* ret = [NSString stringWithUTF8String:res];
//    native_dispose_string(res);
//    return ret;
//}
//
//+ (void)realpath:(NSString *)path callback:(void (^)(NSString *, NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        char* res = (char*)result;
//        NSString* ret = [NSString stringWithUTF8String: res];
//        native_dispose_string(res);
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(ret,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_realpath(path.UTF8String, cb.callback);
//}
//
//
//+ (void)renameSync:(NSString *)oldPath newPath:(NSString *)newPath {
//    native_fs_rename_sync(oldPath.UTF8String, newPath.UTF8String);
//}
//
//+ (void)rename:(NSString *)oldPath newPath:(NSString *)newPath callback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_rename(oldPath.UTF8String, newPath.UTF8String, cb.callback);
//}
//
//+ (void)rmdirSync:(NSString *)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(unsigned long)retryDelay {
//    native_fs_rmdir_sync(path.UTF8String, maxRetries, recursive, retryDelay);
//}
//
//+ (void)rmdir:(NSString *)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay callback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_rmdir(path.UTF8String, maxRetries, recursive, retryDelay, cb.callback);
//}
//
//
//+ (void)rmSync:(NSString *)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(unsigned long)retryDelay {
//    native_fs_rm_sync(path.UTF8String, maxRetries, recursive, retryDelay);
//}
//
//+ (void)rm:(NSString *)path maxRetries:(int)maxRetries recursive:(BOOL)recursive retryDelay:(long)retryDelay callback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_rm(path.UTF8String, maxRetries, recursive, retryDelay, cb.callback);
//}
//
//
//+(TNSFsStat*)statSync:(NSString*)path throwIfNoEntry:(BOOL)throwIfNoEntry {
//    return [[TNSFsStat alloc] initWithFileStat:native_fs_stat_sync(path.UTF8String, throwIfNoEntry)];
//}
//
//+(void)stat:(NSString*)path throwIfNoEntry:(BOOL)throwIfNoEntry withCallback:(void(^)(TNSFsStat*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        TNSFsStat* stat = [[TNSFsStat alloc] initWithFileStat:(FileStat*)result];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(stat, nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil, error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_stat(path.UTF8String, throwIfNoEntry, cb.callback);
//}
//
//+ (void)symlinkSync:(NSString *)target path:(NSString *)path type:(NSString *)type {
//    native_fs_symlink_sync(target.UTF8String, path.UTF8String, type.UTF8String);
//}
//
//+ (void)symlink:(NSString *)target path:(NSString *)path type:(NSString *)type callback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_symlink(target.UTF8String, path.UTF8String, type.UTF8String, cb.callback);
//}
//
//+ (void)truncateSync:(NSString *)path length:(unsigned long)length {
//    native_fs_truncate_sync(path.UTF8String, length);
//}
//
//+ (void)truncate:(NSString *)path length:(unsigned long)length withCallback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_truncate(path.UTF8String, length, cb.callback);
//}
//
//
//+ (void)unlinkSync:(NSString *)path {
//    native_fs_unlink_sync(path.UTF8String);
//}
//
//+ (void)unlink:(NSString *)path callback:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_unlink(path.UTF8String, cb.callback);
//}
//
//+ (void)unwatchFile:(NSString *)filename listener:(TNSFsCallback*)listener {
//    native_fs_file_watcher_unref(filename.UTF8String, listener.callback);
//}
//
//+ (TNSFsWatcher*)watchWithFileName:(NSString *)filename persistent:(BOOL)persistent recursive:(BOOL)recursive encoding:(NSString *)encoding signal:(void (^)(NSError *))signal listener :(void (^)(NSString *, NSString *))listener {
//    TNSFsWatcher* watcher;
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        WatchEvent* event = (WatchEvent*)result;
//        NSString* name = [NSString stringWithUTF8String:event->filename];
//        NSString* event_type = [NSString stringWithUTF8String:event->event_type];
//        native_fs_dispose_watch_event(event);
//        
//        if (watcher) {
//            [watcher.changeListeners enumerateObjectsUsingBlock:^(id (^ _Nonnull obj)(NSString *, NSString *), BOOL * _Nonnull stop) {
//                dispatch_async(dispatch_get_main_queue(), ^{
//                    obj(event_type, name);
//                });
//            }];
//        }
//        
//        if (listener) {
//            listener(event_type, name);
//        }
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){};
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    cb.autoClear = false;
//    [TNSFsCallback addCallback: cb];
//    
//    watcher = [[TNSFsWatcher alloc] initWithFilename:filename callback:cb];
//    native_fs_watch(filename.UTF8String, persistent, recursive, encoding.UTF8String, cb.callback);
//    return watcher;
//}
//
//+ (TNSFsStatWatcher*)watchFileWithFileName:(NSString *)filename bigint:(BOOL)bigint persistent:(BOOL)persistent interval:(unsigned long)interval listener:(nullable void(^)(TNSFsStat*,TNSFsStat*))listener {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        FileWatchEvent* event = (FileWatchEvent*)result;
//        TNSFsStat* current = [[TNSFsStat alloc] initWithFileStat: event->current];
//        TNSFsStat* previous = [[TNSFsStat alloc] initWithFileStat: event->previous];
//        native_fs_dispose_file_watch_event(event);
//        
//        if (listener) {
//            listener(current, previous);
//        }
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){};
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    cb.autoClear = false;
//    [TNSFsCallback addCallback: cb];
//    
//    TNSFsStatWatcher* watcher = [[TNSFsStatWatcher alloc] initWithCallback:cb];
//    native_fs_watch_file(filename.UTF8String, bigint, persistent, interval, cb.callback);
//    return watcher;
//}
//
//
//+(void)writeFileSync:(int)fd data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags {
//    native_fs_write_file_with_bytes_sync(fd, data.bytes, data.length, encoding.UTF8String);
//}
//
//+(void)writeFile:(int)fd data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback {
//    
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_write_file_with_bytes(fd, data.bytes, data.length, cb.callback);
//}
//
//+(void)writeFileWithPathSync:(NSString*)path data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags{
//    native_fs_write_file_with_path_bytes_sync(path.UTF8String, data.bytes, data.length, encoding.UTF8String, mode, flags);
//}
//
//+(void)writeFileWithPath:(NSString*)path data:(NSData*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_write_file_with_path_bytes(path.UTF8String, data.bytes, data.length, encoding.UTF8String, mode, flags, cb.callback);
//}
//
//
//+(void)writeFileSync:(int)fd string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags {
//    native_fs_write_file_with_string_sync(fd, string.UTF8String, encoding.UTF8String);
//}
//
//+(void)writeFile:(int)fd string:(NSString*)data optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_write_file_with_string(fd, data.UTF8String, cb.callback);
//}
//
//+(void)writeFileWithPathSync:(NSString*)path string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags {
//    native_fs_write_file_with_path_string_sync(path.UTF8String, string.UTF8String, encoding.UTF8String, mode, flags);
//}
//
//+(void)writeFileWithPath:(NSString*)path string:(NSString*)string optionsEncoding:(NSString*)encoding mode:(int)mode flags:(int)flags signal:(void(^)(NSError*))signal callback:(void(^)(NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_fs_write_file_with_path_string(path.UTF8String, string.UTF8String, encoding.UTF8String,mode, flags, cb.callback);
//}
//
//
//+(long)writeSync:(int)fd withBuffer:(NSData*)buffer offset:(int)offset length:(int)length position:(int)position {
//    return native_fs_write_sync(fd, buffer.bytes, buffer.length, offset, length, position);
//}
//
//+(void)write:(int)fd withBuffer:(NSData*)buffer offset:(int)offset length:(int)length position:(int)position callback:(void(^)(long,TNSByteBuf*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        uint wrote = *(uint*)result;
//        TNSByteBuf* buf = [[TNSByteBuf alloc] initWithBytesNoCopy:buffer.bytes length:buffer.length];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(wrote,buf,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(0,nil,error);
//        });
//    };
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_write(fd, buffer.bytes, buffer.length, offset, length, position, cb.callback);
//}
//
//
//
//+(long)writeSync:(int)fd withString:(NSString*)string position:(int)position encoding:(NSString*)encoding {
//    return native_fs_write_string_sync(fd, string.UTF8String, encoding.UTF8String, position);
//}
//
//+(void)write:(int)fd withString:(NSString*)string position:(int)position encoding:(NSString*)encoding callback:(void(^)(long,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        uint wrote = *(uint*)result;
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(wrote,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(0,error);
//        });
//    };
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_fs_write_string(fd, string.UTF8String, encoding.UTF8String, position, cb.callback);
//}
//
//
//
//+(long)writevSync:(int)fd buffers:(NSArray<NSData*>*)buffers position:(long)position {
//    long ret = 0;
//    @autoreleasepool {
//        long count = buffers.count;
//        int size = sizeof(ByteBuf);
//        long length = size * count;
//        const ByteBuf** buf = malloc(length);
//        for (int i = 0;i<count;i++) {
//            NSData* data = buffers[i];
//            ByteBuf item = {
//                .data = data.bytes,
//                .len = data.length,
//                .inner = false
//            };
//            buf[size * count] = &item;
//        }
//        
//        ret = native_fs_writev_sync(fd, buf, length, position);
//        if (buf) {
//            free(buf);
//        }
//    }
//    return ret;
//}
//
//
//+(void)writev:(int)fd buffers:(NSArray<NSData*>*)buffers position:(long)position callback:(void(^)(long,NSError*))callback {
//    
//    @autoreleasepool {
//        long count = buffers.count;
//        int size = sizeof(ByteBuf);
//        long length = size * count;
//        const ByteBuf** buf = malloc(length);
//        for (int i = 0;i<count;i++) {
//            NSData* data = buffers[i];
//            ByteBuf item;
//            item.data = data.bytes;
//            item.len = data.length;
//            buf[size * count] = &item;
//        }
//        
//        
//        InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//            uint wrote = *(uint*)result;
//            dispatch_async(dispatch_get_main_queue(), ^{
//                if (buf) {
//                    free(buf);
//                }
//                
//                callback(wrote,nil);
//            });
//        };
//        
//        InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//            dispatch_async(dispatch_get_main_queue(), ^{
//                if (buf) {
//                    free(buf);
//                }
//                callback(0,error);
//            });
//        };
//        
//        TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//        [TNSFsCallback addCallback: cb];
//        
//        
//        native_fs_writev_sync(fd, buf, length, position);
//    }
//}
//
//
//+(void) openWithPath:(NSString*)path flag:(int)flag mode:(int)mode callback:(void(^)(TNSFileHandle*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        NSLog(@"InternalOnSuccessCallback %",result);
//        FileHandle* handle = (FileHandle*)result;
//        TNSFileHandle* tnsfh = [[TNSFileHandle alloc] initWithHandle: handle];
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(tnsfh,nil);
//        });
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        NSLog(@"InternalOnErrorCallback %s", error);
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil,error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback alloc] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_file_handle_open(path.UTF8String,flag, mode, cb.callback);
//}

@end
