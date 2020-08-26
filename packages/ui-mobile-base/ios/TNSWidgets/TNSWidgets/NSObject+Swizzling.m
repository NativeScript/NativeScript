//
//  NSObject+Swizzling.m
//  TNSWidgets
//
//  Created by Manol Donev on 21.08.18.
//  Copyright © 2018 Telerik A D. All rights reserved.
//

#import "NSObject+Swizzling.h"

@implementation NSObject (Swizzling)

#pragma mark - Method Swizzling

+ (void)swizzleInstanceMethodWithOriginalSelector:(SEL)originalSelector
                                        fromClass:(Class)classContainigOriginalSel
                            withSwizzlingSelector:(SEL)swizzlingSelector {
    Method originalMethod = class_getInstanceMethod(classContainigOriginalSel, originalSelector);
    Method swizzlingMethod = class_getInstanceMethod(self.class, swizzlingSelector);
    [self swizzleMethodWithOriginalSelector:originalSelector
                             originalMethod:originalMethod
                                  fromClass:classContainigOriginalSel
                      withSwizzlingSelector:swizzlingSelector
                            swizzlingMethod:swizzlingMethod];
}

//MARK: Utilities

+ (void)swizzleMethodWithOriginalSelector:(SEL)originalSelector
                           originalMethod:(Method)originalMethod
                                fromClass:(Class)classContainigOriginalSel
                    withSwizzlingSelector:(SEL)swizzlingSelector
                          swizzlingMethod:(Method)swizzlingMethod {
    if (self == classContainigOriginalSel) {
        BOOL didAddMethod = class_addMethod(classContainigOriginalSel,
                                            originalSelector,
                                            method_getImplementation(swizzlingMethod),
                                            method_getTypeEncoding(swizzlingMethod));
        
        if (didAddMethod) {
            class_replaceMethod(self.class,
                                swizzlingSelector,
                                method_getImplementation(originalMethod),
                                method_getTypeEncoding(originalMethod));
        } else {
            method_exchangeImplementations(originalMethod, swizzlingMethod);
        }
        
        return;
    }
    
    class_addMethod(classContainigOriginalSel,
                    swizzlingSelector,
                    method_getImplementation(originalMethod),
                    method_getTypeEncoding(originalMethod));
    
    class_replaceMethod(classContainigOriginalSel,
                        originalSelector,
                        method_getImplementation(swizzlingMethod),
                        method_getTypeEncoding(swizzlingMethod));
    
    class_replaceMethod(self,
                        swizzlingSelector,
                        method_getImplementation(originalMethod),
                        method_getTypeEncoding(originalMethod));
}

@end
