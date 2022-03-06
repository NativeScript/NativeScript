//
//  TNSFileHandle+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 23/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFileHandle_Internal_h
#define TNSFileHandle_Internal_h
#import "TNSFileHandle.h"
@interface TNSFileHandle()
@property FileHandle* handle;
@property NSMutableSet<id(^)(void)>* closeListeners;
@end

#endif /* TNSFileHandle_Internal_h */
