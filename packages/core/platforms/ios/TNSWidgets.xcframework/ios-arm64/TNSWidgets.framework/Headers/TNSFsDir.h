//
//  TNSFsDir.h
//  TNSWidgets
//
//  Created by Osei Fortune on 18/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsDir_h
#define TNSFsDir_h
#import <Foundation/Foundation.h>
#import "nativescript_common.h"
#import "TNSFsDirent.h"
@interface TNSFsDir: NSObject
@property (readonly) NSString* path;
-(void)close:(void(^)(NSError*)) callback;
-(void)closeSync;

-(void)read:(void(^)(TNSFsDirent*,NSError*)) callback;
-(TNSFsDirent*)readSync;
@end
#endif /* TNSFsDir_h */
