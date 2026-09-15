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

// ImageSource helpers. All sizes are pixels; every method returns a NEW image with
// orientation baked in (imageOrientation == Up, scale == 1) and never mutates its input.
+(UIGraphicsImageRendererFormat*)rendererFormatWithScale:(CGFloat)scale opaque:(BOOL)opaque;
+(CGSize)pixelSize:(UIImage*)image;
+(UIImage*)decodeImageAtPath:(NSString*)path maxSize:(CGFloat)maxSize;
+(void)decodeImageAtPath:(NSString*)path maxSize:(CGFloat)maxSize completion:(void (^)(UIImage*))completion;
+(UIImage*)decodeImageWithData:(NSData*)data maxSize:(CGFloat)maxSize;
+(void)decodeImageWithData:(NSData*)data maxSize:(CGFloat)maxSize completion:(void (^)(UIImage*))completion;
+(NSDictionary*)imageMetadataAtPath:(NSString*)path;
+(void)getImageData:(UIImage*)image format:(NSString*)format quality:(CGFloat)quality completion:(void (^)(NSData*))completion;
+(NSDictionary*)compressImage:(UIImage*)image toFit:(NSUInteger)maxBytes format:(NSString*)format;
+(void)compressImage:(UIImage*)image toFit:(NSUInteger)maxBytes format:(NSString*)format completion:(void (^)(NSDictionary*))completion;
+(BOOL)saveImage:(UIImage*)image toPath:(NSString*)path format:(NSString*)format quality:(CGFloat)quality;
+(void)saveImage:(UIImage*)image toPath:(NSString*)path format:(NSString*)format quality:(CGFloat)quality completion:(void (^)(BOOL))completion;
+(UIImage*)normalizeOrientation:(UIImage*)image;
+(UIImage*)resizeImage:(UIImage*)image maxSize:(CGFloat)maxSize opaque:(BOOL)opaque;
+(void)resizeImage:(UIImage*)image maxSize:(CGFloat)maxSize opaque:(BOOL)opaque completion:(void (^)(UIImage*))completion;
+(UIImage*)resizeImage:(UIImage*)image width:(CGFloat)width height:(CGFloat)height mode:(NSString*)mode background:(UIColor*)background;
+(UIImage*)cropImage:(UIImage*)image x:(CGFloat)x y:(CGFloat)y width:(CGFloat)width height:(CGFloat)height;
+(UIImage*)rotateImage:(UIImage*)image degrees:(CGFloat)degrees;
+(UIImage*)flipImage:(UIImage*)image horizontal:(BOOL)horizontal vertical:(BOOL)vertical;
+(UIImage*)transformImage:(UIImage*)image options:(NSDictionary*)options;
+(void)transformImage:(UIImage*)image options:(NSDictionary*)options completion:(void (^)(UIImage*))completion;
+(UIImage*)roundCorners:(UIImage*)image radius:(CGFloat)radius;
+(UIImage*)overlayImage:(UIImage*)base with:(UIImage*)other x:(CGFloat)x y:(CGFloat)y opacity:(CGFloat)opacity;
+(UIImage*)drawText:(NSString*)text onImage:(UIImage*)image x:(CGFloat)x y:(CGFloat)y font:(UIFont*)font color:(UIColor*)color;
+(UIImage*)tintImage:(UIImage*)image color:(UIColor*)color;
+(UIImage*)snapshotView:(UIView*)view scale:(CGFloat)scale;
+(UIImage*)applyFilters:(UIImage*)image filters:(NSArray<NSDictionary*>*)filters;
+(void)applyFilters:(UIImage*)image filters:(NSArray<NSDictionary*>*)filters completion:(void (^)(UIImage*))completion;
+(UIColor*)averageColor:(UIImage*)image;
+(NSArray<UIColor*>*)dominantColors:(UIImage*)image count:(NSInteger)count;
+(NSString*)perceptualHash:(UIImage*)image;
+(NSInteger)hammingDistance:(NSString*)a to:(NSString*)b;

@end
