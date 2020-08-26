//
//  UIImage+UIImage_Async.m
//  TKImageAsync
//
//  Created by Panayot Cankov on 4/18/16.
//  Copyright © 2016 Telerik A D. All rights reserved.
//
#import <UIKit/UIKit.h>
#import <CoreGraphics/CoreGraphics.h>
#import "UIImage+TNSBlocks.h"

@implementation UIImage (TNSBlocks)

static dispatch_queue_t image_queue;
static NSLock* image_lock_handle;

+ (void) initialize {
    image_queue = dispatch_queue_create("org.nativescript.TNSWidgets.image", NULL);
    if ([[NSProcessInfo processInfo] operatingSystemVersion].majorVersion >= 9) {
        // UIImage imageNamed: is said to be thread safe, in iOS9 and later, in offical Apple reference.
        image_lock_handle = nil;
    } else {
        image_lock_handle = [NSLock new];
    }
}

- (void) tns_forceDecode {
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(NULL, 1, 1, 8, 0, colorSpace, kCGImageAlphaPremultipliedFirst);
    CGContextDrawImage(context, CGRectMake(0, 0, 1, 1), [self CGImage]);
    CGContextRelease(context);
    CGColorSpaceRelease(colorSpace);
}

+ (void) tns_safeDecodeImageNamed: (NSString*) name completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void){
        [image_lock_handle lock];
        UIImage* image = [UIImage imageNamed: name];
        [image_lock_handle unlock];
        [image tns_forceDecode];

        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(image);
        });
    });
}

+ (UIImage*) tns_safeImageNamed: (NSString*) name {
    [image_lock_handle lock];
    UIImage* image = [UIImage imageNamed: name];
    [image_lock_handle unlock];
    return image;
}

+ (void) tns_decodeImageWithData: (NSData*) data completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void) {
        UIImage* image = [UIImage imageWithData: data];
        [image tns_forceDecode];

        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(image);
        });
    });
}

+ (void) tns_decodeImageWidthContentsOfFile: (NSString*) file completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void) {
        UIImage* image = [UIImage imageWithContentsOfFile: file];
        [image tns_forceDecode];

        dispatch_async(dispatch_get_main_queue(), ^(void) {
            callback(image);
        });
    });
}

@end
