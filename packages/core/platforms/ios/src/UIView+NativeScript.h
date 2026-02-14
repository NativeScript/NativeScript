//
//  UIView+NativeScript.h
//
//  Created by Nathan Walker on 2/02/2022.
#if __has_include(<UIKit/UIKit.h>)
#include <UIKit/UIKit.h>

@interface UIView (NativeScript)

- (void)nativeScriptSetTextDecorationAndTransform:(NSString*)text textDecoration:(NSString*)textDecoration letterSpacing:(CGFloat)letterSpacing lineHeight:(CGFloat)lineHeight;

-(void)nativeScriptSetFormattedTextDecorationAndTransform:(NSDictionary*)details letterSpacing:(CGFloat)letterSpacing lineHeight:(CGFloat)lineHeight;

-(void)nativeScriptSetFormattedTextStroke:(CGFloat)width color:(UIColor*)color;

@end
#endif
