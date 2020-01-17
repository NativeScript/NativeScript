//
//  NSData+Async.m
//  TNSWidgets
//
//  Created by Peter Staev on 7.08.19.
//  Copyright © 2019 Telerik A D. All rights reserved.
//

#import "NSData+Async.h"

@implementation NSData (Async)

+ (void)dataWithContentsOfFile:(nonnull NSString*)path
                    completion:(void (^) (NSData*))callback {
    
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.data", NULL);
    dispatch_async(asyncQueue, ^(void) {
        NSData *output = [NSData dataWithContentsOfFile:path];
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(output);
        });
        
    });
}

- (void)writeToFile:(nonnull NSString*) path
         atomically:(BOOL)atomically
         completion:(void (^) ())callback {
    
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.data", NULL);
    dispatch_async(asyncQueue, ^(void) {
        [self writeToFile:path
               atomically:atomically];
        
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback();
        });
        
    });
}

@end
