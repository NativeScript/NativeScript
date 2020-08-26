import { assert } from 'chai';
import { parseURL, parseColor, parsePercentageOrLength, parseBackgroundPosition, parseBackground, parseSelector, AttributeSelectorTest, CSS3Parser, TokenObjectType, CSSNativeScript } from '@nativescript/core/css/parser';

import * as fs from 'fs';
import * as shadyCss from 'shady-css-parser';
import * as reworkCss from 'css';

const parseCss: any = require('parse-css');
const gonzales: any = require('gonzales');
const parserlib: any = require('parserlib');
const csstree: any = require('css-tree');

describe('css', () => {
	describe('parser', () => {
		function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, expected: T);
		function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, lastIndex: number, expected: T);
		function test<T>(parse: (value: string, lastIndex?: number) => T, value: string, lastIndexOrExpected: number | T, expected?: T) {
			if (arguments.length === 3) {
				it(`${lastIndexOrExpected ? 'can parse ' : 'can not parse '}"${value}"`, () => {
					const result = parse(value);
					assert.deepEqual(result, lastIndexOrExpected);
				});
			} else {
				it(`${expected ? 'can parse ' : 'can not parse '}"${value}" starting at index ${lastIndexOrExpected}`, () => {
					const result = parse(value, <number>lastIndexOrExpected);
					assert.deepEqual(result, expected);
				});
			}
		}

		describe('values', () => {
			describe('url', () => {
				test(parseURL, "url('smiley.gif')  ", { start: 0, end: 19, value: 'smiley.gif' });
				test(parseURL, '  url("frown.gif") ', { start: 0, end: 19, value: 'frown.gif' });
				test(parseURL, '  url(lucky.gif)', { start: 0, end: 16, value: 'lucky.gif' });
				test(parseURL, 'url(lucky.gif) #FF0000', 15, null);
				test(parseURL, 'repeat url(lucky.gif) #FF0000', 6, { start: 6, end: 22, value: 'lucky.gif' });
			});
			describe('color', () => {
				test(parseColor, '  #369 ', { start: 0, end: 7, value: 0xff336699 });
				test(parseColor, '  #456789 ', { start: 0, end: 10, value: 0xff456789 });
				test(parseColor, '  #85456789 ', { start: 0, end: 12, value: 0x85456789 });
				test(parseColor, '  rgb(255, 8, 128) ', { start: 0, end: 18, value: 0xffff0880 });
				test(parseColor, '  rgba(255, 8, 128, 0.5) ', { start: 0, end: 24, value: 0x80ff0880 });
				test(parseColor, '  hsl(330.9, 100%, 51.6%) ', { start: 0, end: 25, value: 0xffff0880 });
				test(parseColor, '  hsla(330.9, 100%, 51.6%, 0.5) ', { start: 0, end: 31, value: 0x80ff0880 });
				test(parseColor, '#FF0000 url(lucky.gif)', 8, null);
				test(parseColor, 'url(lucky.gif) #FF0000 repeat', 15, { start: 15, end: 23, value: 0xffff0000 });
			});
			describe('units', () => {
				test(parsePercentageOrLength, ' 100% ', { start: 0, end: 6, value: { value: 1, unit: '%' } });
				test(parsePercentageOrLength, ' 100px ', { start: 0, end: 7, value: { value: 100, unit: 'px' } });
				test(parsePercentageOrLength, ' 0.5px ', { start: 0, end: 7, value: { value: 0.5, unit: 'px' } });
				test(parsePercentageOrLength, ' 100dip ', { start: 0, end: 8, value: { value: 100, unit: 'dip' } });
				test(parsePercentageOrLength, ' 100 ', { start: 0, end: 5, value: { value: 100, unit: 'dip' } });
				test(parsePercentageOrLength, ' 100 ', { start: 0, end: 5, value: { value: 100, unit: 'dip' } });
				test(parsePercentageOrLength, ' +-12.2 ', null);
			});
			describe('position', () => {
				test(parseBackgroundPosition, 'left', { start: 0, end: 4, value: { x: 'left', y: 'center' } });
				test(parseBackgroundPosition, 'center', { start: 0, end: 6, value: { x: 'center', y: 'center' } });
				test(parseBackgroundPosition, 'right', { start: 0, end: 5, value: { x: 'right', y: 'center' } });
				test(parseBackgroundPosition, 'top', { start: 0, end: 3, value: { x: 'center', y: 'top' } });
				test(parseBackgroundPosition, 'bottom', { start: 0, end: 6, value: { x: 'center', y: 'bottom' } });
				test(parseBackgroundPosition, 'top 75px left 100px', {
					start: 0,
					end: 19,
					value: {
						x: { align: 'left', offset: { value: 100, unit: 'px' } },
						y: { align: 'top', offset: { value: 75, unit: 'px' } },
					},
				});
				test(parseBackgroundPosition, 'left 100px top 75px', {
					start: 0,
					end: 19,
					value: {
						x: { align: 'left', offset: { value: 100, unit: 'px' } },
						y: { align: 'top', offset: { value: 75, unit: 'px' } },
					},
				});
				test(parseBackgroundPosition, 'right center', { start: 0, end: 12, value: { x: 'right', y: 'center' } });
				test(parseBackgroundPosition, 'center left 100%', { start: 0, end: 16, value: { x: { align: 'left', offset: { value: 1, unit: '%' } }, y: 'center' } });
				test(parseBackgroundPosition, 'top 50% left 100%', { start: 0, end: 17, value: { x: { align: 'left', offset: { value: 1, unit: '%' } }, y: { align: 'top', offset: { value: 0.5, unit: '%' } } } });
				test(parseBackgroundPosition, 'bottom left 25%', { start: 0, end: 15, value: { x: { align: 'left', offset: { value: 0.25, unit: '%' } }, y: 'bottom' } });
				test(parseBackgroundPosition, 'top 100% left 25%', { start: 0, end: 17, value: { x: { align: 'left', offset: { value: 0.25, unit: '%' } }, y: { align: 'top', offset: { value: 1, unit: '%' } } } });
			});
			describe('background', () => {
				test(parseBackground, '   #996633  ', { start: 0, end: 12, value: { color: 0xff996633 } });
				test(parseBackground, '  #00ff00 url("smiley.gif") repeat-y ', { start: 0, end: 37, value: { color: 0xff00ff00, image: 'smiley.gif', repeat: 'repeat-y' } });
				test(parseBackground, '   url(smiley.gif)  no-repeat  top 50% left 100% #00ff00', {
					start: 0,
					end: 56,
					value: {
						color: 0xff00ff00,
						image: 'smiley.gif',
						repeat: 'no-repeat',
						position: {
							text: 'top 50% left 100% ',
							x: { align: 'left', offset: { value: 1, unit: '%' } },
							y: { align: 'top', offset: { value: 0.5, unit: '%' } },
						},
					},
				});
				test(parseBackground, '   url(smiley.gif)  no-repeat  top 50% left 100% / 100px 100px #00ff00', {
					start: 0,
					end: 70,
					value: {
						color: 0xff00ff00,
						image: 'smiley.gif',
						repeat: 'no-repeat',
						position: {
							text: 'top 50% left 100% ',
							x: { align: 'left', offset: { value: 1, unit: '%' } },
							y: { align: 'top', offset: { value: 0.5, unit: '%' } },
						},
						size: { x: { value: 100, unit: 'px' }, y: { value: 100, unit: 'px' } },
					},
				});
				test(parseBackground, '  linear-gradient(to right top) ', {
					start: 0,
					end: 32,
					value: {
						image: {
							angle: (Math.PI * 1) / 4,
							colors: [],
						},
					},
				});
				test(parseBackground, '  linear-gradient(45deg, #0000FF, #00FF00) ', {
					start: 0,
					end: 43,
					value: {
						image: {
							angle: (Math.PI * 1) / 4,
							colors: [{ argb: 0xff0000ff }, { argb: 0xff00ff00 }],
						},
					},
				});
				test(parseBackground, 'linear-gradient(0deg, blue, green 40%, red)', {
					start: 0,
					end: 43,
					value: {
						image: {
							angle: (Math.PI * 0) / 4,
							colors: [{ argb: 0xff0000ff }, { argb: 0xff008000, offset: { value: 0.4, unit: '%' } }, { argb: 0xffff0000 }],
						},
					},
				});
			});
		});

		describe('selectors', () => {
			test(parseSelector, `  listview#products.mark gridlayout:selected[row="2"] a> b   > c >d>e *[src]   `, {
				start: 0,
				end: 79,
				value: [
					[
						[
							{ type: '', identifier: 'listview' },
							{ type: '#', identifier: 'products' },
							{ type: '.', identifier: 'mark' },
						],
						' ',
					],
					[
						[
							{ type: '', identifier: 'gridlayout' },
							{ type: ':', identifier: 'selected' },
							{ type: '[]', property: 'row', test: '=', value: '2' },
						],
						' ',
					],
					[[{ type: '', identifier: 'a' }], '>'],
					[[{ type: '', identifier: 'b' }], '>'],
					[[{ type: '', identifier: 'c' }], '>'],
					[[{ type: '', identifier: 'd' }], '>'],
					[[{ type: '', identifier: 'e' }], ' '],
					[[{ type: '*' }, { type: '[]', property: 'src' }], undefined],
				],
			});
			test(parseSelector, '*', { start: 0, end: 1, value: [[[{ type: '*' }], undefined]] });
			test(parseSelector, 'button', { start: 0, end: 6, value: [[[{ type: '', identifier: 'button' }], undefined]] });
			test(parseSelector, '.login', { start: 0, end: 6, value: [[[{ type: '.', identifier: 'login' }], undefined]] });
			test(parseSelector, '#login', { start: 0, end: 6, value: [[[{ type: '#', identifier: 'login' }], undefined]] });
			test(parseSelector, ':hover', { start: 0, end: 6, value: [[[{ type: ':', identifier: 'hover' }], undefined]] });
			test(parseSelector, '[src]', { start: 0, end: 5, value: [[[{ type: '[]', property: 'src' }], undefined]] });
			test(parseSelector, `[src = "res://"]`, { start: 0, end: 16, value: [[[{ type: '[]', property: 'src', test: '=', value: `res://` }], undefined]] });
			(<AttributeSelectorTest[]>['=', '^=', '$=', '*=', '=', '~=', '|=']).forEach((attributeTest) => {
				test(parseSelector, `[src ${attributeTest} "val"]`, { start: 0, end: 12 + attributeTest.length, value: [[[{ type: '[]', property: 'src', test: attributeTest, value: 'val' }], undefined]] });
			});
			test(parseSelector, 'listview > .image', {
				start: 0,
				end: 17,
				value: [
					[[{ type: '', identifier: 'listview' }], '>'],
					[[{ type: '.', identifier: 'image' }], undefined],
				],
			});
			test(parseSelector, 'listview  .image', {
				start: 0,
				end: 16,
				value: [
					[[{ type: '', identifier: 'listview' }], ' '],
					[[{ type: '.', identifier: 'image' }], undefined],
				],
			});
			test(parseSelector, 'button:hover', {
				start: 0,
				end: 12,
				value: [
					[
						[
							{ type: '', identifier: 'button' },
							{ type: ':', identifier: 'hover' },
						],
						undefined,
					],
				],
			});
			test(parseSelector, 'listview>:selected image.product', {
				start: 0,
				end: 32,
				value: [
					[[{ type: '', identifier: 'listview' }], '>'],
					[[{ type: ':', identifier: 'selected' }], ' '],
					[
						[
							{ type: '', identifier: 'image' },
							{ type: '.', identifier: 'product' },
						],
						undefined,
					],
				],
			});
			test(parseSelector, 'button[testAttr]', {
				start: 0,
				end: 16,
				value: [
					[
						[
							{ type: '', identifier: 'button' },
							{ type: '[]', property: 'testAttr' },
						],
						undefined,
					],
				],
			});
			test(parseSelector, 'button#login[user][pass]:focused:hovered', {
				start: 0,
				end: 40,
				value: [
					[
						[
							{ type: '', identifier: 'button' },
							{ type: '#', identifier: 'login' },
							{ type: '[]', property: 'user' },
							{ type: '[]', property: 'pass' },
							{ type: ':', identifier: 'focused' },
							{ type: ':', identifier: 'hovered' },
						],
						undefined,
					],
				],
			});
		});

		describe('css3', () => {
			let themeCoreLightIos: string;
			let whatIsNewIos: string;

			before('Read the core.light.css file', () => {
				themeCoreLightIos = fs.readFileSync(`${__dirname}/assets/core.light.css`).toString();
				whatIsNewIos = fs.readFileSync(`${__dirname}/assets/what-is-new.ios.css`).toString();
			});

			describe('tokenizer', () => {
				it('the tokenizer roundtrips the core.light.css theme', () => {
					const cssparser = new CSS3Parser(themeCoreLightIos);
					const stylesheet = cssparser.tokenize();

					let original = themeCoreLightIos.replace(/\/\*([^\/]|\/[^\*])*\*\//g, '').replace(/\n/g, ' ');
					let roundtrip = stylesheet
						.map((m) => {
							if (!m) {
								return '';
							}

							if (typeof m === 'string') {
								return m;
							}

							return m.text;
						})
						.join('');

					let lastIndex = Math.min(original.length, roundtrip.length);
					for (var i = 0; i < lastIndex; i++) {
						if (original[i] !== roundtrip[i]) {
							assert.equal(roundtrip.substr(i, 50), original.substr(i, 50), 'Round-tripped CSS string differ at index: ' + i);
						}
					}

					assert.equal(roundtrip.length, original.length, 'Expected round-tripped string lengths to match.');
				});

				it('test what-is-new.ios.css from nativescript-marketplace-demo', () => {
					const parser = new CSS3Parser(whatIsNewIos);
					const tokens = parser.tokenize();
					assert.deepEqual(tokens, [
						{ type: TokenObjectType.atKeyword, text: 'import' },
						' ',
						{ type: TokenObjectType.url, text: "url('~/views/what-is-new-common.css')" },
						';',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'news-card' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'margin' },
						':',
						' ',
						{ type: TokenObjectType.number, text: '12' },
						' ',
						{ type: TokenObjectType.number, text: '12' },
						' ',
						{ type: TokenObjectType.number, text: '0' },
						' ',
						{ type: TokenObjectType.number, text: '12' },
						';',
						' ',
						'}',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'title' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'font-size' },
						':',
						' ',
						{ type: TokenObjectType.number, text: '14' },
						';',
						' ',
						'}',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'body' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'font-size' },
						':',
						' ',
						{ type: TokenObjectType.number, text: '14' },
						';',
						' ',
						'}',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'learn-more' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'font-size' },
						':',
						' ',
						{ type: TokenObjectType.number, text: '14' },
						';',
						' ',
						'}',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'date' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'font-size' },
						':',
						' ',
						{ type: TokenObjectType.number, text: '12' },
						';',
						' ',
						'}',
						' ',
						{ type: TokenObjectType.delim, text: '.' },
						{ type: TokenObjectType.ident, text: 'empty-placeholder' },
						' ',
						'{',
						' ',
						{ type: TokenObjectType.ident, text: 'vertical-align' },
						':',
						' ',
						{ type: TokenObjectType.ident, text: 'center' },
						';',
						' ',
						{ type: TokenObjectType.ident, text: 'text-align' },
						':',
						' ',
						{ type: TokenObjectType.ident, text: 'center' },
						';',
						' ',
						'}',
						undefined, // EOF
					]);
				});
			});

			describe('parser', () => {
				it('test what-is-new.ios.css from nativescript-marketplace-demo', () => {
					const parser = new CSS3Parser(whatIsNewIos);
					const stylesheet = parser.parseAStylesheet();
					// console.log(JSON.stringify(stylesheet, null, "\t"));
					// TODO: Assert...
				});

				it('.btn-primary{border-color:rgba(255,0,0,0)}', () => {
					const parser = new CSS3Parser('.btn-primary{border-color:rgba(255,0,0,0)}');
					const stylesheet = parser.parseAStylesheet();

					assert.deepEqual(
						stylesheet,
						{
							rules: [
								{
									type: 'qualified-rule',
									prelude: [
										{ type: 2, text: '.' },
										{ type: 6, text: 'btn-primary' },
									],
									block: { type: 9, text: '{border-color:rgba(255,0,0,0)}', associatedToken: '{', values: [{ type: 6, text: 'border-color' }, ':', { type: 14, name: 'rgba', text: 'rgba(255,0,0,0)', components: [{ type: 3, text: '255' }, ',', { type: 3, text: '0' }, ',', { type: 3, text: '0' }, ',', { type: 3, text: '0' }] }] },
								},
							],
						},
						"NativeScript parsed AST doesn't match."
					);

					const cssToNS = new CSSNativeScript();
					const nativescriptAst = cssToNS.parseStylesheet(stylesheet);

					assert.deepEqual(
						nativescriptAst,
						{
							type: 'stylesheet',
							stylesheet: {
								rules: [
									{
										type: 'rule',
										selectors: ['.btn-primary'],
										declarations: [
											{
												type: 'declaration',
												property: 'border-color',
												value: 'rgba(255,0,0,0)',
											},
										],
									},
								],
							},
						},
						"NativeScript AST mapped to rework doesn't match."
					);
				});
			});

			it('serialization', () => {
				const reworkAst = reworkCss.parse(themeCoreLightIos, { source: 'nativescript-theme-core/css/core.light.css' });
				fs.writeFileSync(
					'css/out/rework.css.json',
					JSON.stringify(reworkAst, (k, v) => (k === 'position' ? undefined : v), '  ')
				);

				const nsParser = new CSS3Parser(themeCoreLightIos);
				const nativescriptStylesheet = nsParser.parseAStylesheet();
				const cssToNS = new CSSNativeScript();
				const nativescriptAst = cssToNS.parseStylesheet(nativescriptStylesheet);

				fs.writeFileSync('css/out/nativescript.css.json', JSON.stringify(nativescriptAst, null, '  '));
			});

			it.skip('our parser is fast (this test is flaky, gc, opts.)', () => {
				function trapDuration(action: () => void) {
					const [startSec, startMSec] = process.hrtime();
					action();
					const [endSec, endMSec] = process.hrtime();

					return (endSec - startSec) * 1000 + (endMSec - startMSec) / 1000000;
				}
				const charCodeByCharCodeDuration = trapDuration(() => {
					let count = 0;
					for (let i = 0; i < themeCoreLightIos.length; i++) {
						count += themeCoreLightIos.charCodeAt(i);
					}
					assert.equal(count, 1218711);
				});
				const charByCharDuration = trapDuration(() => {
					let char;
					for (let i = 0; i < themeCoreLightIos.length; i++) {
						char = themeCoreLightIos.charAt(i);
					}
					assert.equal(char, '\n');
				});
				const compareCharIfDuration = trapDuration(() => {
					let char;
					let c = 0;
					for (let i = 0; i < themeCoreLightIos.length; i++) {
						char = themeCoreLightIos[i];
						if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
							c++;
						}
					}
					assert.equal(c, 8774);
				});
				const compareCharRegEx = /[a-zA-Z_]/;
				const compareCharRegExDuration = trapDuration(() => {
					let char;
					let c = 0;
					for (let i = 0; i < themeCoreLightIos.length; i++) {
						char = themeCoreLightIos[i];
						if (compareCharRegEx.test(char)) {
							c++;
						}
					}
					assert.equal(c, 8774);
				});
				const indexerDuration = trapDuration(() => {
					let char;
					for (let i = 0; i < themeCoreLightIos.length; i++) {
						char = themeCoreLightIos[i];
					}
					assert.equal(char, '\n');
				});
				const reworkDuration = trapDuration(() => {
					const ast = reworkCss.parse(themeCoreLightIos, { source: 'nativescript-theme-core/css/core.light.css' });
					// fs.writeFileSync("rework.css.json", JSON.stringify(ast, null, "\t"));
				});
				const shadyDuration = trapDuration(() => {
					const shadyParser = new shadyCss.Parser();
					const ast = shadyParser.parse(themeCoreLightIos);
					// fs.writeFileSync("shady.css.json", JSON.stringify(ast, null, "\t"));
				});
				const parseCssDuration = trapDuration(() => {
					const tokens = parseCss.tokenize(themeCoreLightIos);
					const ast = parseCss.parseAStylesheet(tokens);
					// fs.writeFileSync("parse.css.json", JSON.stringify(ast, null, "\t"));
				});
				const gonzalesDuration = trapDuration(() => {
					const ast = gonzales.srcToCSSP(themeCoreLightIos);
				});
				const parserlibDuration = trapDuration(() => {
					const parser = new parserlib.css.Parser({ starHack: true, underscoreHack: true });
					const ast = parser.parse(themeCoreLightIos);
				});
				const csstreeDuration = trapDuration(() => {
					const ast = csstree.parse(themeCoreLightIos);
				});
				const nativescriptToReworkAstDuration = trapDuration(() => {
					const cssparser = new CSS3Parser(themeCoreLightIos);
					const stylesheet = cssparser.parseAStylesheet();
					const cssNS = new CSSNativeScript();
					const ast = cssNS.parseStylesheet(stylesheet);
				});
				const nativescriptParseDuration = trapDuration(() => {
					const cssparser = new CSS3Parser(themeCoreLightIos);
					const stylesheet = cssparser.parseAStylesheet();
				});
				console.log(`          * Baseline perf: .charCodeAt: ${charCodeByCharCodeDuration}ms. .charAt: ${charByCharDuration}ms. []:${indexerDuration}ms. compareCharIf: ${compareCharIfDuration} compareCharRegEx: ${compareCharRegExDuration}`);
				console.log(`          * Parsers perf: rework: ${reworkDuration}ms. shady: ${shadyDuration}ms. parse-css: ${parseCssDuration}ms. gonzalesDuration: ${gonzalesDuration} parserlib: ${parserlibDuration} csstree: ${csstreeDuration} nativescript-parse: ${nativescriptParseDuration}ms. nativescriptToReworkAst: ${nativescriptToReworkAstDuration}`);
				assert.isAtMost(nativescriptParseDuration, reworkDuration / 3);
				assert.isAtMost(nativescriptParseDuration, shadyDuration / 1.5);
			});
		});
	});
});
