//
//  NSString+Async.m
//  TNSWidgets
//
//  Created by Peter Staev on 5.08.19.
//  Copyright © 2019 Telerik A D. All rights reserved.
//

#import "NSString+Async.h"

@implementation NSString (Async)

+ (void)stringWithContentsOfFile:(nonnull NSString*)path
                        encoding:(NSStringEncoding)enc
                      completion:(void (^) (NSString*, NSError*))callback {
    
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.string", NULL);
    dispatch_async(asyncQueue, ^(void) {
        NSError *error = nil;
        NSString *output = [NSString stringWithContentsOfFile:path
                                                     encoding:enc
                                                        error:&error];
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(output, error);
        });
        
    });
}

- (void)writeToFile:(nonnull NSString*)path
         atomically:(BOOL)atomically
           encoding:(NSStringEncoding)enc
         completion:(void (^) (NSError*))callback {
    
    dispatch_queue_t asyncQueue = dispatch_queue_create("org.nativescript.TNSWidgets.string", NULL);
    dispatch_async(asyncQueue, ^(void) {
        NSError *error = nil;
        [self writeToFile:path
               atomically:atomically
                 encoding:enc
                    error:&error];
        
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(error);
        });
        
    });
}

@end
