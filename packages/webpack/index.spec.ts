import { getConvertedExternals } from './index';

describe('index', () => {
	describe('getConvertedExternals', () => {
		it('returns empty array when nullable is passed', () => {
			const actualResult = getConvertedExternals(null);
			expect(actualResult).toEqual([]);
		});

		const testCases = [
			{
				input: ['nativescript-vue'],
				expectedOutput: [/^nativescript-vue((\/.*)|$)/],
			},
			{
				input: ['nativescript-vue', 'nativescript-angular'],
				expectedOutput: [/^nativescript-vue((\/.*)|$)/, /^nativescript-angular((\/.*)|$)/],
			},
		];

		testCases.forEach((testCase) => {
			it('converts passed strings to regular expressions', () => {
				const actualResult = getConvertedExternals(testCase.input);
				expect(actualResult).toEqual(testCase.expectedOutput);
			});

			it(`returns regular expressions which match expected modules and their subdirs, for input ${testCase.input}`, () => {
				['nativescript-vue', 'nativescript-vue/subdir', 'nativescript-vue/subdir/subdir-2'].forEach((testString) => {
					const regExpsExternals = getConvertedExternals(testCase.input);
					const result = regExpsExternals.some((regExp: RegExp) => !!regExp.exec(testString));
					expect(result).toBe(true, `String ${testString} does not match any of the regular expressions: ${regExpsExternals.join(', ')}`);
				});
			});

			it(`returns regular expressions which does not match expected modules and their subdirs, for input ${testCase.input}`, () => {
				['nativescript-facebook', 'nativescript-facebook/nativescript-vue', 'main-plugin/subdir/nativescript-vue', 'nativescript-vue-template-compiler', 'nativescript-vue-template-compiler/subdir'].forEach((testString) => {
					const regExpsExternals = getConvertedExternals(testCase.input);
					const result = regExpsExternals.some((regExp: RegExp) => !!regExp.exec(testString));
					expect(result).toBe(false, `String ${testString} matches some of the regular expressions: ${regExpsExternals.join(', ')}`);
				});
			});
		});
	});
});
