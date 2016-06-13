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
    CGSize size = [super textRectForBounds:bounds limitedToNumberOfLines:numberOfLines].size;
    return CGRectMake(
                      - (self.borderThickness.left + self.padding.left),
                      - (self.borderThickness.right + self.padding.right),
                      size.width + self.borderThickness.left + self.padding.left + self.padding.right + self.borderThickness.right,
                      size.height + self.borderThickness.top + self.padding.top + self.padding.bottom + self.borderThickness.bottom
                      );
}

-(void)drawTextInRect:(CGRect)rect {
    [super drawTextInRect:UIEdgeInsetsInsetRect(UIEdgeInsetsInsetRect(rect, self.borderThickness), self.padding)];
}

@end
