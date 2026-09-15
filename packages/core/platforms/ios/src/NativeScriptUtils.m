#import "NativeScriptUtils.h"
#import <CoreImage/CoreImage.h>
#import <ImageIO/ImageIO.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

@implementation NativeScriptUtils

+(UIFont*) getSystemFont:(CGFloat)size weight:(UIFontWeight)weight italic:(BOOL)italic symbolicTraits:(UIFontDescriptorSymbolicTraits)symbolicTraits {
    UIFont *result = [UIFont systemFontOfSize:size weight:weight];
    if (italic) {
        result = [UIFont fontWithDescriptor:[result.fontDescriptor fontDescriptorWithSymbolicTraits:symbolicTraits] size:size];
    }

    return result;
}
+(UIFont*) createUIFont:(NSDictionary*)font {
    UIFont *result;

    CGFloat size = [[font valueForKey:@"fontSize"] floatValue];

    UIFontDescriptorSymbolicTraits symbolicTraits = 0;
    if ([[font valueForKey:@"isBold"] boolValue]) {
        symbolicTraits = symbolicTraits | UIFontDescriptorTraitBold;
    }
    if ([[font valueForKey:@"isItalic"] boolValue]) {
        symbolicTraits = symbolicTraits | UIFontDescriptorTraitItalic;
    }

    NSDictionary *fontDescriptorTraits = @{
        UIFontSymbolicTrait : @(symbolicTraits),
        UIFontWeightTrait : [font valueForKey:@"fontWeight"]
    };

    for (NSString *family in [NSArray arrayWithArray:[font valueForKey:@"fontFamily"]]) {
        NSString *fontFamily = family;
        if ([family.lowercaseString isEqualToString:@"serif"]) {
            fontFamily = @"Times New Roman";
        } else if ([family.lowercaseString isEqualToString:@"monospace"]) {
            fontFamily = @"Courier New";
        }

        if (!fontFamily || [fontFamily isEqualToString:@"sans-serif"] || [fontFamily isEqualToString:@"system"]) {
            result = [NativeScriptUtils getSystemFont:size weight:(UIFontWeight)[[font valueForKey:@"fontWeight"] floatValue] italic:[[font valueForKey:@"isItalic"] boolValue] symbolicTraits:symbolicTraits];
            break;
        } else {
            UIFontDescriptor *descriptor = [UIFontDescriptor fontDescriptorWithFontAttributes:@{
                UIFontDescriptorFamilyAttribute: fontFamily,
                UIFontDescriptorTraitsAttribute: fontDescriptorTraits
            }];

            result = [UIFont fontWithDescriptor:descriptor size:size];

            BOOL actualItalic = result.fontDescriptor.symbolicTraits & UIFontDescriptorTraitItalic;
            if ([[font valueForKey:@"isItalic"] boolValue] && !actualItalic) {
                #if TARGET_OS_MACCATALYST
                #else
                // The font we got is not actually italic so emulate that with a matrix
                result = [UIFont fontWithDescriptor:[descriptor fontDescriptorWithMatrix:CGAffineTransformMake(1, 0, 0.2, 1, 0, 0)] size:size];
                #endif
            }

            // Check if the resolved font has the correct font-family
            // If not - fallback to the next font-family
            if ([result.familyName isEqualToString:fontFamily]) {
                break;
            } else {
                result = nil;
            }
        }
    }

    // Couldn't resolve font - fallback to the system font
    if (result == nil) {
        result = [NativeScriptUtils getSystemFont:size weight:(UIFontWeight)[[font valueForKey:@"fontWeight"] floatValue] italic:[[font valueForKey:@"isItalic"] boolValue] symbolicTraits:symbolicTraits];
    }

    return result;
}

+(NSMutableAttributedString*)createMutableStringWithDetails:(NSDictionary*)details {
    NSMutableAttributedString *mas = [[NSMutableAttributedString alloc] init];
    for (NSDictionary *detail in [NSArray arrayWithArray:[details valueForKey:@"spans"]]) {
        NSMutableAttributedString *attrString = [NativeScriptUtils createMutableStringForSpan:[detail objectForKey:@"text"] font:[detail objectForKey:@"iosFont"] color:[detail objectForKey:@"color"] backgroundColor:[detail objectForKey:@"backgroundColor"] textDecoration:[detail objectForKey:@"textDecoration"] baselineOffset:[[detail valueForKey:@"baselineOffset"] floatValue]];
        [mas insertAttributedString:attrString atIndex:[[detail valueForKey:@"index"] intValue]];
    }
    return mas;
}

