import { checkIfMediaQueryMatches } from '.';
import { Screen } from '../platform';

describe('css-mediaquery', () => {
	const { widthDIPs } = Screen.mainScreen;

	describe('checkIfMediaQueryMatches', () => {
		it('should return true for a correct match', () => {
			expect(checkIfMediaQueryMatches(`only screen and (max-width: ${widthDIPs})`)).toBe(true);
		});

		it('should return false for an incorrect match', () => {
			expect(checkIfMediaQueryMatches(`only screen and (max-width: ${widthDIPs - 1})`)).toBe(false);
		});
	});
});
