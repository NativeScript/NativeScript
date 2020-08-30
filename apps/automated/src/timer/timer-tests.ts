import * as TKUnit from '../tk-unit';
import * as timer from '@nativescript/core/timer';

// >> timer-require
// require("globals");
//// OR
// var timer = require("timer");
// << timer-require

export function test_setTimeout_isDefined() {
	TKUnit.assertNotEqual(timer.setTimeout, undefined, 'Method timer.setTimeout() should be defined!');
}

export function test_clearTimeout_isDefined() {
	TKUnit.assertNotEqual(timer.clearTimeout, undefined, 'Method timer.clearTimeout() should be defined!');
}

export function test_setInsDefined() {
	TKUnit.assertNotEqual(timer.setInterval, undefined, 'Method timer.setInterval() should be defined!');
}

export function test_clear_isDefined() {
	TKUnit.assertNotEqual(timer.clearInterval, undefined, 'Method timer.clearInterval() should be defined!');
}

export function test_setTimeout() {
	let completed: boolean;

	// >> timer-set-zero
	const id = timer.setTimeout(() => {
		// >> (hide)
		completed = true;
		// << (hide)
	});
	// << timer-set-zero

	TKUnit.waitUntilReady(() => completed, 0.5, false);
	timer.clearTimeout(id);
	TKUnit.assert(completed, 'Callback should be called!');
}

export function test_setTimeout_extraArgs() {
	let completed: boolean;
	let rnd: number = Math.random();

	// >> timer-set-zero-args
	const id = timer.setTimeout(
		(arg) => {
			// >> (hide)
			completed = rnd === arg;
			// << (hide)
		},
		0,
		rnd
	);
	// << timer-set-zero-args

	TKUnit.waitUntilReady(() => completed, 0.5, false);
	timer.clearTimeout(id);
	TKUnit.assert(completed, 'Callback called with expected argument!');
}

export function test_setTimeout_callbackCalledAfterSpecifiedTime() {
	let completed = false;

	// >> timer-set-ten
	const id = timer.setTimeout(() => {
		// >> (hide)
		completed = true;
		// << (hide)
	}, 10);
	// << timer-set-ten

	TKUnit.waitUntilReady(() => completed, 1);
	timer.clearTimeout(id);
	TKUnit.assert(completed, 'Callback should be called after the specified time!');
}

export function test_setTimeout_callbackCalledWithBooleanPeriod() {
	let completed = false;

	// >> timer-set-false
	const id = timer.setTimeout(() => {
		// >> (hide)
		completed = true;
		// << (hide)
		// @ts-ignore
	}, false);
	// << timer-set-false

	TKUnit.waitUntilReady(() => completed, 1);
	timer.clearTimeout(id);
	TKUnit.assert(completed, 'Callback should be called in 0 seconds!');
}

export function test_setTimeout_callbackNotCalled() {
	let completed = false;

	const id = timer.setTimeout(() => (completed = true), 10);
	timer.clearTimeout(id);
	TKUnit.wait(30 / 1000);

	TKUnit.assert(!completed, 'Callback should not be called after the specified time!');
}

export function test_setTimeout_shouldReturnNumber() {
	let id = timer.setTimeout(() => {
		//
	});
	timer.clearTimeout(id);
	TKUnit.assertTrue(typeof id === 'number', 'Callback should return number!');
}

export function test_setTimeout_callbackShouldBeCleared() {
	let completed = false;

	// >> timer-set-fifty
	const id = timer.setTimeout(() => {
		// >> (hide)
		completed = true;
		// << (hide)
	}, 50);

	//// Clear timeout with specified id.
	timer.clearTimeout(id);

	// << timer-set-fifty

	TKUnit.wait(0.06);
	timer.clearTimeout(id);
	TKUnit.assert(!completed, 'Callback should be cleared when clearTimeout() is executed for specified id!');
}

export function test_setInterval_callbackCalledDuringPeriod(done) {
	let counter = 0;
	const expected = 4;
	const timeLimit = 300;

	const start = TKUnit.time();
	// >> timer-set-expression
	const id = timer.setInterval(() => {
		// >> (hide)
		counter++;
		if (counter === expected) {
			const end = TKUnit.time();
			timer.clearInterval(id);
			const time = end - start;
			done(time > timeLimit ? new Error(`setInterval too slow. Actual time: ${time} timelimit: ${timeLimit}`) : null);
		}
		// << (hide)
	}, 50);
	// << timer-set-expression
}

export function test_setInterval_callbackCalledWithExtraArgs(done) {
	let counter: number = 0;
	const rnd: number = Math.random();

	const start = TKUnit.time();
	const id = timer.setInterval(
		(arg) => {
			counter += arg === rnd ? 1 : -1;
			if (counter === 4) {
				const end = TKUnit.time();
				timer.clearInterval(id);
				done(end - start > 250 ? new Error('setInterval too slow.') : null);
			}
		},
		50,
		rnd
	);
}

export function test_setInterval_callbackShouldBeCleared(done) {
	const start = TKUnit.time();
	// >> timer-set-interval
	const id = timer.setInterval(() => {
		// >> (hide)
		const end = TKUnit.time();
		timer.clearInterval(id);
		done(end - start > 150 ? new Error('setInterval too slow.') : null);
		// << (hide)
		timer.clearInterval(id);
	}, 50);
	// << timer-set-interval
}

export function test_clearTimeout_multipleTimes_afterTick() {
	let completed = false;

	const id = timer.setTimeout(() => {
		completed = true;
	});

	TKUnit.waitUntilReady(() => completed, 0.5);
	TKUnit.assert(completed, 'Callback should be called');

	timer.clearTimeout(id);
	timer.clearTimeout(id);
}

export function test_clearTimeout_immediatelyAfterCreate() {
	let completed = false;

	const id = timer.setTimeout(() => {
		completed = true;
	});
	timer.clearTimeout(id);

	TKUnit.wait(0.02);
	TKUnit.assert(!completed, 'Callback should not be called');
}

export function test_clearInterval_immediatelyAfterCreate() {
	let completed = false;

	const id = timer.setInterval(() => {
		completed = true;
	});
	timer.clearInterval(id);

	TKUnit.wait(0.05);
	TKUnit.assert(!completed, 'Callback should not be called');
}

export function test_clearTimeout_insideCallback() {
	let completed = false;

	let id = timer.setTimeout(() => {
		completed = true;
		timer.clearTimeout(id);
	});

	TKUnit.waitUntilReady(() => completed, 0.5);
	TKUnit.assert(completed, 'Callback should be called');
}