+(NSMutableAttributedString*)createMutableStringForSpan:(NSString*)text font:(UIFont*)font color:(UIColor*)color backgroundColor:(UIColor*)backgroundColor textDecoration:(NSString*)textDecoration baselineOffset:(CGFloat)baselineOffset {
    NSMutableDictionary *attrDict = [[NSMutableDictionary alloc] init];
    attrDict[NSFontAttributeName] = font;

    if (color != nil) {
        attrDict[NSForegroundColorAttributeName] = color;
    }

    if (backgroundColor != nil) {
        attrDict[NSBackgroundColorAttributeName] = backgroundColor;
    }

    if (textDecoration != nil) {
        if ([textDecoration rangeOfString:@"underline"].location != NSNotFound) {
            attrDict[NSUnderlineStyleAttributeName] = [NSNumber numberWithInt:NSUnderlineStyleSingle];
        }

        if ([textDecoration rangeOfString:@"line-through"].location != NSNotFound) {
            attrDict[NSStrikethroughStyleAttributeName] = [NSNumber numberWithInt:NSUnderlineStyleSingle];
        }
    }

    attrDict[NSBaselineOffsetAttributeName] = [NSNumber numberWithInt:baselineOffset];

    return [[NSMutableAttributedString alloc] initWithString:text attributes:attrDict];

}

+(UIGraphicsImageRendererFormat*)rendererFormatWithScale:(CGFloat)scale opaque:(BOOL)opaque {
    UIGraphicsImageRendererFormat *format = [UIGraphicsImageRendererFormat defaultFormat];
    // scale 0 keeps UIKit's "screen scale" behaviour that ImageAsset relies on.
    format.scale = scale > 0 ? scale : [UIScreen mainScreen].scale;
    format.opaque = opaque;
    // Wide-gamut (P3/HEIC) sources rendered in extended range produce images that
    // fail to JPEG round-trip; standard range gives a plain 8-bit sRGB bitmap.
    format.preferredRange = UIGraphicsImageRendererFormatRangeStandard;
    return format;
}

+(UIImage*)scaleImage:(UIImage*)image width:(CGFloat)width height:(CGFloat)height scaleFactor:(CGFloat)scaleFactor {
    if (image == nil || width <= 0 || height <= 0) {
        return nil;
    }
    UIImage *resultImage;
    @autoreleasepool {
        UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:CGSizeMake(width, height) format:[self rendererFormatWithScale:scaleFactor opaque:NO]];
        resultImage = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull ctx) {
            [image drawInRect:CGRectMake(0, 0, width, height)];
        }];
    }
    return resultImage;
}

+(NSData*)getImageData:(UIImage*)image format:(NSString*)format quality:(CGFloat)quality {
    NSData *data;
    @autoreleasepool {
        if ([format.lowercaseString isEqualToString:@"png"]) {
            data = UIImagePNGRepresentation(image);
        } else {
            data = UIImageJPEGRepresentation(image, quality);
        }
    }
    return data;
}

#pragma mark - ImageSource helpers

static CGSize NSImagePixelSize(UIImage *image) {
    // size is in points and already accounts for imageOrientation; scale converts to pixels.
    return CGSizeMake(round(image.size.width * image.scale), round(image.size.height * image.scale));
}

static UIImage* NSRenderImage(CGSize pixelSize, BOOL opaque, void (^actions)(CGContextRef ctx, CGSize size)) {
    if (pixelSize.width < 1 || pixelSize.height < 1) {
        return nil;
    }

    UIImage *result;
    @autoreleasepool {
        UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:pixelSize format:[NativeScriptUtils rendererFormatWithScale:1 opaque:opaque]];
        result = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull ctx) {
            actions(ctx.CGContext, pixelSize);
        }];
    }

    return result;
}

static CGSize NSFitSize(CGSize source, CGFloat maxSize) {
    CGFloat w = source.width;
    CGFloat h = source.height;
    if (h >= w) {
        if (h <= maxSize) {
            return source;
        }

        return CGSizeMake(MAX(1, round(maxSize * w / h)), maxSize);
    }

    if (w <= maxSize) {
        return source;
    }

    return CGSizeMake(maxSize, MAX(1, round(maxSize * h / w)));
}

+(CGSize)pixelSize:(UIImage*)image {
    if (image == nil) {
        return CGSizeZero;
    }

    return NSImagePixelSize(image);
}

