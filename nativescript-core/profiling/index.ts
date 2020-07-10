declare var __startCPUProfiler: any;
declare var __stopCPUProfiler: any;

export function uptime() {
	return global.android ? (<any>org).nativescript.Process.getUpTime() : (<any>global).__tns_uptime();
}

export function log(message: string): void {
	if ((<any>global).__nslog) {
		(<any>global).__nslog('CONSOLE LOG: ' + message);
	}
	console.log(message);
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

// Use object instead of map as it is a bit faster
const timers: { [index: string]: TimerInfo } = {};
const anyGlobal = <any>global;
const profileNames: string[] = [];

export const time = (<any>global).__time || Date.now;

export function start(name: string): void {
	let info = timers[name];

	if (info) {
		info.currentStart = time();
		info.runCount++;
	} else {
		info = {
			totalTime: 0,
			count: 0,
			currentStart: time(),
			runCount: 1,
		};
		timers[name] = info;
		profileNames.push(name);
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
		} else {
			info.lastTime = time() - info.currentStart;
			info.totalTime += info.lastTime;
			info.count++;
			info.currentStart = 0;
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
	return type === MemberType.Instance
		? <any>function () {
				const start = time();
				try {
					return fn.apply(this, arguments);
				} finally {
					const end = time();
					console.log(`Timeline: Modules: ${name} ${this}  (${start}ms. - ${end}ms.)`);
				}
		  }
		: function () {
				const start = time();
				try {
					return fn.apply(this, arguments);
				} finally {
					const end = time();
					console.log(`Timeline: Modules: ${name}  (${start}ms. - ${end}ms.)`);
				}
		  };
}

const enum MemberType {
	Static,
	Instance,
}

export enum Level {
	none,
	lifecycle,
	timeline,
}
let tracingLevel: Level = Level.none;

let profileFunctionFactory: <F extends Function>(fn: F, name: string, type?: MemberType) => F;
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
}

try {
	const appConfig = require('~/package.json');
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
}

function profileFunction<F extends Function>(fn: F, customName?: string): F {
	return profileFunctionFactory(fn, customName || fn.name);
}

const profileMethodUnnamed = (target, key, descriptor) => {
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

	let name = className + key;

	//editing the descriptor/value parameter
	descriptor.value = profileFunctionFactory(originalMethod, name, MemberType.Instance);

	// return edited descriptor as opposed to overwriting the descriptor
	return descriptor;
};

const profileStaticMethodUnnamed = (ctor, key, descriptor) => {
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
	let name = className + key;

	//editing the descriptor/value parameter
	descriptor.value = profileFunctionFactory(originalMethod, name, MemberType.Static);

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

		//editing the descriptor/value parameter
		descriptor.value = profileFunctionFactory(originalMethod, name);

		// return edited descriptor as opposed to overwriting the descriptor
		return descriptor;
	};
}

const voidMethodDecorator = () => {
	// no op
};

export function profile(nameFnOrTarget?: string | Function | Object, fnOrKey?: Function | string | symbol, descriptor?: PropertyDescriptor, attrs?: any): any {
	if (typeof nameFnOrTarget === 'object' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
		if (!profileFunctionFactory) {
			return;
		}

		return profileMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
	} else if (typeof nameFnOrTarget === 'function' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
		if (!profileFunctionFactory) {
			return;
		}

		return profileStaticMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
	} else if (typeof nameFnOrTarget === 'string' && typeof fnOrKey === 'function') {
		if (!profileFunctionFactory) {
			return fnOrKey;
		}

		return profileFunction(fnOrKey, nameFnOrTarget);
	} else if (typeof nameFnOrTarget === 'function') {
		if (!profileFunctionFactory) {
			return nameFnOrTarget;
		}

		return profileFunction(nameFnOrTarget);
	} else if (typeof nameFnOrTarget === 'string') {
		if (!profileFunctionFactory) {
			return voidMethodDecorator;
		}

		return profileMethodNamed(nameFnOrTarget);
	} else {
		if (!profileFunctionFactory) {
			return voidMethodDecorator;
		}

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
			} else {
				timers[name] = undefined;
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
