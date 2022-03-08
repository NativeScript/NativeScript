//
//  TNSFileHandle.h
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFileHandle_h
#define TNSFileHandle_h
#import <Foundation/Foundation.h>
#import "nativescript_common.h"
#import "TNSHelpers.h"
#import "TNSFsCallback+Internal.h"
#import "TNSByteBufMut+Internal.h"
#import "TNSFsStat+Internal.h"
@interface TNSFileHandle : NSObject

- (id _Nonnull )addCloseListener:(id _Nonnull (^_Nonnull)(void))listener;
- (void)removeCloseListener:(id _Nonnull (^_Nonnull)(void))listener;

-(instancetype)initWithHandle:(FileHandle* _Nonnull)handle;

-(void)appendFileWithString:(nonnull NSString*)string callback:(nonnull void(^)(NSError* _Nullable))callback;
-(void)appendFileWithData:(nonnull NSData*)data callback:(nonnull void(^)(NSError* _Nullable))callback;

-(void)chmod:(uint)mode callback:(void(^_Nonnull)(NSError*_Nonnull))callback;

-(void)fchown:(uint)uid gid:(uint)gid callback:(void(^_Nonnull)(NSError*_Nullable))callback;

-(void)close:(nonnull void(^)(NSError*_Nullable))callback;

- (void)datasync:(void (^_Nonnull)(NSError * _Nullable))callback;

@property (readonly) int fd;

-(void)readWithBuffer:(nonnull NSMutableData*) buffer offset:(int)offset length:(int)length position:(int)position callback:(nonnull void(^)(long,NSMutableData* _Nullable,NSError* _Nullable))callback;

-(void)readFile:(NSString*)encoding callback:(void(^)(TNSByteBufMut*,NSError*))callback;

-(void)readv:(NSArray<NSMutableData*>*)buffer position:(long)position callback:(void(^)(long,NSError*))callback;

-(void)stat:(nonnull void(^)(TNSFsStat* _Nonnull, NSError* _Nullable))callback;

-(void)sync:(nonnull void(^)(NSError* _Nullable)) callback;

-(void)truncate:(unsigned long)length callback:(void(^)(NSError*))callback;

-(void)utimes:(long)atime mtime:(long)mtime andCallback:(nonnull void(^)(NSError* _Nullable)) callback;

-(void)writeWithData:(nonnull NSData*)data offset:(int)offset length:(int)length position:(long)position callback:(nonnull void(^)(long,NSData*,NSError* _Nullable))callback;

-(void)writeWithString:(nonnull NSString*)string encoding:(NSString*)encoding position:(long)position callback:(nonnull void(^)(long,NSString*,NSError* _Nullable))callback;

-(void)writeFileWithData:(nonnull NSData*)data callback:(nonnull void(^)(NSError* _Nullable))callback;

-(void)writeFileWithString:(nonnull NSString*)string callback:(nonnull void(^)(NSError* _Nullable))callback;

@end



#endif /* TNSFileHandle_h */
