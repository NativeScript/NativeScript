#import <UIKit/UIKit.h>
#import "UIView+NativeScript.h"
#import "NativeScriptUtils.h"

@implementation UIView (NativeScript)
- (void)nativeScriptSetTextDecorationAndTransform:(NSString*)text textDecoration:(NSString*)textDecoration letterSpacing:(CGFloat)letterSpacing lineHeight:(CGFloat)lineHeight  {
    NSMutableDictionary *attrDict = [[NSMutableDictionary alloc] init];
    
    if ([textDecoration rangeOfString:@"underline"].location != NSNotFound) {
        attrDict[NSUnderlineStyleAttributeName] = [NSNumber numberWithInt:NSUnderlineStyleSingle];
    }
    
    if ([textDecoration rangeOfString:@"line-through"].location != NSNotFound) {
        attrDict[NSStrikethroughStyleAttributeName] = [NSNumber numberWithInt:NSUnderlineStyleSingle];
    }
    BOOL isTextType = [self isKindOfClass:[UITextField class]] || [self isKindOfClass:[UITextView class]] | [self isKindOfClass:[UILabel class]] | [self isKindOfClass:[UIButton class]];
    
    if (letterSpacing != 0 && isTextType && ((UITextView*)self).font != nil) {
        NSNumber *kern = [NSNumber numberWithDouble:letterSpacing * ((UITextView*)self).font.pointSize];
        attrDict[NSKernAttributeName] = kern;
        if ([self isKindOfClass:[UITextField class]]) {
            [((UITextField*)self).defaultTextAttributes setValue:kern forKey:NSKernAttributeName];
        }
    }
    
    BOOL isTextView = [self isKindOfClass:[UITextView class]];
    if (lineHeight > 0) {
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
        paragraphStyle.lineSpacing = lineHeight;
        // make sure a possible previously set text alignment setting is not lost when line height is specified
        if ([self isKindOfClass:[UIButton class]]) {
            paragraphStyle.alignment = ((UIButton*)self).titleLabel.textAlignment;
        } else {
            paragraphStyle.alignment = ((UILabel*)self).textAlignment;
        }
        
        if ([self isKindOfClass:[UILabel class]]) {
            // make sure a possible previously set line break mode is not lost when line height is specified
            paragraphStyle.lineBreakMode = ((UILabel*)self).lineBreakMode;
        }
        attrDict[NSParagraphStyleAttributeName] = paragraphStyle;
    } else if (isTextView) {
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
        paragraphStyle.alignment = ((UITextView*)self).textAlignment;
        attrDict[NSParagraphStyleAttributeName] = paragraphStyle;
    }
    
    if (attrDict.count > 0 || isTextView) {
        if (isTextView && ((UITextView*)self).font) {
            // UITextView's font seems to change inside.
            attrDict[NSFontAttributeName] = ((UITextView*)self).font;
        }
        
        NSMutableAttributedString *result = [[NSMutableAttributedString alloc] initWithString:text];
        [result setAttributes:attrDict range:(NSRange){
            0,
            text.length
        }];
        
        if ([self isKindOfClass:[UIButton class]]) {
            [(UIButton*)self setAttributedTitle:result forState:UIControlStateNormal];
        } else {
            ((UITextView*)self).attributedText = result;
        }
    } else {
        if ([self isKindOfClass:[UIButton class]]) {
            // Clear attributedText or title won't be affected.
            [(UIButton*)self setAttributedTitle:nil forState:UIControlStateNormal];
            [(UIButton*)self setTitle:text forState:UIControlStateNormal];
        } else {
            // Clear attributedText or text won't be affected.
            ((UILabel*)self).attributedText = nil;
            ((UILabel*)self).text = text;
        }
    }
}

-(void)nativeScriptSetFormattedTextDecorationAndTransform:(NSDictionary*)details letterSpacing:(CGFloat)letterSpacing lineHeight:(CGFloat)lineHeight {
    NSMutableAttributedString *attrText = [NativeScriptUtils createMutableStringWithDetails:details];
    if (letterSpacing != 0) {
        NSNumber *kern = [NSNumber numberWithDouble:letterSpacing * ((UITextView*)self).font.pointSize];
        [attrText addAttribute:NSKernAttributeName value:kern range:(NSRange){
            0,
            attrText.length
        } ];
    }
    
    BOOL isLabel = [self isKindOfClass:[UILabel class]];
    if (lineHeight > 0) {
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
        paragraphStyle.lineSpacing = lineHeight;
        // make sure a possible previously set text alignment setting is not lost when line height is specified
        if ([self isKindOfClass:[UIButton class]]) {
            paragraphStyle.alignment = ((UIButton*)self).titleLabel.textAlignment;
        } else {
            // Paragraph alignment is also important for tappable spans as NSTextContainer takes it into account
            paragraphStyle.alignment = ((UILabel*)self).textAlignment;
        }
        
        if (isLabel) {
            // make sure a possible previously set line break mode is not lost when line height is specified
            paragraphStyle.lineBreakMode = ((UILabel*)self).lineBreakMode;
        }
        [attrText addAttribute:NSParagraphStyleAttributeName value:paragraphStyle range:(NSRange){
            0,
            attrText.length
        }];
    } else if (isLabel || [self isKindOfClass:[UITextView class]]) {
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];

        if (isLabel) {
            // It's important to set paragraph alignment for link tap to work on multi-line spans as NSTextContainer takes it into account
            paragraphStyle.alignment = ((UILabel*)self).textAlignment;
        } else {
            paragraphStyle.alignment = ((UITextView*)self).textAlignment;
        }
        [attrText addAttribute:NSParagraphStyleAttributeName value:paragraphStyle range:(NSRange){
            0,
            attrText.length
        }];
    }
    
    if ([self isKindOfClass:[UIButton class]]) {
        [(UIButton*)self setAttributedTitle:attrText forState:UIControlStateNormal];
    } else {
        if (@available(iOS 13.0, *)) {
            ((UILabel*)self).textColor = [UIColor labelColor];
        }
        
        ((UILabel*)self).attributedText = attrText;
    }
}

-(void)nativeScriptSetFormattedTextStroke:(CGFloat)width color:(UIColor*)color {
    if (width > 0) {
        NSMutableAttributedString *attrText = [[NSMutableAttributedString alloc] initWithAttributedString:((UILabel*)self).attributedText];
        [attrText addAttribute:NSStrokeWidthAttributeName value:[NSNumber numberWithFloat:width] range:(NSRange){
            0,
            attrText.length
        }];
        [attrText addAttribute:NSStrokeColorAttributeName value:color range:(NSRange){
            0,
            attrText.length
        }];
        ((UILabel*)self).attributedText = attrText;
    }
}
@end
