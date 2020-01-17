//
//  UIView+PassThroughParent.m
//  TNSWidgets
//
//  Created by Manol Donev on 21.08.18.
//  Copyright © 2018 Telerik A D. All rights reserved.
//

#import "NSObject+Swizzling.h"
#import "UIView+PassThroughParent.h"
#import "UIView+PropertyBag.h"


NSString * const TLKPassThroughParentKey = @"passThroughParent";

@implementation UIView (PassThroughParent)

+ (void) load {
    [self loadHitTest];
}

+ (void) loadHitTest {
    @autoreleasepool {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            [self swizzleInstanceMethodWithOriginalSelector:@selector(hitTest:withEvent:) fromClass:self.class withSwizzlingSelector:@selector(passThrough_hitTest:withEvent:)];
        });
    }
}

- (BOOL)passThroughParent {
    NSNumber *passthrough = [self propertyValueForKey:TLKPassThroughParentKey];
    if (passthrough) {
        return passthrough.boolValue;
    };

    return NO;
}

- (void)setPassThroughParent:(BOOL)passThroughParent {
    [self setPropertyValue:[NSNumber numberWithBool:passThroughParent] forKey:TLKPassThroughParentKey];
}

- (UIView *)passThrough_hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    UIView *hitTestView = [self passThrough_hitTest:point withEvent:event]; // swizzled
    if (hitTestView == self && self.passThroughParent) {
        hitTestView = nil;
    }

    return hitTestView;
}

@end
