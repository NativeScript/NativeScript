//
//  NSString+Async.h
//  TNSWidgets
//
//  Created by Peter Staev on 5.08.19.
//  Copyright © 2019 Telerik A D. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSString (Async)

+ (void)stringWithContentsOfFile:(nonnull NSString*)path
                        encoding:(NSStringEncoding)enc
                      completion:(void (^) (NSString*, NSError*))callback;

- (void)writeToFile:(nonnull NSString*) path
         atomically:(BOOL)atomically
           encoding:(NSStringEncoding)enc
         completion:(void (^) (NSError*))callback;
@end

NS_ASSUME_NONNULL_END
