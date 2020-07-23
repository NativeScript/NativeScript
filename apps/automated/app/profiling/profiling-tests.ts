import { assert, assertEqual, assertFalse, assertNull, assertTrue, assertThrows } from '../tk-unit';
import { enable, disable, profile, time, start, stop, timer, isRunning, resetProfiles } from '@nativescript/core/profiling';

enable();
class TestClass {
	@profile('__func_decorator__')
	doNothing() {
		//noop
	}

	@profile('__func_decorator_error__')
	throwError() {
		throw new Error('This error is expected');
	}

	@profile
	unnamed1() {
		// noop
	}

	@profile()
	unnamed2() {
		// noop
	}

	private isInReentrant = false;

	@profile
	reentrant() {
		try {
			if (!this.isInReentrant) {
				this.isInReentrant = true;
				this.reentrant();
			}
		} finally {
			this.isInReentrant = false;
		}
	}
}

const testFunction1 = profile(function testFunction1() {
	// noop
});
const testFunction2 = profile('testFunction2', () => {
	// noop
});
disable();

function retry(count: number, action: () => void) {
	for (var i = 1; i <= count; i++) {
		try {
			action();

			return;
		} catch (e) {
			if (i === count) {
				throw e;
			}
		}
	}
}

export function test_time_returns_number() {
	assertEqual(typeof time(), 'number');
}

export function test_isRunning() {
	resetProfiles();
	const name = 'test_isRunning';
	assertFalse(isRunning(name), 'isRunning should be false before start');

	start(name);
	assertTrue(isRunning(name), 'isRunning should be true after start');

	stop(name);
	assertFalse(isRunning(name), 'isRunning should be false after stop');

	start(name);
	assertTrue(isRunning(name), 'isRunning should be true after second start');

	stop(name);
	assertFalse(isRunning(name), 'isRunning should be false after second stop');
}

export function test_isRunning_withReentrancy() {
	resetProfiles();
	const name = 'test_isRunning';
	assertFalse(isRunning(name), 'isRunning should be false before start');

	start(name);
	assertTrue(isRunning(name), 'isRunning should be true after start');

	start(name);
	assertTrue(isRunning(name), 'isRunning should be true after second start');

	stop(name);
	assertTrue(isRunning(name), 'isRunning should be true after first stop');

	stop(name);
	assertFalse(isRunning(name), 'isRunning should be false after second stop');
}

export function test_reset_profiles() {
	resetProfiles();
	const name = 'test_reset_profiles';

	start(name);
	stop(name);
	resetProfiles();

	const res = timer(name);

	assertNull(res);
}

export function test_start_stop() {
	resetProfiles();
	const name = 'test_start_stop';

	start(name);
	stop(name);
	const res = timer(name);

	assertEqual(res.count, 1);
}

export function test_start_stop_count() {
	resetProfiles();
	const name = 'test_start_stop_count';

	for (var i = 0; i < 10; i++) {
		start(name);
		stop(name);
	}

	const res = timer(name);
	assertEqual(res.count, 10);
}

export function test_profile_decorator_count() {
	resetProfiles();
	const test = new TestClass();
	for (var i = 0; i < 10; i++) {
		test.doNothing();
		test.unnamed1();
		test.unnamed2();
		testFunction1();
		testFunction2();
	}

	['__func_decorator__', 'TestClass.unnamed1', 'TestClass.unnamed2', 'testFunction1', 'testFunction2'].forEach((key) => {
		const res = timer(key);
		assertEqual(res.count, 10, 'Expected profile with name ${key} to have traced 10 calls.');
	});
}

export function test_profile_decorator_handles_exceptions() {
	resetProfiles();
	const test = new TestClass();

	assertThrows(() => test.throwError());
	assertFalse(isRunning('__func_decorator_error__'), 'Timer should be stopped on exception.');
	assertEqual(timer('__func_decorator_error__').count, 1, 'Timer should be called once');
}

export function test_start_stop_performance() {
	retry(5, () => {
		resetProfiles();

		const count = 10000;
		const name = 'test_start_stop_performance';

		for (var i = 0; i < count; i++) {
			start(name);
			stop(name);
		}

		const res = timer(name);
		assertEqual(res.count, count);
		assert(res.totalTime <= 500, `Total time for ${count} timer operations is too much: ${res.totalTime}`);
	});
}

export function test_profile_decorator_performance() {
	retry(5, () => {
		resetProfiles();

		var start = Date.now();
		const count = 10000;
		const test = new TestClass();
		for (var i = 0; i < count; i++) {
			test.doNothing();
		}

		const res = timer('__func_decorator__');
		assertEqual(res.count, count);

		assert(res.totalTime <= 500, `Total time for ${count} timer operations is too much: ${res.totalTime}`);
		var end = Date.now();
		assert(end - start <= 1000, `Total time for test execution is too much: ${end - start}ms`);
	});
}

export function test_reentrancy() {
	// reentrant
	retry(5, () => {
		resetProfiles();
		const test = new TestClass();
		test.reentrant();
	});
}
