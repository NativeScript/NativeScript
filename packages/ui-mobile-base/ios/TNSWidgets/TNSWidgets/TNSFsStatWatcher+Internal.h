//
//  TNSFsStatWatcher+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 21/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsStatWatcher_Internal_h
#define TNSFsStatWatcher_Internal_h
#import "TNSFsStatWatcher.h"
#import "TNSFsCallback+Internal.h"

@interface TNSFsStatWatcher()
@property TNSFsCallback* callback;
@property NSString* filename;
-(instancetype)initWithCallback:(TNSFsCallback*)callback;
@end

#endif /* TNSFsStatWatcher_Internal_h */
