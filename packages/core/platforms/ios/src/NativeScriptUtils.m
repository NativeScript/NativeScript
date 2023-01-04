#import "NativeScriptUtils.h"

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

+(UIImage*)scaleImage:(UIImage*)image width:(CGFloat)width height:(CGFloat)height scaleFactor:(CGFloat)scaleFactor {
    UIImage *resultImage;
    @autoreleasepool {
        UIGraphicsBeginImageContextWithOptions(CGSizeMake(width, height), NO, scaleFactor);
        [image drawInRect:CGRectMake(0, 0, width, height)];
        resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
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

@end
