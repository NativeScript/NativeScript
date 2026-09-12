//
//  NSData+Async.h
//  TNSWidgets
//
//  Created by Peter Staev on 7.08.19.
//  Copyright © 2019 Telerik A D. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSData (Async)

+ (void)dataWithContentsOfFile:(nonnull NSString*)path
                    completion:(void (^) (NSData*))callback;

- (void)writeToFile:(nonnull NSString*) path
         atomically:(BOOL)atomically
         completion:(void (^) (void))callback;

@end

NS_ASSUME_NONNULL_END
