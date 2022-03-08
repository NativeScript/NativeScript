//
//  TNSFileHandle.m
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#import "TNSFileHandle+Internal.h"
#import "TNSFileSystem.h"
@implementation TNSFileHandle

- (id)addCloseListener:(id (^)(void))listener{
    [self.closeListeners addObject:listener];
    return listener;
}

- (void)removeCloseListener:(id (^)(void))listener {
    [self.closeListeners removeObject:listener];
}


- (instancetype) initWithHandle:(FileHandle*)handle {
    if(self){
        self.handle = handle;
    }
    return self;
}

//
//- (void)appendFileWithData:(NSData *)data callback:(void (^)(NSError * _Nullable))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//        [self.closeListeners enumerateObjectsUsingBlock:^(id (^ _Nonnull obj)(void), BOOL * _Nonnull stop) {
//            obj();
//        }];
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_append_file_with_bytes(self.handle, data.bytes, data.length, cb.callback);
//}
//
//- (void)appendFileWithString:(NSString *)string callback:(void (^)(NSError * _Nullable))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//        [self.closeListeners enumerateObjectsUsingBlock:^(id (^ _Nonnull obj)(void), BOOL * _Nonnull stop) {
//            obj();
//        }];
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_append_file_with_string(self.handle, string.UTF8String, cb.callback);
//}
//
//
//-(void)chmod:(uint)mode callback:(void(^)(NSError*))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_file_handle_chmod(self.handle,mode, cb.callback);
//}
//
//
//-(void)fchown:(uint)uid gid:(uint)gid callback:(void(^)(NSError*))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_file_handle_chown(self.handle, uid, gid, cb.callback);
//}
//
//- (void)close:(void (^)(NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(nil);
//        });
//        [self.closeListeners enumerateObjectsUsingBlock:^(id (^ _Nonnull obj)(void), BOOL * _Nonnull stop) {
//            obj();
//        }];
//    };
//    
//    InternalOnErrorCallback on_error = (__bridge void*)^(NSError* error){
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(error);
//        });
//    };
//    
//    
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_close(self.handle, cb.callback);
//}
//
//- (void)datasync:(void (^)(NSError * _Nullable))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_data_sync(self.handle, cb.callback);
//}
//
//
//-(int) fd {
//    return native_file_handle_get_fd(self.handle);
//}
//
//
//- (void)readWithBuffer:(NSMutableData *)buffer offset:(int)offset length:(int)length position:(int)position callback:(void (^)(long,NSMutableData*,NSError*))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_read(self.handle, buffer.mutableBytes, buffer.length, offset, length, position, cb.callback);
//}
//
//
//-(void)readFile:(NSString*)encoding callback:(void(^)(TNSByteBufMut*,NSError*))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        ByteBufMut* buf = (ByteBufMut*)result;
//        TNSByteBufMut* buffer = [[TNSByteBufMut init] initWithByteBufMut:buf];
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_read_file(self.handle, encoding.UTF8String, cb.callback);
//}
//
//-(void)readv:(NSArray<NSMutableData*>*)buffer position:(long)position callback:(void(^)(long,NSError*))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    
//    native_file_handle_readv(self.handle, buf, length, position, cb.callback);
//}
//
//
//- (void)stat:(void (^)(TNSFsStat*, NSError *))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        TNSFsStat* stat = [[TNSFsStat init] initWithFileStat:(FileStat*)result];
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_stat(self.handle, cb.callback);
//}
//
//- (void)sync:(void (^)(NSError * _Nullable))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_sync(self.handle,cb.callback);
//}
//
//- (void)truncate:(unsigned long)length callback:(void (^)(NSError *))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_truncate(self.handle,length,cb.callback);
//}
//
//
//- (void)utimes:(long)atime mtime:(long)mtime andCallback:(void (^)(NSError * _Nullable))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_utimes(self.handle,atime, mtime, cb.callback);
//}
//
//
//- (void)writeWithData:(NSData *)data offset:(int)offset length:(int)length position:(long)position callback:(void (^)(long,NSData*,NSError * _Nullable))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        uint wrote = *(uint*)result;
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(wrote,data,nil);
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    
//    native_file_handle_write(self.handle, data.bytes, data.length, offset, length, position, cb.callback);
//}
//
//- (void)writeWithString:(NSString *)string encoding:(NSString*)encoding position:(long)position callback:(void (^)(long,NSString*,NSError * _Nullable))callback {
//    InternalOnSuccessCallback on_success = (__bridge void*)^(void* result){
//        uint wrote = *(uint*)result;
//        dispatch_async(dispatch_get_main_queue(), ^{
//            callback(wrote,string,nil);
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_write_string(self.handle, string.UTF8String, encoding.UTF8String, position, cb.callback);
//}
//
//
//- (void)writeFileWithData:(NSData *)data callback:(void (^)(NSError * _Nullable))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_write_file_with_bytes(self.handle,data.bytes, data.length, cb.callback);
//}
//
//- (void)writeFileWithString:(NSString *)string callback:(void (^)(NSError * _Nullable))callback {
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
//    TNSFsCallback *cb = [[TNSFsCallback init] initWithSuccess:on_success andErrorCallback:on_error];
//    [TNSFsCallback addCallback: cb];
//    native_file_handle_write_file_with_string(self.handle,string.UTF8String, cb.callback);
//}
//

@end
