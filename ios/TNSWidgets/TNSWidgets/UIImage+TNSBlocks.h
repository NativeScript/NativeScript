//
//  UIImage+UIImage_Async.h
//  TKImageAsync
//
//  Created by Panayot Cankov on 4/18/16.
//  Copyright © 2016 Telerik A D. All rights reserved.
//

@interface UIImage (TNSBlocks)

/**
 * Similar to imageNamed: however it runs on a separate queue so the UI thread is not blocked.
 * It also draws the UIImage in a small thumb to force decoding potentially avoiding UI hicckups when displayed.
 */
+ (void) tns_safeDecodeImageNamed: (NSString*) name completion: (void (^) (UIImage*))callback;

/**
 * Same as imageNamed, however calls to this method are sinchronized to be thread safe in iOS8 along with calls to tns_safeImageNamed and tns_safeDecodeImageNamed:completion:
 * imageNamed is thread safe in iOS 9 and later so in later versions this methods simply fallbacks to imageNamed:
 */
+ (UIImage*) tns_safeImageNamed: (NSString*) name;

@end
