//
//  NSObject+Swizzling.h
//  TNSWidgets
//
//  Created by Manol Donev on 21.08.18.
//  Copyright © 2018 Telerik A D. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <objc/runtime.h>


@interface NSObject (Swizzling)

+ (void)swizzleInstanceMethodWithOriginalSelector:(SEL)originalSelector fromClass:(Class)classContainigOriginalSel withSwizzlingSelector:(SEL)swizzlingSelector;

@end
