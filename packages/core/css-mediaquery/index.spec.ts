import { MediaQueryType, matchQuery, parseQuery } from '.';

describe('css-mediaquery', () => {
	describe('parseQuery', () => {
		it('should parse media queries without expressions', () => {
			expect(parseQuery('screen')).toEqual([
				{
					inverse: false,
					type: MediaQueryType.screen,
					features: [],
				},
			]);

			expect(parseQuery('not screen')).toEqual([
				{
					inverse: true,
					type: MediaQueryType.screen,
					features: [],
				},
			]);
		});

		it('should throw a SyntaxError when a media query is invalid', () => {
			expect(() => parseQuery('some crap')).toThrow(SyntaxError);
			expect(() => parseQuery('48em')).toThrow(SyntaxError);
			expect(() => parseQuery('screen and crap')).toThrow(SyntaxError);
			expect(() => parseQuery('screen and (48em)')).toThrow(SyntaxError);
			expect(() => parseQuery('screen and (foo:)')).toThrow(SyntaxError);
			expect(() => parseQuery('()')).toThrow(SyntaxError);
			expect(() => parseQuery('(foo) (bar)')).toThrow(SyntaxError);
			expect(() => parseQuery('(foo:) and (bar)')).toThrow(SyntaxError);
		});
	});

	describe('range syntax', () => {
		it('parses a comparison with the feature on either side', () => {
			expect(parseQuery('(width >= 600px)')[0].features).toEqual([{ modifier: 'min', property: 'width', value: '600px' }]);
			expect(parseQuery('(width < 600px)')[0].features).toEqual([{ modifier: 'lt', property: 'width', value: '600px' }]);
			expect(parseQuery('(600px < width)')[0].features).toEqual([{ modifier: 'gt', property: 'width', value: '600px' }]);
			expect(parseQuery('(600px >= height)')[0].features).toEqual([{ modifier: 'max', property: 'height', value: '600px' }]);
			expect(parseQuery('(width = 600px)')[0].features).toEqual([{ modifier: undefined, property: 'width', value: '600px' }]);
		});

		it('parses a range with both bounds', () => {
			expect(parseQuery('(400px <= width < 700px)')[0].features).toEqual([
				{ modifier: 'min', property: 'width', value: '400px' },
				{ modifier: 'lt', property: 'width', value: '700px' },
			]);
			expect(parseQuery('(700px > width >= 400px)')[0].features).toEqual([
				{ modifier: 'lt', property: 'width', value: '700px' },
				{ modifier: 'min', property: 'width', value: '400px' },
			]);
		});

		it('rejects malformed ranges', () => {
			expect(() => parseQuery('(400px < width > 700px)')).toThrow(SyntaxError);
			expect(() => parseQuery('(400px = width = 700px)')).toThrow(SyntaxError);
			expect(() => parseQuery('(400px < 700px)')).toThrow(SyntaxError);
			expect(() => parseQuery('(width >= )')).toThrow(SyntaxError);
		});

		it('matches inclusive and exclusive bounds', () => {
			expect(matchQuery('(width >= 600px)', { width: 600 })).toBe(true);
			expect(matchQuery('(width > 600px)', { width: 600 })).toBe(false);
			expect(matchQuery('(width < 600px)', { width: 599 })).toBe(true);
			expect(matchQuery('(width < 600px)', { width: 600 })).toBe(false);
			expect(matchQuery('(400px <= width < 700px)', { width: 400 })).toBe(true);
			expect(matchQuery('(400px <= width < 700px)', { width: 700 })).toBe(false);
		});

		it('combines with media types, and, not and lists', () => {
			expect(matchQuery('screen and (width >= 600px) and (orientation: portrait)', { type: MediaQueryType.screen, width: 800, orientation: 'portrait' })).toBe(true);
			expect(matchQuery('not all and (width >= 600px)', { width: 800 })).toBe(false);
			expect(matchQuery('(width < 100px), (height >= 600px)', { width: 800, height: 600 })).toBe(true);
		});
	});

	describe('rem and em lengths', () => {
		it('are the initial font size, 16', () => {
			// Tailwind's `md` breakpoint.
			expect(matchQuery('(width >= 48rem)', { width: 768 })).toBe(true);
			expect(matchQuery('(width >= 48rem)', { width: 767 })).toBe(false);
			expect(matchQuery('(max-width: 2em)', { width: 32 })).toBe(true);
			expect(matchQuery('(max-width: 2em)', { width: 33 })).toBe(false);
		});
	});

	describe('matchQuery', () => {
		describe('Equality check', () => {
			it('orientation: should return true for a correct match (===)', () => {
				expect(matchQuery('(orientation: portrait)', { orientation: 'portrait' })).toBe(true);
			});

			it('orientation: should return false for an incorrect match (===)', () => {
				expect(matchQuery('(orientation: landscape)', { orientation: 'portrait' })).toBe(false);
			});

			it('prefers-color-scheme: should return true for a correct match (===)', () => {
				expect(matchQuery('(prefers-color-scheme: dark)', { 'prefers-color-scheme': 'dark' })).toBe(true);
			});

			it('prefers-color-scheme: should return false for an incorrect match (===)', () => {
				expect(matchQuery('(prefers-color-scheme: light)', { 'prefers-color-scheme': 'dark' })).toBe(false);
			});

			it('width: should return true for a correct match', () => {
				expect(matchQuery('(width: 800px)', { width: 800 })).toBe(true);
			});

			it('width: should return false for an incorrect match', () => {
				expect(matchQuery('(width: 800px)', { width: 900 })).toBe(false);
			});
		});

		describe('Type', () => {
			it('should return true for a correct match', () => {
				expect(matchQuery('screen', { type: MediaQueryType.screen })).toBe(true);
			});

			it('should return false for an incorrect match', () => {
				expect(
					matchQuery('screen and (orientation: portrait)', {
						type: MediaQueryType.print,
						orientation: 'portrait',
					}),
				).toBe(false);
			});

			it('should return false for a media query without a type when type is specified in the value object', () => {
				expect(matchQuery('(min-width: 500px)', { type: MediaQueryType.screen })).toBe(false);
			});

			it('should return true for a media query without a type when type is not specified in the value object', () => {
				expect(matchQuery('(min-width: 500px)', { width: 700 })).toBe(true);
			});
		});

		describe('Not', () => {
			it('should return false when theres a match on a `not` query', () => {
				expect(
					matchQuery('not screen and (orientation: portrait)', {
						type: MediaQueryType.screen,
						orientation: 'landscape',
					}),
				).toBe(false);
			});

			it('should not disrupt an OR query', () => {
				expect(
					matchQuery('not screen and (color), screen and (min-height: 48em)', {
						type: MediaQueryType.screen,
						height: 1000,
					}),
				).toBe(true);
			});

			it('should return false for when type === all', () => {
				expect(
					matchQuery('not all and (min-width: 48em)', {
						type: MediaQueryType.all,
						width: 1000,
					}),
				).toBe(false);
			});

			it('should return true for inverted value', () => {
				expect(matchQuery('not screen and (min-width: 48px)', { width: 24 })).toBe(true);
			});
		});
	});
});
