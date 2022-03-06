//
//  TNSFsWatcher+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 21/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsWatcher_Internal_h
#define TNSFsWatcher_Internal_h
#import "TNSFsWatcher.h"
#import "TNSFsCallback+Internal.h"

@interface TNSFsWatcher()
@property NSString* filename;
@property TNSFsCallback* callback;
@property NSMutableSet<id(^)(NSString *,NSString *)>* changeListeners;
@property NSMutableSet<id(^)(void)>* closeListeners;
@property NSMutableSet<id(^)(NSError*)>* errorListeners;
-(instancetype)initWithFilename:(NSString*)filename callback:(TNSFsCallback*)callback;
@end

#endif /* TNSFsWatcher_Internal_h */
