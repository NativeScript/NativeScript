//
//  UIImage+UIImage_Async.m
//  TKImageAsync
//
//  Created by Panayot Cankov on 4/18/16.
//  Copyright © 2016 Telerik A D. All rights reserved.
//
#import <UIKit/UIKit.h>
#import "UIImage+TNSBlocks.h"

@implementation UIImage (TNSBlocks)

static dispatch_queue_t image_queue;
+ (void) initialize {
    image_queue = dispatch_queue_create("org.nativescript.TNSWidgets.image", NULL);
}

- (void) tns_decompressImage {
    CGImageRef cgImg = [self CGImage];
    // TODO: Do performance tests if actual drawing is necessary

    // UIGraphicsBeginImageContext(CGSizeMake(1, 1));
    // [self drawAtPoint:CGPointZero];
    // UIGraphicsEndImageContext();
}

+ (void) tns_imageNamed: (NSString*) name completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void){
        UIImage* image = [UIImage imageNamed: name];
        [image tns_decompressImage];
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(image);
        });
    });
}

@end
