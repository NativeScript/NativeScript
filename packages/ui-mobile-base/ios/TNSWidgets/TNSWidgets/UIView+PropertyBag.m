//
//  UIView+PropertyBag.m
//  TNSWidgets
//
//  Created by Manol Donev on 21.08.18.
//  Copyright © 2018 Telerik A D. All rights reserved.
//

#import "NSObject+Swizzling.h"
#import "UIView+PropertyBag.h"
#import <UIKit/UIKit.h>


@implementation UIView (PropertyBag)

+ (void) load {
    [self loadPropertyBag];
}

+ (void) loadPropertyBag {
    @autoreleasepool {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            const SEL deallocSelector  = NSSelectorFromString(@"dealloc"); //ARC forbids use of 'dealloc' in a @selector
            [self swizzleInstanceMethodWithOriginalSelector:deallocSelector fromClass:self.class withSwizzlingSelector:@selector(propertyBag_dealloc)];
        });
    }
}

__strong NSMutableDictionary *_propertyBagHolder; // Properties for every class will go in this property bag
- (id) propertyValueForKey:(NSString*) key {
    return [[self propertyBag] valueForKey:key];
}

- (void) setPropertyValue:(id) value forKey:(NSString*) key {
    [[self propertyBag] setValue:value forKey:key];
}

- (NSMutableDictionary*) propertyBag {
    if (_propertyBagHolder == nil) {
        _propertyBagHolder = [[NSMutableDictionary alloc] initWithCapacity:100];
    }

    NSMutableDictionary *propBag = [_propertyBagHolder valueForKey:[[NSString alloc] initWithFormat:@"%p", self]];
    if (propBag == nil) {
        propBag = [NSMutableDictionary dictionary];
        [self setPropertyBag:propBag];
    }
    
    return propBag;
}

- (void) setPropertyBag:(NSDictionary*) propertyBag {
    if (_propertyBagHolder == nil) {
        _propertyBagHolder = [[NSMutableDictionary alloc] initWithCapacity:100];
    }
    
    [_propertyBagHolder setValue:propertyBag forKey:[[NSString alloc] initWithFormat:@"%p", self]];
}

- (void) removePropertyBag {
    if (_propertyBagHolder != nil) {
        [_propertyBagHolder removeObjectForKey:[[NSString alloc] initWithFormat:@"%p", self]];
    }
}

- (void)propertyBag_dealloc {
    [self removePropertyBag];
    [self propertyBag_dealloc]; // swizzled
}

@end