+(UIImage*)decodeImageAtPath:(NSString*)path maxSize:(CGFloat)maxSize {
    NSURL *url = [NSURL fileURLWithPath:path];
    CGImageSourceRef source = CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
    if (source == NULL) {
        return nil;
    }

    UIImage *result = nil;
    @autoreleasepool {
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        options[(id)kCGImageSourceCreateThumbnailFromImageAlways] = @YES;
        options[(id)kCGImageSourceCreateThumbnailWithTransform] = @YES; // bakes EXIF orientation
        options[(id)kCGImageSourceShouldCacheImmediately] = @YES;
        if (maxSize > 0) {
            options[(id)kCGImageSourceThumbnailMaxPixelSize] = @(maxSize);
        } else {
            // No limit: ask for the full pixel size so we still get an oriented, decoded bitmap.
            NSDictionary *props = (__bridge_transfer NSDictionary*)CGImageSourceCopyPropertiesAtIndex(source, 0, NULL);
            NSNumber *w = props[(id)kCGImagePropertyPixelWidth];
            NSNumber *h = props[(id)kCGImagePropertyPixelHeight];
            CGFloat longest = MAX(w.doubleValue, h.doubleValue);
            if (longest > 0) {
                options[(id)kCGImageSourceThumbnailMaxPixelSize] = @(longest);
            }
        }

        CGImageRef cg = CGImageSourceCreateThumbnailAtIndex(source, 0, (__bridge CFDictionaryRef)options);
        if (cg != NULL) {
            result = [UIImage imageWithCGImage:cg scale:1 orientation:UIImageOrientationUp];
            CGImageRelease(cg);
        }
    }

    CFRelease(source);
    return result;
}

+(void)decodeImageAtPath:(NSString*)path maxSize:(CGFloat)maxSize completion:(void (^)(UIImage*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        UIImage *image = [self decodeImageAtPath:path maxSize:maxSize];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(image);
        });
    });
}

+(UIImage*)decodeImageWithData:(NSData*)data maxSize:(CGFloat)maxSize {
    if (data == nil || data.length == 0) {
        return nil;
    }

    CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
    if (source == NULL) {
        return nil;
    }

    UIImage *result = nil;
    @autoreleasepool {
        NSMutableDictionary *options = [NSMutableDictionary dictionary];
        options[(id)kCGImageSourceCreateThumbnailFromImageAlways] = @YES;
        options[(id)kCGImageSourceCreateThumbnailWithTransform] = @YES;
        options[(id)kCGImageSourceShouldCacheImmediately] = @YES;
        if (maxSize > 0) {
            options[(id)kCGImageSourceThumbnailMaxPixelSize] = @(maxSize);
        } else {
            NSDictionary *props = (__bridge_transfer NSDictionary*)CGImageSourceCopyPropertiesAtIndex(source, 0, NULL);
            CGFloat longest = MAX([props[(id)kCGImagePropertyPixelWidth] doubleValue], [props[(id)kCGImagePropertyPixelHeight] doubleValue]);
            if (longest > 0) {
                options[(id)kCGImageSourceThumbnailMaxPixelSize] = @(longest);
            }
        }

        CGImageRef cg = CGImageSourceCreateThumbnailAtIndex(source, 0, (__bridge CFDictionaryRef)options);
        if (cg != NULL) {
            result = [UIImage imageWithCGImage:cg scale:1 orientation:UIImageOrientationUp];
            CGImageRelease(cg);
        }
    }

    CFRelease(source);
    return result;
}

+(void)decodeImageWithData:(NSData*)data maxSize:(CGFloat)maxSize completion:(void (^)(UIImage*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        UIImage *image = [self decodeImageWithData:data maxSize:maxSize];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(image);
        });
    });
}

