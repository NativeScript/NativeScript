//
//  TNSHelpers.h
//  TNSWidgets
//
//  Created by Osei Fortune on 10/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSHelpers_h
#define TNSHelpers_h
#import <Foundation/Foundation.h>
#import "nativescript_common.h"
@interface TNSHelpers: NSObject
+(NSError*)toError:(NSException*)exception;
+(NSError*)fromRustErrorChar:(char*) error;
@end

#endif /* TNSHelpers_h */
