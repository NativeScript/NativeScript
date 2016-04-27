//
//  UIImage+UIImage_Async.h
//  TKImageAsync
//
//  Created by Panayot Cankov on 4/18/16.
//  Copyright © 2016 Telerik A D. All rights reserved.
//



@interface UIImage (TNSBlocks)

+ (void) tns_imageNamed: (NSString*) name completion: (void (^) (UIImage*))callback;

@end