+(NSDictionary*)imageMetadataAtPath:(NSString*)path {
    NSURL *url = [NSURL fileURLWithPath:path];
    CGImageSourceRef source = CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
    if (source == NULL) {
        return nil;
    }

    NSDictionary *props = (__bridge_transfer NSDictionary*)CGImageSourceCopyPropertiesAtIndex(source, 0, NULL);
    CFStringRef uti = CGImageSourceGetType(source);
    CFRelease(source);
    if (props == nil) {
        return nil;
    }

    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    NSInteger orientation = [props[(id)kCGImagePropertyOrientation] integerValue];
    if (orientation < 1 || orientation > 8) {
        orientation = 1;
    }

    NSInteger width = [props[(id)kCGImagePropertyPixelWidth] integerValue];
    NSInteger height = [props[(id)kCGImagePropertyPixelHeight] integerValue];
    if (orientation >= 5) { // 5-8 are the transposed orientations
        NSInteger tmp = width;
        width = height;
        height = tmp;
    }

    result[@"width"] = @(width);
    result[@"height"] = @(height);
    result[@"orientation"] = @(orientation);
    result[@"hasAlpha"] = @([props[(id)kCGImagePropertyHasAlpha] boolValue]);
    if (props[(id)kCGImagePropertyProfileName]) {
        result[@"colorSpace"] = props[(id)kCGImagePropertyProfileName];
    }

    if (props[(id)kCGImagePropertyDPIWidth]) {
        result[@"dpi"] = props[(id)kCGImagePropertyDPIWidth];
    }

    if (uti != NULL) {
        UTType *type = [UTType typeWithIdentifier:(__bridge NSString*)uti];
        if (type.preferredMIMEType) {
            result[@"mimeType"] = type.preferredMIMEType;
        }
    }

    NSDictionary *exif = props[(id)kCGImagePropertyExifDictionary];
    NSString *date = exif[(id)kCGImagePropertyExifDateTimeOriginal];
    if (date == nil) {
        date = props[(id)kCGImagePropertyTIFFDictionary][(id)kCGImagePropertyTIFFDateTime];
    }

    if (date != nil) {
        NSDateFormatter *fmt = [[NSDateFormatter alloc] init];
        fmt.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
        fmt.dateFormat = @"yyyy:MM:dd HH:mm:ss";
        NSDate *parsed = [fmt dateFromString:date];
        if (parsed) {
            result[@"dateTaken"] = @(parsed.timeIntervalSince1970 * 1000.0);
        }
    }

    NSDictionary *gps = props[(id)kCGImagePropertyGPSDictionary];
    if (gps[(id)kCGImagePropertyGPSLatitude] && gps[(id)kCGImagePropertyGPSLongitude]) {
        double lat = [gps[(id)kCGImagePropertyGPSLatitude] doubleValue];
        double lon = [gps[(id)kCGImagePropertyGPSLongitude] doubleValue];
        if ([gps[(id)kCGImagePropertyGPSLatitudeRef] isEqualToString:@"S"]) {
            lat = -lat;
        }

        if ([gps[(id)kCGImagePropertyGPSLongitudeRef] isEqualToString:@"W"]) {
            lon = -lon;
        }

        result[@"gps"] = @{ @"latitude": @(lat), @"longitude": @(lon) };
    }

    return result;
}

+(void)getImageData:(UIImage*)image format:(NSString*)format quality:(CGFloat)quality completion:(void (^)(NSData*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        NSData *data = [self getImageData:image format:format quality:quality];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(data);
        });
    });
}

+(NSDictionary*)compressImage:(UIImage*)image toFit:(NSUInteger)maxBytes format:(NSString*)format {
    if (image == nil) {
        return nil;
    }

    if ([format.lowercaseString isEqualToString:@"png"]) {
        NSData *png = [self getImageData:image format:format quality:1];
        if (png == nil || png.length > maxBytes) {
            return nil;
        }

        return @{ @"data": png, @"quality": @100 };
    }

    NSInteger lo = 1;
    NSInteger hi = 100;
    NSData *best = nil;
    NSInteger bestQuality = -1;
    while (lo <= hi) {
        NSInteger mid = (lo + hi) / 2;
        NSData *candidate = [self getImageData:image format:format quality:mid / 100.0];
        if (candidate == nil) {
            return nil;
        }

        if (candidate.length <= maxBytes) {
            best = candidate;
            bestQuality = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    // Even quality 1 is over budget: the caller has to shrink the image first.
    return best ? @{ @"data": best, @"quality": @(bestQuality) } : nil;
}

+(void)compressImage:(UIImage*)image toFit:(NSUInteger)maxBytes format:(NSString*)format completion:(void (^)(NSDictionary*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        NSDictionary *result = [self compressImage:image toFit:maxBytes format:format];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(result);
        });
    });
}

+(BOOL)saveImage:(UIImage*)image toPath:(NSString*)path format:(NSString*)format quality:(CGFloat)quality {
    NSData *data = [self getImageData:image format:format quality:quality];
    if (data == nil) {
        return NO;
    }

    return [data writeToFile:path atomically:YES];
}

