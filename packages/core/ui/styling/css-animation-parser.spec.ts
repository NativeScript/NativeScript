import { CoreTypes } from '../../core-types';
import type { KeyframeAnimationInfo, KeyframeInfo } from '../animation';
import { CssAnimationParser, keyframeAnimationsFromCSSProperty } from './css-animation-parser';
import { cssTreeParse } from '../../css/css-tree-parser';

describe('css-animation-parser', () => {
	describe('shorthand-property-parser', () => {
		// helper functions
		function testSingleAnimation(css: string): KeyframeAnimationInfo {
			const animations: KeyframeAnimationInfo[] = [];
			keyframeAnimationsFromCSSProperty(css, animations);

			return animations[0];
		}

		function testMultipleAnimations(css: string): KeyframeAnimationInfo[] {
			const animations: KeyframeAnimationInfo[] = [];
			keyframeAnimationsFromCSSProperty(css, animations);

			return animations;
		}

		it('empty', () => {
			const animation = testSingleAnimation('');
			expect(animation).toBeUndefined();
		});

		// times to test for
		const times = {
			'0s': 0,
			'0ms': 0,
			'250ms': 250,
			'0.5s': 500,
			'1500ms': 1500,
			'1s': 1000,
			'3s': 3000,
		};

		const curves = {
			ease: CoreTypes.AnimationCurve.ease,
			linear: CoreTypes.AnimationCurve.linear,
			'ease-in': CoreTypes.AnimationCurve.easeIn,
			'ease-out': CoreTypes.AnimationCurve.easeOut,
			'ease-in-out': CoreTypes.AnimationCurve.easeInOut,
			spring: CoreTypes.AnimationCurve.spring,
			'cubic-bezier(0.1, 1.0, 0.5, 0.5)': CoreTypes.AnimationCurve.cubicBezier(0.1, 1.0, 0.5, 0.5),
			'cubic-bezier(0.42, 0.0, 1.0, 1.0);': CoreTypes.AnimationCurve.cubicBezier(0.42, 0.0, 1.0, 1.0),
		};

		it('parses duration', () => {
			Object.entries(times).forEach(([timeString, ms]) => {
				expect(testSingleAnimation(`${timeString}`).duration).toBe(ms);
			});
		});

		it('parses delay', () => {
			Object.entries(times).forEach(([timeString, ms]) => {
				const animation = testSingleAnimation(`0s ${timeString}`);
				expect(animation.duration).toBe(0);
				expect(animation.delay).toBe(ms);
			});
		});

		it('parses duration and delay', () => {
			Object.entries(times).forEach(([timeString, ms]) => {
				const animation = testSingleAnimation(`${timeString} ${timeString}`);
				expect(animation.duration).toBe(ms);
				expect(animation.delay).toBe(ms);
			});
		});

		it('parses curve', () => {
			Object.entries(curves).forEach(([curveString, curve]) => {
				const animation = testSingleAnimation(`${curveString}`);
				expect(animation.curve).toEqual(curve);
			});
		});

		it('parses duration, curve and delay', () => {
			Object.entries(curves).forEach(([curveString, curve]) => {
				const animation1 = testSingleAnimation(`225ms 300ms ${curveString}`);
				expect(animation1.duration).toBe(225);
				expect(animation1.delay).toBe(300);
				expect(animation1.curve).toEqual(curve);

				// curve and delay can be swapped
				const animation2 = testSingleAnimation(`225ms ${curveString} 300ms`);
				expect(animation2.duration).toBe(225);
				expect(animation2.delay).toBe(300);
				expect(animation2.curve).toEqual(curve);
			});
		});

		it('parses iteration count', () => {
			expect(testSingleAnimation(`0s 0s ease 2`).iterations).toBe(2);
			expect(testSingleAnimation(`0s 0s ease 2.5`).iterations).toBe(2.5);
			expect(testSingleAnimation(`0s 0s ease infinite`).iterations).toBe(Infinity);
			expect(testSingleAnimation(`2`).iterations).toBe(2);
			expect(testSingleAnimation(`2.5`).iterations).toBe(2.5);
			expect(testSingleAnimation(`infinite`).iterations).toBe(Infinity);
			expect(testSingleAnimation(`1s 2`).iterations).toBe(2);
			expect(testSingleAnimation(`1s 2.5`).iterations).toBe(2.5);
			expect(testSingleAnimation(`1s infinite`).iterations).toBe(Infinity);
			expect(testSingleAnimation(`ease 2`).iterations).toBe(2);
			expect(testSingleAnimation(`ease 2.5`).iterations).toBe(2.5);
			expect(testSingleAnimation(`ease infinite`).iterations).toBe(Infinity);
		});

		it('parses direction', () => {
			expect(testSingleAnimation(`1s`).isReverse).toBe(false);
			expect(testSingleAnimation(`1s normal`).isReverse).toBe(false);
			expect(testSingleAnimation(`1s reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s 1s reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s 1s ease reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s 1s ease 2 reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s 1s ease infinite reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s ease reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s ease 1s reverse`).isReverse).toBe(true);
			expect(testSingleAnimation(`1s ease 1s 2 reverse`).isReverse).toBe(true);

			// unsupported values should still work
			expect(testSingleAnimation(`1s alternate`).isReverse).toBe(false);
			expect(testSingleAnimation(`1s alternate-reverse`).isReverse).toBe(false);
		});

		it('parses fill-mode', () => {
			expect(testSingleAnimation(`1s`).isForwards).toBe(false);
			expect(testSingleAnimation(`1s none`).isForwards).toBe(false);
			expect(testSingleAnimation(`1s backwards`).isForwards).toBe(false);

			expect(testSingleAnimation(`1s both`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s 1s forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s 1s ease forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s 1s ease 2 forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s 1s ease infinite forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s ease forwards`).isForwards).toBe(true);
			expect(testSingleAnimation(`1s ease 1s forwards`).isForwards).toBe(true);
		});

		it('parses play-state', () => {
			// TODO: implement play-state?

			expect(testSingleAnimation(`1s`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s running`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s 1s paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s 1s ease paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s 1s ease 2 paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s 1s ease infinite paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s ease paused`)).not.toBeUndefined();
			expect(testSingleAnimation(`1s ease 1s paused`)).not.toBeUndefined();
		});

		it('parses animation name', () => {
			expect(testSingleAnimation(`1s`).name).toBe('');
			expect(testSingleAnimation(`1s fade`).name).toBe('fade');
			expect(testSingleAnimation(`1s 'fade'`).name).toBe('fade');
			expect(testSingleAnimation(`1s "fade"`).name).toBe('fade');

			expect(testSingleAnimation(`1s fade-in`).name).toBe('fade-in');
			expect(testSingleAnimation(`1s 'fade-in'`).name).toBe('fade-in');
			expect(testSingleAnimation(`1s "fade-in"`).name).toBe('fade-in');

			expect(testSingleAnimation(`1s fade_in`).name).toBe('fade_in');
			expect(testSingleAnimation(`1s 'fade_in'`).name).toBe('fade_in');
			expect(testSingleAnimation(`1s "fade_in"`).name).toBe('fade_in');
		});

		it('parses MDN example: 3s ease-in 1s 2 reverse both paused slidein', () => {
			const animation = testSingleAnimation(`3s ease-in 1s 2 reverse both paused slidein`);
			expect(animation.duration).toBe(3000);
			expect(animation.delay).toBe(1000);
			expect(animation.curve).toBe(CoreTypes.AnimationCurve.easeIn);
			expect(animation.iterations).toBe(2);
			expect(animation.isReverse).toBe(true);
			expect(animation.isForwards).toBe(true);
			expect(animation.name).toBe('slidein');
		});

		it('parses MDN example: 3s linear 1s slidein', () => {
			const animation = testSingleAnimation(`3s linear 1s slidein`);
			expect(animation.duration).toBe(3000);
			expect(animation.delay).toBe(1000);
			expect(animation.curve).toBe(CoreTypes.AnimationCurve.linear);
			expect(animation.name).toBe('slidein');
		});

		it('parses MDN example: 3s linear slidein, 3s ease-out 5s slideout', () => {
			const [animation1, animation2] = testMultipleAnimations(`3s linear slidein, 3s ease-out 5s slideout`);

			expect(animation1.duration).toBe(3000);
			expect(animation1.curve).toBe(CoreTypes.AnimationCurve.linear);
			expect(animation1.name).toBe('slidein');

			expect(animation2.duration).toBe(3000);
			expect(animation2.delay).toBe(5000);
			expect(animation2.curve).toBe(CoreTypes.AnimationCurve.easeOut);
			expect(animation2.name).toBe('slideout');
		});

		it('parses SPEC example: 3s none backwards', () => {
			const animation = testSingleAnimation(`3s none backwards`);
			expect(animation.duration).toBe(3000);
			expect(animation.isForwards).toBe(false);
			expect(animation.name).toBe('backwards');
		});

		it('parses SPEC example: 3s backwards', () => {
			const animation = testSingleAnimation(`3s backwards`);
			expect(animation.duration).toBe(3000);
			expect(animation.isForwards).toBe(false);
			expect(animation.name).toBe('');
		});

		it('does not throw on invalid values', () => {
			// prettier-ignore
			const invalidValues = [
				'asd',
				'$#-1401;lk',
				'1 1 1 1 1 1 1 1 1 1',
				'1s 1s 1s 1s',
				',,,,',
				'$,1s-_1:s>',
				Infinity.toString(),
				NaN.toString(),
				null,
				undefined
			];

			invalidValues.forEach((value) => {
				expect(() => testSingleAnimation(value)).not.toThrow();
			});
		});
	});

	describe('keyframe-parser', () => {
		// helper function
		function testKeyframesArrayFromCSS(css: string, expectedName?: string): KeyframeInfo[] {
			const ast = cssTreeParse(css, 'test.css');
			const rules = ast.stylesheet.rules;
			const firstRule = rules[0];

			expect(rules.length).toBe(1);
			expect(firstRule.type).toBe('keyframes');

			const name = firstRule.name;
			const keyframes = firstRule.keyframes;

			if (expectedName) {
				expect(name).toBe(expectedName);
			}

			return CssAnimationParser.keyframesArrayFromCSS(keyframes);
		}

		it('parses "from" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					from { opacity: 0; }
				}`,
				'fade'
			);

			expect(res.length).toBe(1);

			const [from] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);
		});

		it('parses "to" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					to { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(1);

			const [to] = res;
			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses "from/to" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					from { opacity: 0; }
					to { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(2);

			const [from, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses "0%" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					0% { opacity: 0; }
				}`,
				'fade'
			);

			expect(res.length).toBe(1);

			const [from] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);
		});

		it('parses "100%" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					100% { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(1);

			const [to] = res;
			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses "0%/100%" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					0% { opacity: 0; }
					100% { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(2);

			const [from, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses "via" keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					50% { opacity: 0.5; }
				}`,
				'fade'
			);

			expect(res.length).toBe(1);

			const [via] = res;
			expect(via.duration).toBe(0.5);
			expect(via.declarations.length).toBe(1);
			expect(via.declarations[0].property).toBe('opacity');
			expect(via.declarations[0].value).toBe(0.5);
		});

		it('parses multiple keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					0% { opacity: 0; }
					50% { opacity: 0.5; }
					100% { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(3);

			const [from, via, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(via.duration).toBe(0.5);
			expect(via.declarations.length).toBe(1);
			expect(via.declarations[0].property).toBe('opacity');
			expect(via.declarations[0].value).toBe(0.5);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses multiple keyframes with mixed stops', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					from { opacity: 0; }
					50% { opacity: 0.5; }
					to { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(3);

			const [from, via, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(via.duration).toBe(0.5);
			expect(via.declarations.length).toBe(1);
			expect(via.declarations[0].property).toBe('opacity');
			expect(via.declarations[0].value).toBe(0.5);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses duplicate keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					0% { opacity: 0; }
					50% { opacity: 0.5; }
					50% { translateX: 100; }
					100% { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(3);

			const [from, via, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(via.duration).toBe(0.5);
			expect(via.declarations.length).toBe(2);
			expect(via.declarations[0].property).toBe('opacity');
			expect(via.declarations[0].value).toBe(0.5);
			expect(via.declarations[1].property).toBe('translateX');
			expect(via.declarations[1].value).toBe(100);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});

		it('parses timing functions in keyframes', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					from { opacity: 0; animation-timing-function: ease-in; }
					to { opacity: 1; }
				}`,
				'fade'
			);

			expect(res.length).toBe(2);

			const [from, to] = res;
			expect(from.curve).toBe(CoreTypes.AnimationCurve.easeIn);
			expect(to.curve).not.toBeDefined();
		});

		it('sorts multiple keyframes with mixed order', () => {
			const res = testKeyframesArrayFromCSS(
				`@keyframes fade {
					100% { opacity: 1; }
					0% { opacity: 0; }
					50% { opacity: 0.5; }
				}`,
				'fade'
			);

			expect(res.length).toBe(3);

			const [from, via, to] = res;
			expect(from.duration).toBe(0);
			expect(from.declarations.length).toBe(1);
			expect(from.declarations[0].property).toBe('opacity');
			expect(from.declarations[0].value).toBe(0);

			expect(via.duration).toBe(0.5);
			expect(via.declarations.length).toBe(1);
			expect(via.declarations[0].property).toBe('opacity');
			expect(via.declarations[0].value).toBe(0.5);

			expect(to.duration).toBe(1);
			expect(to.declarations.length).toBe(1);
			expect(to.declarations[0].property).toBe('opacity');
			expect(to.declarations[0].value).toBe(1);
		});
	});
});
