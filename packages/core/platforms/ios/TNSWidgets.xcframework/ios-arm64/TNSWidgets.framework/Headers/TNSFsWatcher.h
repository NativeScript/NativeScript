//
//  TNSFsWatcher.h
//  TNSWidgets
//
//  Created by Osei Fortune on 21/02/2022.
//  Copyright © 2022 Telerik A D. All rights reserved.
//

#ifndef TNSFsWatcher_h
#define TNSFsWatcher_h
#import <Foundation/Foundation.h>
@interface TNSFsWatcher: NSObject
-(id)addChangeListener:(id(^)(NSString*,NSString*))listener;
-(void)removeChangeListener:(id(^)(NSString*,NSString*))listener;

-(id)addCloseListener:(id(^)(void))listener;
-(void)removeCloseListener:(id(^)(void))listener;


-(id)addErrorListener:(id(^)(NSError*))listener;
-(void)removeErrorListener:(id(^)(NSError*))listener;

-(void)close;
-(void)ref;
-(void)unref;

@end

#endif /* TNSFsWatcher_h */
