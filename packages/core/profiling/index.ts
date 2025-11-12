// @ts-ignore apps resolve this at runtime with path alias in project bundlers
import appConfig from '~/package.json';
/* eslint-disable prefer-rest-params */
declare let __startCPUProfiler: any;
declare let __stopCPUProfiler: any;
declare const __NS_PROFILING_DEBUG__: boolean | undefined;
declare const __NS_PROFILING_DEBUG_CONSOLE__: boolean | undefined;

const enum MemberType {
	Static,
	Instance,
}

export enum Level {
	none,
	lifecycle,
	timeline,
}

export function uptime(): number {
	return global.android ? (<any>org).nativescript.Process.getUpTime() : global.__tns_uptime();
}

export function log(message: string, ...optionalParams: any[]): void {
	if (global.__nslog) {
		global.__nslog('CONSOLE LOG: ' + message);
	}
	console.log(message, ...optionalParams);
}

export type InstrumentationMode = 'counters' | 'timeline' | 'lifecycle';

export interface TimerInfo {
	totalTime: number;
	lastTime?: number;
	count: number;
	currentStart: number;
	/**
	 * Counts the number of entry and exits a function had.
	 */
	runCount: number;
}

// Global singleton state (prevents duplication under multiple module instances)
const anyGlobal = <any>global;
type ProfilingDebugPhase = 'timer-start' | 'timer-stop' | 'timer-stop-pending' | 'timer-reset' | 'wrap-instance' | 'wrap-static' | 'wrap-named' | 'wrap-function';

export interface ProfilingDebugEntry {
	phase: ProfilingDebugPhase;
	name: string;
	timestamp: number;
	detail?: { runCount?: number; count?: number; totalTime?: number; note?: string };
}

type ProfilerState = {
	timers: { [index: string]: TimerInfo };
	profileNames: string[];
	tracingLevel: Level;
	profileFunctionFactory?: <F extends Function>(fn: F, name: string, type?: MemberType) => F;
	debug?: boolean;
	debugEvents?: ProfilingDebugEntry[];
	debugConsole?: boolean;
};
const __nsProfiling: ProfilerState = (anyGlobal.__nsProfiling ||= {
	timers: {},
	profileNames: [],
	tracingLevel: undefined as any,
	profileFunctionFactory: undefined,
});
// Initialize default tracing level if first load
if (__nsProfiling.tracingLevel === undefined) {
	__nsProfiling.tracingLevel = Level.none;
}
const debugEnabledFromDefine = typeof __NS_PROFILING_DEBUG__ !== 'undefined' ? __NS_PROFILING_DEBUG__ : undefined;
const debugConsoleFromDefine = typeof __NS_PROFILING_DEBUG_CONSOLE__ !== 'undefined' ? __NS_PROFILING_DEBUG_CONSOLE__ : undefined;
if (typeof __nsProfiling.debug !== 'boolean') {
	__nsProfiling.debug = debugEnabledFromDefine ?? false;
}
if (!Array.isArray(__nsProfiling.debugEvents)) {
	__nsProfiling.debugEvents = [];
}
if (typeof __nsProfiling.debugConsole !== 'boolean') {
	__nsProfiling.debugConsole = debugConsoleFromDefine ?? true;
}
// Use object instead of map as it is a bit faster
const timers: { [index: string]: TimerInfo } = __nsProfiling.timers;
const profileNames: string[] = __nsProfiling.profileNames;
const debugEvents = __nsProfiling.debugEvents!;

export const time = (global.__time || Date.now) as () => number;

function recordDebugEvent(phase: ProfilingDebugPhase, name: string, detail?: ProfilingDebugEntry['detail']): void {
	if (!__nsProfiling.debug) {
		return;
	}
	const entry: ProfilingDebugEntry = {
		phase,
		name,
		timestamp: time(),
		detail,
	};
	debugEvents.push(entry);
	if (__nsProfiling.debugConsole !== false) {
		const summary = detail
			? Object.entries(detail)
					.map(([key, value]) => `${key}=${value}`)
					.join(' ')
			: '';
		console.log(`[profiling:${phase}] ${name}${summary ? ' ' + summary : ''}`);
	}
}

function summarizeTimerInfo(info: TimerInfo | undefined) {
	return info
		? {
				runCount: info.runCount,
				count: info.count,
				totalTime: info.totalTime,
			}
		: undefined;
}

