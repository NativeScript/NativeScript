import { printExpected, printReceived } from 'jest-matcher-utils';
import dedent from 'ts-dedent';

expect.extend({
	toHaveBeenWarned(received: string) {
		asserted.add(received);
		const passed = warnSpy.mock.calls
			.map((args) => args[1])
			.some((arg) => arg.indexOf(received) > -1);
		if (passed) {
			return {
				pass: true,
				message() {
					return `expected ${printReceived(received)} not to have been warned`;
				},
			};
		}

		const warnings = warnSpy.mock.calls.map((args) => args[1]).join('\n\n');
		return {
			pass: false,
			message() {
				return dedent`
					expected ${printExpected(received)} to have been warned.

					Actual warnings:

					${warnings}
				`;
			},
		};
	},
});

let warnSpy: any;
let asserted = new Set([]);
beforeEach(() => {
	asserted.clear();

	warnSpy = jest.spyOn(console, 'warn');

	warnSpy.mockImplementation(() => {});
});

afterEach(() => {
	const assertedArray = Array.from(asserted);
	const nonAssertedWarns = warnSpy.mock.calls
		.map((args) => args[1])
		.filter((received) => {
			return !assertedArray.some((assertedMessage) => {
				return received.indexOf(assertedMessage) > -1;
			});
		});

	warnSpy.mockRestore();

	if (nonAssertedWarns.length) {
		throw new Error(dedent`
			Test case printed unexpected warnings:

			${printReceived(nonAssertedWarns.join('\n\n'))}
		`);
	}
});
