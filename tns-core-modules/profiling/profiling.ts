declare var __startCPUProfiler: any;
declare var __stopCPUProfiler: any;

import { TimerInfo as TimerInfoDefinition } from ".";

interface TimerInfo extends TimerInfoDefinition {
    totalTime: number;
    lastTime?: number;
    count: number;
    currentStart: number;
    isRunning: boolean;
}

// Use object instead of map as it is a bit faster
const timers: { [ index: string ]: TimerInfo } = {};
const anyGlobal = <any>global;
const profileNames: string[] = [];

let ENABLED = true;
let nativeTimeFunc: () => number;

export function enable() {
    ENABLED = true;

    if (!nativeTimeFunc) {
        // init timeFunc
        if (anyGlobal.android) {
            const nanoTime = java.lang.System.nanoTime;
            // 1 ms = 1000000 ns
            nativeTimeFunc = () => { return nanoTime() / 1000000 };
        } else {
            nativeTimeFunc = () => { return CACurrentMediaTime() * 1000; };
        }
    }
}

export function disable() {
    ENABLED = false;
}

export function time(): number {
    if (!ENABLED) {
        throw new Error("Profiling is not enabled");
    }

    return nativeTimeFunc();
}

export function start(name: string): void {
    if (!ENABLED) {
        return;
    }

    let info = timers[ name ];

    if (info) {
        if (info.isRunning) {
            throw new Error(`Timer already running: ${name}`);
        }
        info.currentStart = time();
        info.isRunning = true;
    } else {
        info = {
            totalTime: 0,
            count: 0,
            currentStart: time(),
            isRunning: true
        };
        timers[ name ] = info;
    }
}

export function pause(name: string): TimerInfo {
    if (!ENABLED) {
        return;
    }

    let info = pauseInternal(name);
    // console.log(`---- [${name}] PAUSE last: ${info.lastTime} total: ${info.totalTime} count: ${info.count}`);
    return info;
}

export function stop(name: string): TimerInfo {
    if (!ENABLED) {
        return;
    }

    let info = pauseInternal(name);
    console.log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);

    timers[ name ] = undefined;
    return info;
}

export function isRunning(name: string): boolean {
    const info = timers[ name ];
    return !!(info && info.isRunning);
}

function pauseInternal(name: string): TimerInfo {
    const info = timers[ name ];

    if (!info) {
        throw new Error(`No timer started: ${name}`);
    }

    if (info.isRunning) {
        info.lastTime = time() - info.currentStart;
        info.totalTime += info.lastTime;
        info.count++;
        info.currentStart = 0;
        info.isRunning = false;
    }

    return info;
}

export function profile(name?: string): MethodDecorator {
    return (target, key, descriptor) => {
        if (!ENABLED) {
            return;
        }

        // save a reference to the original method this way we keep the values currently in the
        // descriptor and don't overwrite what another decorator might have done to the descriptor.
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        var originalMethod = descriptor.value;

        if (!name) {
            name = key;
        }

        profileNames.push(name);

        //editing the descriptor/value parameter
        descriptor.value = function () {
            start(name);
            try {
                return originalMethod.apply(this, arguments);
            } finally {
                pause(name);
            }
        };

        // return edited descriptor as opposed to overwriting the descriptor
        return descriptor;
    }
}

export function dumpProfiles(): void {
    profileNames.forEach(function (name) {
        const info = timers[ name ];

        if (info) {
            console.log("---- [" + name + "] STOP total: " + info.totalTime + " count:" + info.count);
        }
        else {
            console.log("---- [" + name + "] Never called");
        }
    });
}

export function startCPUProfile(name: string) {
    if (!ENABLED) {
        return;
    }

    if (anyGlobal.android) {
        __startCPUProfiler(name);
    }
}

export function stopCPUProfile(name: string) {
    if (!ENABLED) {
        return;
    }

    if (anyGlobal.android) {
        __stopCPUProfiler(name);
    }
}