export function start(name: string): void {
	let info = timers[name];

	if (info) {
		info.currentStart = time();
		info.runCount++;
		recordDebugEvent('timer-start', name, summarizeTimerInfo(info));
	} else {
		info = {
			totalTime: 0,
			count: 0,
			currentStart: time(),
			runCount: 1,
		};
		timers[name] = info;
		profileNames.push(name);
		recordDebugEvent('timer-start', name, summarizeTimerInfo(info));
	}
}

export function stop(name: string): TimerInfo {
	const info = timers[name];

	if (!info) {
		throw new Error(`No timer started: ${name}`);
	}

	if (info.runCount) {
		info.runCount--;
		if (info.runCount) {
			info.count++;
			recordDebugEvent('timer-stop-pending', name, summarizeTimerInfo(info));
		} else {
			info.lastTime = time() - info.currentStart;
			info.totalTime += info.lastTime;
			info.count++;
			info.currentStart = 0;
			recordDebugEvent('timer-stop', name, summarizeTimerInfo(info));
		}
	} else {
		throw new Error(`Timer ${name} paused more times than started.`);
	}

	return info;
}

export function timer(name: string): TimerInfo {
	return timers[name];
}

export function print(name: string): TimerInfo {
	const info = timers[name];
	if (!info) {
		throw new Error(`No timer started: ${name}`);
	}

	console.log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);

	return info;
}

export function isRunning(name: string): boolean {
	const info = timers[name];

	return !!(info && info.runCount);
}

function countersProfileFunctionFactory<F extends Function>(fn: F, name: string, type: MemberType = MemberType.Instance): F {
	profileNames.push(name);

	return <any>function () {
		start(name);
		try {
			return fn.apply(this, arguments);
		} finally {
			stop(name);
		}
	};
}

function timelineProfileFunctionFactory<F extends Function>(fn: F, name: string, type: MemberType = MemberType.Instance): F {
	return type === MemberType.Instance ? <any>function () {
				const start = time();
				try {
					return fn.apply(this, arguments);
				} finally {
					const end = time();
					console.log(`Timeline: Modules: ${name} ${this}  (${start}ms. - ${end}ms.)`);
				}
			} : <any>function () {
				const start = time();
				try {
					return fn.apply(this, arguments);
				} finally {
					const end = time();
					console.log(`Timeline: Modules: ${name}  (${start}ms. - ${end}ms.)`);
				}
			};
}

let tracingLevel: Level = __nsProfiling.tracingLevel;

let profileFunctionFactory: <F extends Function>(fn: F, name: string, type?: MemberType) => F = __nsProfiling.profileFunctionFactory;
export function enable(mode: InstrumentationMode = 'counters') {
	profileFunctionFactory =
		mode &&
		{
			counters: countersProfileFunctionFactory,
			timeline: timelineProfileFunctionFactory,
		}[mode];

	tracingLevel =
		{
			lifecycle: Level.lifecycle,
			timeline: Level.timeline,
		}[mode] || Level.none;

	// persist to global singleton so other module instances share the same state
	__nsProfiling.profileFunctionFactory = profileFunctionFactory;
	__nsProfiling.tracingLevel = tracingLevel;
}

try {
	if (appConfig && appConfig.profiling) {
		enable(appConfig.profiling);
	}
} catch (e1) {
	try {
		console.log('Profiling startup failed to figure out defaults from package.json, error: ' + e1);
	} catch (e2) {
		// We can get here if an exception is thrown in the mksnapshot as there is no console there.
	}
}

export function disable() {
	profileFunctionFactory = undefined;
	__nsProfiling.profileFunctionFactory = undefined;
}

function profileFunction<F extends Function>(fn: F, customName?: string): F {
	const name = customName || fn.name;
	recordDebugEvent('wrap-function', name);
	if (profileFunctionFactory) {
		return profileFunctionFactory<F>(fn, name);
	}
	// Lazy wrapper: if factory not available at decoration time, defer to runtime
	return <any>function () {
		const fac = (anyGlobal.__nsProfiling && anyGlobal.__nsProfiling.profileFunctionFactory) || profileFunctionFactory;
		if (fac) {
			const wrapped = fac(fn, name);
			return wrapped.apply(this, arguments);
		}
		return fn.apply(this, arguments);
	};
}