+(void)saveImage:(UIImage*)image toPath:(NSString*)path format:(NSString*)format quality:(CGFloat)quality completion:(void (^)(BOOL))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        BOOL ok = [self saveImage:image toPath:path format:format quality:quality];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(ok);
        });
    });
}

+(UIImage*)normalizeOrientation:(UIImage*)image {
    if (image == nil) {
        return nil;
    }

    if (image.imageOrientation == UIImageOrientationUp && image.scale == 1 && image.CGImage != NULL) {
        return image;
    }

    CGSize size = NSImagePixelSize(image);
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        [image drawInRect:CGRectMake(0, 0, s.width, s.height)];
    });
}

+(UIImage*)resizeImage:(UIImage*)image maxSize:(CGFloat)maxSize opaque:(BOOL)opaque {
    if (image == nil) {
        return nil;
    }

    if (maxSize <= 0) {
        return nil;
    }

    CGSize source = NSImagePixelSize(image);
    CGSize target = NSFitSize(source, maxSize);
    return NSRenderImage(target, opaque, ^(CGContextRef ctx, CGSize s) {
        CGContextSetInterpolationQuality(ctx, kCGInterpolationHigh);
        [image drawInRect:CGRectMake(0, 0, s.width, s.height)];
    });
}

+(void)resizeImage:(UIImage*)image maxSize:(CGFloat)maxSize opaque:(BOOL)opaque completion:(void (^)(UIImage*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        UIImage *result = [self resizeImage:image maxSize:maxSize opaque:opaque];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(result);
        });
    });
}

+(UIImage*)resizeImage:(UIImage*)image width:(CGFloat)width height:(CGFloat)height mode:(NSString*)mode background:(UIColor*)background {
    if (image == nil || width <= 0 || height <= 0) {
        return nil;
    }

    CGSize source = NSImagePixelSize(image);
    BOOL opaque = background != nil && CGColorGetAlpha(background.CGColor) >= 1;
    return NSRenderImage(CGSizeMake(width, height), opaque, ^(CGContextRef ctx, CGSize s) {
        if (background != nil) {
            [background setFill];
            CGContextFillRect(ctx, CGRectMake(0, 0, s.width, s.height));
        }

        CGContextSetInterpolationQuality(ctx, kCGInterpolationHigh);
        CGRect dest;
        if ([mode isEqualToString:@"stretch"]) {
            dest = CGRectMake(0, 0, s.width, s.height);
        } else {
            BOOL fill = [mode isEqualToString:@"fill"];
            CGFloat scale = fill ? MAX(s.width / source.width, s.height / source.height) : MIN(s.width / source.width, s.height / source.height);
            CGFloat dw = source.width * scale;
            CGFloat dh = source.height * scale;
            dest = CGRectMake((s.width - dw) / 2, (s.height - dh) / 2, dw, dh);
        }

        [image drawInRect:dest];
    });
}

+(UIImage*)cropImage:(UIImage*)image x:(CGFloat)x y:(CGFloat)y width:(CGFloat)width height:(CGFloat)height {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > size.width || y + height > size.height) {
        return nil;
    }

    return NSRenderImage(CGSizeMake(width, height), NO, ^(CGContextRef ctx, CGSize s) {
        [image drawInRect:CGRectMake(-x, -y, size.width, size.height)];
    });
}

+(UIImage*)rotateImage:(UIImage*)image degrees:(CGFloat)degrees {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    CGFloat radians = degrees * M_PI / 180.0;
    CGRect rotated = CGRectApplyAffineTransform(CGRectMake(0, 0, size.width, size.height), CGAffineTransformMakeRotation(radians));
    CGSize target = CGSizeMake(round(fabs(rotated.size.width)), round(fabs(rotated.size.height)));
    return NSRenderImage(target, NO, ^(CGContextRef ctx, CGSize s) {
        CGContextTranslateCTM(ctx, s.width / 2, s.height / 2);
        CGContextRotateCTM(ctx, radians);
        [image drawInRect:CGRectMake(-size.width / 2, -size.height / 2, size.width, size.height)];
    });
}

+(UIImage*)flipImage:(UIImage*)image horizontal:(BOOL)horizontal vertical:(BOOL)vertical {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        CGContextTranslateCTM(ctx, horizontal ? s.width : 0, vertical ? s.height : 0);
        CGContextScaleCTM(ctx, horizontal ? -1 : 1, vertical ? -1 : 1);
        [image drawInRect:CGRectMake(0, 0, s.width, s.height)];
    });
}

