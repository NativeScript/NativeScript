//
//  TNSProcess.c
//  TNSWidgets
//
//  Created by Panayot Cankov on 15/05/2017.
//  Copyright © 2017 Telerik A D. All rights reserved.
//

#include "TNSProcess.h"

#include <sys/sysctl.h>
#include <sys/types.h>
#include <sys/time.h>

double __tns_uptime() {
    pid_t pid = [[NSProcessInfo processInfo] processIdentifier];
    int mib[4] = { CTL_KERN, KERN_PROC, KERN_PROC_PID, pid };
    struct kinfo_proc proc;
    size_t size = sizeof(proc);
    sysctl(mib, 4, &proc, &size, NULL, 0);

    struct timeval current;
    gettimeofday(&current, NULL);

    return (double)(current.tv_sec - proc.kp_proc.p_starttime.tv_sec) * 1000.0 + (double)(current.tv_usec - proc.kp_proc.p_starttime.tv_usec) / 1000.0;
}

void __nslog(NSString* message) {
    NSLog(@"%@", message);
}