const profileMethodUnnamed = (target: Object, key: symbol | string, descriptor) => {
	// save a reference to the original method this way we keep the values currently in the
	// descriptor and don't overwrite what another decorator might have done to the descriptor.
	if (descriptor === undefined) {
		descriptor = Object.getOwnPropertyDescriptor(target, key);
	}
	const originalMethod = descriptor.value;

	let className = '';
	if (target && target.constructor && target.constructor.name) {
		className = target.constructor.name + '.';
	}

	const name = className + key?.toString();

	// editing the descriptor/value parameter
	// Always install a wrapper that records timing regardless of current factory state to match webpack behavior.
	// If a profiling factory is active use it; otherwise fallback to counters start/stop directly.
	if (profileFunctionFactory) {
		descriptor.value = profileFunctionFactory(originalMethod, name, MemberType.Instance);
	} else {
		descriptor.value = function () {
			start(name);
			try {
				return originalMethod.apply(this, arguments);
			} finally {
				stop(name);
			}
		};
	}
	recordDebugEvent('wrap-instance', name);

	// return edited descriptor as opposed to overwriting the descriptor
	return descriptor;
};

const profileStaticMethodUnnamed = <F extends Function>(ctor: F, key: symbol | string, descriptor) => {
	// save a reference to the original method this way we keep the values currently in the
	// descriptor and don't overwrite what another decorator might have done to the descriptor.
	if (descriptor === undefined) {
		descriptor = Object.getOwnPropertyDescriptor(ctor, key);
	}
	const originalMethod = descriptor.value;

	let className = '';
	if (ctor && ctor.name) {
		className = ctor.name + '.';
	}
	const name = className + key?.toString();

	// editing the descriptor/value parameter
	if (profileFunctionFactory) {
		descriptor.value = profileFunctionFactory(originalMethod, name, MemberType.Static);
	} else {
		descriptor.value = function () {
			start(name);
			try {
				return originalMethod.apply(this, arguments);
			} finally {
				stop(name);
			}
		};
	}
	recordDebugEvent('wrap-static', name);

	// return edited descriptor as opposed to overwriting the descriptor
	return descriptor;
};

function profileMethodNamed(name: string): MethodDecorator {
	return (target, key, descriptor: PropertyDescriptor) => {
		// save a reference to the original method this way we keep the values currently in the
		// descriptor and don't overwrite what another decorator might have done to the descriptor.
		if (descriptor === undefined) {
			descriptor = Object.getOwnPropertyDescriptor(target, key);
		}
		const originalMethod = descriptor.value;

		// editing the descriptor/value parameter
		if (profileFunctionFactory) {
			descriptor.value = profileFunctionFactory(originalMethod, name);
		} else {
			descriptor.value = function () {
				start(name);
				try {
					return originalMethod.apply(this, arguments);
				} finally {
					stop(name);
				}
			};
		}

		// return edited descriptor as opposed to overwriting the descriptor
		recordDebugEvent('wrap-named', name);
		return descriptor;
	};
}

const voidMethodDecorator = () => {
	// no op
};

export function profile(nameFnOrTarget?: string | Function | Object, fnOrKey?: Function | string | symbol, descriptor?: PropertyDescriptor, attrs?: any): any {
	if (typeof nameFnOrTarget === 'object' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
		return profileMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
	} else if (typeof nameFnOrTarget === 'function' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
		return profileStaticMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
	} else if (typeof nameFnOrTarget === 'string' && typeof fnOrKey === 'function') {
		return profileFunction(fnOrKey, nameFnOrTarget);
	} else if (typeof nameFnOrTarget === 'function') {
		return profileFunction(nameFnOrTarget);
	} else if (typeof nameFnOrTarget === 'string') {
		return profileMethodNamed(nameFnOrTarget);
	} else {
		return profileMethodUnnamed;
	}
}

export function dumpProfiles(): void {
	profileNames.forEach(function (name) {
		const info = timers[name];
		if (info) {
			console.log('---- [' + name + '] STOP total: ' + info.totalTime + ' count:' + info.count);
		} else {
			console.log('---- [' + name + '] Never called');
		}
	});
}

export function resetProfiles(): void {
	profileNames.forEach(function (name) {
		const info = timers[name];
		if (info) {
			if (info.runCount) {
				console.log('---- timer with name [' + name + "] is currently running and won't be reset");
				recordDebugEvent('timer-reset', name, summarizeTimerInfo(info));
			} else {
				timers[name] = undefined;
				recordDebugEvent('timer-reset', name, summarizeTimerInfo(info));
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

export function level(): Level {
	return tracingLevel;
}

export function trace(message: string, start: number, end: number): void {
	log(`Timeline: Modules: ${message}  (${start}ms. - ${end}ms.)`);
}
