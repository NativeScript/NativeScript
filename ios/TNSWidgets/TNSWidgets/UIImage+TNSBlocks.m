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

static NSLock* image_lock_handle;
static dispatch_queue_t image_queue;

void image_lock() {
    if (image_lock_handle) {
        [image_lock_handle lock];
    }
}

void image_unlock() {
    if (image_lock_handle) {
        [image_lock_handle unlock];
    }
}

+ (void) initialize {
    image_queue = dispatch_queue_create("org.nativescript.TNSWidgets.image", NULL);
    if ([[NSProcessInfo processInfo] operatingSystemVersion].majorVersion >= 9) {
        // UIImage imageNamed: is said to be thread safe, in iOS9 and later, in offical Apple reference.
        image_lock_handle = nil;
    } else {
        image_lock_handle = [NSLock new];
    }
}

- (void) tns_decompressImage {
    UIGraphicsBeginImageContext(CGSizeMake(1, 1));
    [self drawAtPoint:CGPointZero];
    UIGraphicsEndImageContext();
}

+ (void) tns_safeDecodeImageNamed: (NSString*) name completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void){
        image_lock();
        UIImage* image = [UIImage imageNamed: name];
        if (image) {
            [image tns_decompressImage];
        }
        image_unlock();
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(image);
        });
    });
}

+ (UIImage*) tns_safeImageNamed: (NSString*) name {
    image_lock();
    UIImage* image = [UIImage imageNamed: name];
    image_unlock();
    return image;
}

@end
