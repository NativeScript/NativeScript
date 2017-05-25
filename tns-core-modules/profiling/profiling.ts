declare var __startCPUProfiler: any;
declare var __stopCPUProfiler: any;

import { TimerInfo as TimerInfoDefinition } from ".";

export const uptime = global.android ? (<any>org).nativescript.Process.getUpTime : (<any>global).__tns_uptime;

interface TimerInfo extends TimerInfoDefinition {
    totalTime: number;
    lastTime?: number;
    count: number;
    currentStart: number;
    isRunning: boolean;
}

// Use object instead of map as it is a bit faster
const timers: { [index: string]: TimerInfo } = {};
const anyGlobal = <any>global;
const profileNames: string[] = [];

let instrumentationEnabled = false;

export function enable() {
    instrumentationEnabled = true;
}

export function disable() {
    instrumentationEnabled = false;
}

export const time = (<any>global).__time || Date.now;

export function start(name: string): void {
    let info = timers[name];

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
        timers[name] = info;
    }
}

export function pause(name: string): TimerInfo {
    let info = pauseInternal(name);
    return info;
}

export function stop(name: string): TimerInfo {
    let info = pauseInternal(name);
    console.log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);

    timers[name] = undefined;
    return info;
}

export function isRunning(name: string): boolean {
    const info = timers[name];
    return !!(info && info.isRunning);
}

function pauseInternal(name: string): TimerInfo {
    const info = timers[name];

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

function profileFunction<F extends Function>(fn: F, customName?: string): F {
    const name = customName || fn.name;
    profileNames.push(name);
    return <any>function() {
        start(name);
        try {
            return fn.apply(this, arguments);
        } finally {
            pause(name);
        }
    }
}

const profileMethodUnnamed = (target, key, descriptor) => {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    var originalMethod = descriptor.value;

    let className = "";
    if (target && target.constructor && target.constructor.name) {
        className = target.constructor.name + ".";
    }

    let name = className + key;

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

function profileMethodNamed(name: string): MethodDecorator {
    return (target, key, descriptor) => {

        // save a reference to the original method this way we keep the values currently in the
        // descriptor and don't overwrite what another decorator might have done to the descriptor.
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        var originalMethod = descriptor.value;

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

const voidMethodDecorator = () => {
    // no op
};

export function profile(nameFnOrTarget?: string | Function | Object, fnOrKey?: Function | string | symbol, descriptor?: PropertyDescriptor): Function | MethodDecorator {
    if (typeof nameFnOrTarget === "object" && (typeof fnOrKey === "string" || typeof fnOrKey === "symbol")) {
        if (!instrumentationEnabled) {
            return;
        }
        return profileMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
    } else if (typeof nameFnOrTarget === "string" && typeof fnOrKey === "function") {
        if (!instrumentationEnabled) {
            return fnOrKey;
        }
        return profileFunction(fnOrKey, nameFnOrTarget);
    } else if (typeof nameFnOrTarget === "function") {
        if (!instrumentationEnabled) {
            return nameFnOrTarget;
        }
        return profileFunction(nameFnOrTarget);
    } else if (typeof nameFnOrTarget === "string") {
        if (!instrumentationEnabled) {
            return voidMethodDecorator;
        }
        return profileMethodNamed(nameFnOrTarget);
    } else {
        if (!instrumentationEnabled) {
            return voidMethodDecorator;
        }
        return profileMethodUnnamed;
    }
}

export function dumpProfiles(): void {
    profileNames.forEach(function (name) {
        const info = timers[name];

        if (info) {
            console.log("---- [" + name + "] STOP total: " + info.totalTime + " count:" + info.count);
        }
        else {
            console.log("---- [" + name + "] Never called");
        }
    });
}

export function resetProfiles(): void {
    profileNames.forEach(function (name) {
        const info = timers[name];

        if (info) {
            if (!info.isRunning) {
                timers[name] = undefined;
            } else {
                console.log("---- timer with name [" + name + "] is currently running and won't be reset");
            }
        }
    });
}

export function startCPUProfile(name: string) {
    if (anyGlobal.android) {
        __startCPUProfiler(name);
    }
}

export function stopCPUProfile(name: string) {
    if (anyGlobal.android) {
        __stopCPUProfiler(name);
    }
}