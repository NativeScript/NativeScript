//
//  TNSFsCallback+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsCallback_Internal_h
#define TNSFsCallback_Internal_h
#import "nativescript_common.h"
#import "TNSFsCallback.h"

typedef void (*InternalOnSuccessCallback)(void *result);

typedef void (*InternalOnErrorCallback)(NSError *error);


@interface TNSFsCallback()
@property BOOL autoClear;
@property const AsyncCallback* callback;


-(instancetype)initWithSuccess:(InternalOnSuccessCallback)success andErrorCallback:(InternalOnErrorCallback)error;
+(NSMutableSet*)callbackStore;
+(void)addCallback:(TNSFsCallback*)callback;
+(void)removeCallback:(TNSFsCallback*)callback;

@end

#endif /* TNSFsCallback_Internal_h */