+(UIImage*)transformImage:(UIImage*)image options:(NSDictionary*)options {
    if (image == nil) {
        return nil;
    }

    UIImage *current = [self normalizeOrientation:image];
    NSDictionary *crop = options[@"crop"];
    if ([crop isKindOfClass:[NSDictionary class]]) {
        current = [self cropImage:current x:[crop[@"x"] doubleValue] y:[crop[@"y"] doubleValue] width:[crop[@"width"] doubleValue] height:[crop[@"height"] doubleValue]];
        if (current == nil) {
            return nil;
        }
    }

    if (options[@"rotate"] != nil) {
        current = [self rotateImage:current degrees:[options[@"rotate"] doubleValue]];
    }

    NSString *flip = options[@"flip"];
    if ([flip isKindOfClass:[NSString class]] && flip.length > 0) {
        BOOL h = [flip isEqualToString:@"horizontal"] || [flip isEqualToString:@"both"];
        BOOL v = [flip isEqualToString:@"vertical"] || [flip isEqualToString:@"both"];
        current = [self flipImage:current horizontal:h vertical:v];
    }

    NSDictionary *resize = options[@"resize"];
    if ([resize isKindOfClass:[NSDictionary class]]) {
        if (resize[@"maxSize"] != nil) {
            current = [self resizeImage:current maxSize:[resize[@"maxSize"] doubleValue] opaque:NO];
        } else {
            current = [self resizeImage:current width:[resize[@"width"] doubleValue] height:[resize[@"height"] doubleValue] mode:resize[@"mode"] ?: @"fit" background:resize[@"background"]];
        }
    }

    if (current == image) {
        current = [self normalizeOrientation:image];
        if (current == image) {
            current = [UIImage imageWithCGImage:image.CGImage scale:image.scale orientation:image.imageOrientation];
        }
    }

    return current;
}

+(void)transformImage:(UIImage*)image options:(NSDictionary*)options completion:(void (^)(UIImage*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        UIImage *result = [self transformImage:image options:options];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(result);
        });
    });
}

+(UIImage*)roundCorners:(UIImage*)image radius:(CGFloat)radius {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        CGRect rect = CGRectMake(0, 0, s.width, s.height);
        UIBezierPath *path;
        if (radius < 0) {
            CGFloat d = MIN(s.width, s.height);
            path = [UIBezierPath bezierPathWithOvalInRect:CGRectMake((s.width - d) / 2, (s.height - d) / 2, d, d)];
        } else {
            path = [UIBezierPath bezierPathWithRoundedRect:rect cornerRadius:radius];
        }

        [path addClip];
        [image drawInRect:rect];
    });
}

+(UIImage*)overlayImage:(UIImage*)base with:(UIImage*)other x:(CGFloat)x y:(CGFloat)y opacity:(CGFloat)opacity {
    if (base == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(base);
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        [base drawInRect:CGRectMake(0, 0, s.width, s.height)];
        if (other != nil) {
            CGSize os = NSImagePixelSize(other);
            [other drawInRect:CGRectMake(x, y, os.width, os.height) blendMode:kCGBlendModeNormal alpha:MAX(0, MIN(1, opacity))];
        }
    });
}

+(UIImage*)drawText:(NSString*)text onImage:(UIImage*)image x:(CGFloat)x y:(CGFloat)y font:(UIFont*)font color:(UIColor*)color {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    NSDictionary *attributes = @{ NSFontAttributeName: font ?: [UIFont systemFontOfSize:UIFont.labelFontSize], NSForegroundColorAttributeName: color ?: UIColor.blackColor };
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        [image drawInRect:CGRectMake(0, 0, s.width, s.height)];
        [text drawAtPoint:CGPointMake(x, y) withAttributes:attributes];
    });
}

+(UIImage*)tintImage:(UIImage*)image color:(UIColor*)color {
    if (image == nil) {
        return nil;
    }

    CGSize size = NSImagePixelSize(image);
    return NSRenderImage(size, NO, ^(CGContextRef ctx, CGSize s) {
        CGRect rect = CGRectMake(0, 0, s.width, s.height);
        [image drawInRect:rect];
        [color setFill];
        UIRectFillUsingBlendMode(rect, kCGBlendModeSourceIn);
    });
}

+(UIImage*)snapshotView:(UIView*)view scale:(CGFloat)scale {
    if (view == nil) {
        return nil;
    }

    CGSize size = view.bounds.size;
    if (size.width < 1 || size.height < 1) {
        return nil;
    }

    UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:size format:[self rendererFormatWithScale:scale opaque:NO]];
    return [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull ctx) {
        [view drawViewHierarchyInRect:CGRectMake(0, 0, size.width, size.height) afterScreenUpdates:YES];
    }];
}

