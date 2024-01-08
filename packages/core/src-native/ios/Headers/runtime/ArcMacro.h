/*
 * ARCMacro.h  1.2 2016/10/30  https://gist.github.com/2823399 Thanks: @olance
 * ARCMacro.h  1.1 2012/05/29  https://gist.github.com/2823399
 *
 * ARCMacro.h realizes coexistence of both the ARC (Automatic
 * Reference Counting) mode and the Non-ARC mode of Objective-C
 * in the same source code. This macro works for iOS and Mac OS X.
 *
 * This is a by-product of joint research by AIST and The University of Ryukyu.
 * HIRANO Satoshi (AIST), NAKAMURA Morikazu (U. Ryukyu) and GUAN Senlin (U. Ryukyu)
 *
 * Author: HIRANO Satoshi (AIST, Japan) on 2011/11/14
 * Copyright 2011-2012 National Institute of Advanced Industrial Science
 *      and Technology (AIST), Japan.  Apache License 2.0.
 *
 * Usage:
 *    #import "ARCMacro.h"
 *    [o1 RETAIN];
 *    o2 = [[o3 RETAIN] AUTORELEASE];
 *    [super DEALLOC];
 */

#if __clang__
    #if __has_feature(objc_arc)
        #define S_RETAIN self
        #define S_AUTORELEASE self
        #define S_RELEASE self
        #define S_DEALLOC self
    #else
        #define S_RETAIN retain
        #define S_AUTORELEASE autorelease
        #define S_RELEASE release
        #define S_DEALLOC dealloc
    #endif
#else
    #define S_RETAIN retain
    #define S_AUTORELEASE autorelease
    #define S_RELEASE release
    #define S_DEALLOC dealloc
#endif
