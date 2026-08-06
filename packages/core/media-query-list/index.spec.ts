import { matchMedia, MediaQueryList } from '.';
import { Screen } from '../platform';

describe('media-query-list', () => {
	const { widthDIPs } = Screen.mainScreen;

	describe('matchMedia', () => {
		it('should return a MediaQueryList that matches the css media query', () => {
			const matchMediaWrapper = () => matchMedia(`only screen and (max-width: ${widthDIPs})`);

			expect(matchMediaWrapper).not.toThrow();

			const mql = matchMediaWrapper();

			expect(mql).toBeInstanceOf(MediaQueryList);
			expect(() => mql.matches).not.toThrow();
			expect(mql.matches).toBe(true);
		});

		it('should return a MediaQueryList that does not match the css media query', () => {
			const matchMediaWrapper = () => matchMedia(`only screen and (max-width: ${widthDIPs - 1})`);

			expect(matchMediaWrapper).not.toThrow();

			const mql = matchMediaWrapper();

			expect(mql).toBeInstanceOf(MediaQueryList);
			expect(() => mql.matches).not.toThrow();
			expect(mql.matches).toBe(false);
		});
	});

	describe('MediaQueryList', () => {
		it('should throw when calling constructor', () => {
			expect(() => new MediaQueryList()).toThrow(new TypeError('Illegal constructor'));
		});
	});
});