+(UIImage*)applyFilters:(UIImage*)image filters:(NSArray<NSDictionary*>*)filters {
    if (image == nil) {
        return nil;
    }

    UIImage *upright = [self normalizeOrientation:image];
    CIImage *ci = [CIImage imageWithCGImage:upright.CGImage];
    if (ci == nil) {
        return nil;
    }

    CGRect extent = ci.extent;

    for (NSDictionary *filter in filters) {
        NSString *type = filter[@"type"];
        if ([type isEqualToString:@"grayscale"]) {
            CIFilter *f = [CIFilter filterWithName:@"CIColorControls"];
            [f setValue:ci forKey:kCIInputImageKey];
            [f setValue:@0 forKey:kCIInputSaturationKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"sepia"]) {
            CIFilter *f = [CIFilter filterWithName:@"CISepiaTone"];
            [f setValue:ci forKey:kCIInputImageKey];
            [f setValue:@(filter[@"amount"] ? [filter[@"amount"] doubleValue] : 1.0) forKey:kCIInputIntensityKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"invert"]) {
            CIFilter *f = [CIFilter filterWithName:@"CIColorInvert"];
            [f setValue:ci forKey:kCIInputImageKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"brightness"]) {
            CIFilter *f = [CIFilter filterWithName:@"CIColorControls"];
            [f setValue:ci forKey:kCIInputImageKey];
            [f setValue:@([filter[@"amount"] doubleValue]) forKey:kCIInputBrightnessKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"contrast"]) {
            CIFilter *f = [CIFilter filterWithName:@"CIColorControls"];
            [f setValue:ci forKey:kCIInputImageKey];
            [f setValue:@(filter[@"amount"] ? [filter[@"amount"] doubleValue] : 1.0) forKey:kCIInputContrastKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"saturation"]) {
            CIFilter *f = [CIFilter filterWithName:@"CIColorControls"];
            [f setValue:ci forKey:kCIInputImageKey];
            [f setValue:@(filter[@"amount"] ? [filter[@"amount"] doubleValue] : 1.0) forKey:kCIInputSaturationKey];
            ci = f.outputImage;
        } else if ([type isEqualToString:@"blur"]) {
            // Clamp edges first so the blur doesn't fade to transparent at the borders.
            CIFilter *f = [CIFilter filterWithName:@"CIGaussianBlur"];
            [f setValue:[ci imageByClampingToExtent] forKey:kCIInputImageKey];
            [f setValue:@([filter[@"radius"] doubleValue]) forKey:kCIInputRadiusKey];
            ci = [f.outputImage imageByCroppingToRect:extent];
        } else {
            return nil;
        }

        if (ci == nil) {
            return nil;
        }
    }

    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CIContext *context = [CIContext contextWithOptions:@{ kCIContextWorkingColorSpace: (__bridge id)colorSpace, kCIContextOutputColorSpace: (__bridge id)colorSpace }];
    CGImageRef cg = [context createCGImage:ci fromRect:extent];
    CGColorSpaceRelease(colorSpace);
    if (cg == NULL) {
        return nil;
    }

    UIImage *result = [UIImage imageWithCGImage:cg scale:1 orientation:UIImageOrientationUp];
    CGImageRelease(cg);
    return result;
}

+(void)applyFilters:(UIImage*)image filters:(NSArray<NSDictionary*>*)filters completion:(void (^)(UIImage*))completion {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        UIImage *result = [self applyFilters:image filters:filters];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(result);
        });
    });
}

