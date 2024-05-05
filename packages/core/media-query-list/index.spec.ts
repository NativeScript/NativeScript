import { matchMedia, validateMediaQuery, MediaQueryList } from '.';
import { Screen } from '../platform';

describe('media-query-list', () => {
	const { widthDIPs } = Screen.mainScreen;

	describe('validateMediaQuery', () => {
		it('should return true for a correct match', () => {
			expect(validateMediaQuery(`only screen and (max-width: ${widthDIPs})`)).toBe(true);
		});

		it('should return false for an incorrect match', () => {
			expect(validateMediaQuery(`only screen and (max-width: ${widthDIPs - 1})`)).toBe(false);
		});
	});

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

		it('should throw when accessing matches and media getters', () => {
			const error = new TypeError('Illegal invocation');

			expect(() => MediaQueryList.prototype.matches).toThrow(error);
			expect(() => MediaQueryList.prototype.media).toThrow(error);
		});

		it('should throw when accessing or modifying onchange event', () => {
			const error = new TypeError('Illegal invocation');

			expect(() => MediaQueryList.prototype.onchange).toThrow(error);
			expect(() => {
				MediaQueryList.prototype.onchange = null;
			}).toThrow(error);
		});

		it('should throw when adding or removing event listeners', () => {
			const eventCallback = (data) => {};
			const error = new TypeError('Illegal invocation');

			expect(() => MediaQueryList.prototype.addEventListener('change', eventCallback)).toThrow(error);
			expect(() => MediaQueryList.prototype.removeEventListener('change', eventCallback)).toThrow(error);
			expect(() => MediaQueryList.prototype.addListener(eventCallback)).toThrow(error);
			expect(() => MediaQueryList.prototype.removeListener(eventCallback)).toThrow(error);
		});
	});
});
