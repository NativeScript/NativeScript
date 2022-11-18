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

+ (void) initialize {
    image_queue = dispatch_queue_create("org.nativescript.TNSWidgets.image", NULL);
}

- (void) tns_forceDecode {
    @autoreleasepool {
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGContextRef context = CGBitmapContextCreate(NULL, 1, 1, 8, 0, colorSpace, kCGImageAlphaPremultipliedFirst);
        CGContextDrawImage(context, CGRectMake(0, 0, 1, 1), [self CGImage]);
        CGContextRelease(context);
        CGColorSpaceRelease(colorSpace);
    }
}

+ (void) tns_safeDecodeImageNamed: (NSString*) name completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void){
        @autoreleasepool {
            UIImage* image = [UIImage imageNamed: name];
            [image tns_forceDecode];
            
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                callback(image);
            });
        }
    });
}

+ (UIImage*) tns_safeImageNamed: (NSString*) name {
    UIImage* image;
    @autoreleasepool {
        image = [UIImage imageNamed: name];
    }
    return image;
}

+ (void) tns_decodeImageWithData: (NSData*) data completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void) {
        @autoreleasepool {
            UIImage* image = [UIImage imageWithData: data];
            [image tns_forceDecode];
            
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                callback(image);
            });
        }
    });
}

+ (void) tns_decodeImageWidthContentsOfFile: (NSString*) file completion: (void (^) (UIImage*))callback {
    dispatch_async(image_queue, ^(void) {
        @autoreleasepool {
            UIImage* image = [UIImage imageWithContentsOfFile: file];
            [image tns_forceDecode];
            
            dispatch_async(dispatch_get_main_queue(), ^(void) {
                callback(image);
            });
        }
    });
}

@end
