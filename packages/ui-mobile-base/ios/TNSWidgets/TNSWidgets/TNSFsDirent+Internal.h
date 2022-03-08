//
//  TNSFsDirent+Internal.h
//  TNSWidgets
//
//  Created by Osei Fortune on 20/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsDirent_Internal_h
#define TNSFsDirent_Internal_h
#import "TNSFsDirent.h"
#import "nativescript_common.h"
@interface TNSFsDirent()
@property FileDirent* dirent;
-(instancetype)initWithDirent:(FileDirent*)dirent;
@end

#endif /* TNSFsDirent_Internal_h */
