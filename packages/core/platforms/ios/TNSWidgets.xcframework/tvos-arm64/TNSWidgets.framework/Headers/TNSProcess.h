//
//  TNSProcess.h
//  TNSWidgets
//
//  Created by Panayot Cankov on 15/05/2017.
//  Copyright © 2017 Telerik A D. All rights reserved.
//

#ifndef TNSProcess_h
#define TNSProcess_h

#import <Foundation/Foundation.h>

/**
 * Get the milliseconds since the process started.
 */
double __tns_uptime(void);

/**
 * Provides access to NSLog. The runtime implementation of console.log is filtered in release.
 * We rarely need to log in release but in cases such as when logging app startup times in release,
 * this will be convenient shortcut to NSLog, NSLog is not exposed.
 *
 * Please note the {N} CLI may be filtering app output, prefixing the message with "CONSOLE LOG"
 * will make the logs visible in "tns run ios --release" builds.
 */
void __nslog(NSString* message);

#endif /* TNSProcess_h */
