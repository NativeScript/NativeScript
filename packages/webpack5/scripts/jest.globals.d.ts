// define test-specific globals here

declare namespace jest {
	interface Matchers<R, T> {
		toHaveBeenWarned(): R;
		toHaveBeenPrinted(): R;
	}
}
