//
//  TNSLabel.m
//  TNSWidgets
//
//  Created by Hristo Hristov on 6/9/16.
//  Copyright © 2016 Telerik A D. All rights reserved.
//

#import "TNSLabel.h"

@implementation TNSLabel


- (CGRect)textRectForBounds:(CGRect)bounds limitedToNumberOfLines:(NSInteger)numberOfLines {
    // UILabel.textRectForBounds:limitedToNumberOfLines: returns rect with CGSizeZero when empty
    if (self.text.length == 0) {
        return [super textRectForBounds:bounds limitedToNumberOfLines:numberOfLines];
    }

    // 1. Subtract the insets (border thickness & padding)
    // 2. Calculate the original label bounds
    // 3. Add the insets again
    UIEdgeInsets insets = UIEdgeInsetsMake(self.borderThickness.top + self.padding.top,
                                           self.borderThickness.left + self.padding.left,
                                           self.borderThickness.bottom + self.padding.bottom,
                                           self.borderThickness.right + self.padding.right);

    CGRect rect = [super textRectForBounds:UIEdgeInsetsInsetRect(bounds, insets) limitedToNumberOfLines:numberOfLines];

    UIEdgeInsets inverseInsets = UIEdgeInsetsMake(-(self.borderThickness.top + self.padding.top),
                                                  -(self.borderThickness.left + self.padding.left),
                                                  -(self.borderThickness.bottom + self.padding.bottom),
                                                  -(self.borderThickness.right + self.padding.right));

    return UIEdgeInsetsInsetRect(rect, inverseInsets);
}

-(void)drawTextInRect:(CGRect)rect {
    [super drawTextInRect:UIEdgeInsetsInsetRect(UIEdgeInsetsInsetRect(rect, self.borderThickness), self.padding)];
}

@end