// Renders the image into a small RGBA8 buffer for colour analysis. Caller frees.
static uint8_t* NSSamplePixels(UIImage *image, size_t w, size_t h) {
    uint8_t *buffer = calloc(w * h * 4, 1);
    if (buffer == NULL) {
        return NULL;
    }

    CGColorSpaceRef cs = CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx = CGBitmapContextCreate(buffer, w, h, 8, w * 4, cs, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGColorSpaceRelease(cs);
    if (ctx == NULL) {
        free(buffer);
        return NULL;
    }

    CGContextSetInterpolationQuality(ctx, kCGInterpolationHigh);
    UIGraphicsPushContext(ctx);
    // Flip so UIKit drawing lands upright in the CG context.
    CGContextTranslateCTM(ctx, 0, h);
    CGContextScaleCTM(ctx, 1, -1);
    [image drawInRect:CGRectMake(0, 0, w, h)];
    UIGraphicsPopContext();
    CGContextRelease(ctx);
    return buffer;
}

+(UIColor*)averageColor:(UIImage*)image {
    if (image == nil) {
        return nil;
    }

    const size_t n = 32;
    uint8_t *px = NSSamplePixels(image, n, n);
    if (px == NULL) {
        return nil;
    }

    unsigned long r = 0;
    unsigned long g = 0;
    unsigned long b = 0;
    unsigned long count = 0;
    for (size_t i = 0; i < n * n; i++) {
        uint8_t a = px[i * 4 + 3];
        if (a == 0) {
            continue;
        }

        // un-premultiply
        r += px[i * 4] * 255 / a;
        g += px[i * 4 + 1] * 255 / a;
        b += px[i * 4 + 2] * 255 / a;
        count++;
    }

    free(px);
    if (count == 0) {
        return nil;
    }

    return [UIColor colorWithRed:(r / count) / 255.0 green:(g / count) / 255.0 blue:(b / count) / 255.0 alpha:1];
}

+(NSArray<UIColor*>*)dominantColors:(UIImage*)image count:(NSInteger)count {
    if (image == nil || count <= 0) {
        return @[];
    }

    const size_t n = 32;
    uint8_t *px = NSSamplePixels(image, n, n);
    if (px == NULL) {
        return @[];
    }

    NSMutableDictionary<NSNumber*, NSMutableArray<NSNumber*>*> *buckets = [NSMutableDictionary dictionary];
    for (size_t i = 0; i < n * n; i++) {
        uint8_t a = px[i * 4 + 3];
        if (a < 128) {
            continue;
        }

        NSUInteger r = px[i * 4] * 255 / a;
        NSUInteger g = px[i * 4 + 1] * 255 / a;
        NSUInteger b = px[i * 4 + 2] * 255 / a;
        NSNumber *key = @(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
        NSMutableArray<NSNumber*> *acc = buckets[key];
        if (acc == nil) {
            acc = [NSMutableArray arrayWithObjects:@0, @0, @0, @0, nil];
            buckets[key] = acc;
        }

        acc[0] = @([acc[0] unsignedLongValue] + r);
        acc[1] = @([acc[1] unsignedLongValue] + g);
        acc[2] = @([acc[2] unsignedLongValue] + b);
        acc[3] = @([acc[3] unsignedLongValue] + 1);
    }

    free(px);
    NSArray *sorted = [buckets.allValues sortedArrayUsingComparator:^NSComparisonResult(NSArray *a, NSArray *b) {
        return [b[3] compare:a[3]];
    }];
    NSMutableArray<UIColor*> *result = [NSMutableArray array];
    for (NSArray<NSNumber*> *e in sorted) {
        if (result.count >= (NSUInteger)count) {
            break;
        }

        unsigned long c = e[3].unsignedLongValue;
        [result addObject:[UIColor colorWithRed:(e[0].unsignedLongValue / c) / 255.0 green:(e[1].unsignedLongValue / c) / 255.0 blue:(e[2].unsignedLongValue / c) / 255.0 alpha:1]];
    }

    return result;
}

+(NSString*)perceptualHash:(UIImage*)image {
    if (image == nil) {
        return nil;
    }

    uint8_t *px = NSSamplePixels(image, 9, 8);
    if (px == NULL) {
        return nil;
    }

    uint64_t hash = 0;
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            size_t l = (y * 9 + x) * 4;
            size_t r = (y * 9 + x + 1) * 4;
            NSInteger lumL = (px[l] * 299 + px[l + 1] * 587 + px[l + 2] * 114) / 1000;
            NSInteger lumR = (px[r] * 299 + px[r + 1] * 587 + px[r + 2] * 114) / 1000;
            hash = (hash << 1) | (lumL > lumR ? 1 : 0);
        }
    }

    free(px);
    return [NSString stringWithFormat:@"%016llx", hash];
}

+(NSInteger)hammingDistance:(NSString*)a to:(NSString*)b {
    if (a.length != 16 || b.length != 16) {
        return -1;
    }

    unsigned long long x = 0;
    unsigned long long y = 0;
    [[NSScanner scannerWithString:a] scanHexLongLong:&x];
    [[NSScanner scannerWithString:b] scanHexLongLong:&y];
    return __builtin_popcountll(x ^ y);
}

@end
