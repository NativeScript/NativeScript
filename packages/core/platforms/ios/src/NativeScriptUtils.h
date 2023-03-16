//
//  NativeScriptUtils.h
//
//  Created by Nathan Walker on 2/02/2022.
#include <UIKit/UIKit.h>

@interface NativeScriptUtils : NSObject

+(UIFont*) getSystemFont:(CGFloat)size weight:(UIFontWeight)weight italic:(BOOL)italic symbolicTraits:(UIFontDescriptorSymbolicTraits)symbolicTraits;
+(UIFont*) createUIFont:(NSDictionary*)font;
+(NSMutableAttributedString*)createMutableStringWithDetails:(NSDictionary*)details;
+(NSMutableAttributedString*)createMutableStringForSpan:(NSString*)text font:(UIFont*)font color:(UIColor*)color backgroundColor:(UIColor*)backgroundColor textDecoration:(NSString*)textDecoration baselineOffset:(CGFloat)baselineOffset;
+(UIImage*)scaleImage:(UIImage*)image width:(CGFloat)width height:(CGFloat)height scaleFactor:(CGFloat)scaleFactor;
+(NSData*)getImageData:(UIImage*)image format:(NSString*)format quality:(CGFloat)quality;

@end
