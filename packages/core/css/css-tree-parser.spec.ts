import { cssTreeParse } from './css-tree-parser';
import { parse as reworkCssParse } from './reworkcss';

describe('CssTreeParser', () => {
	it('basic selector', () => {
		const testCase = '.test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].declarations[0].position.content).toBe(testCase);
		expect(reworkAST.stylesheet.rules[0].selectors[0]).toBe('.test');
		expect(reworkAST.stylesheet.rules[0].declarations[0].property).toBe('color');
		expect(reworkAST.stylesheet.rules[0].declarations[0].value).toBe('red');
	});

	it('empty rule', () => {
		const css = `.test {
	        color: red;
	        ;
	    }`;
		const reworkAST = reworkCssParse(css, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(css, 'file.css');
		expect(cssTreeAST.stylesheet.rules[0].declarations[0].position.content).toBe(css);
		expect(reworkAST.stylesheet.rules[0].selectors[0]).toBe('.test');
		expect(reworkAST.stylesheet.rules[0].declarations[0].property).toBe('color');
		expect(reworkAST.stylesheet.rules[0].declarations[0].value).toBe('red');
	});

	it('@keyframes', () => {
		const testCase = '.test { animation-name: test; } @keyframes test { from { background-color: red; } to { background-color: blue; } } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].declarations[0].position.content).toBe(testCase);
		expect(reworkAST.stylesheet.rules[0].selectors[0]).toBe('.test');
		expect(reworkAST.stylesheet.rules[0].declarations[0].property).toBe('animation-name');
		expect(reworkAST.stylesheet.rules[0].declarations[0].value).toBe('test');
	});

	it('@media', () => {
		const testCase = '@media screen and (max-width: 600px) { body { background-color: olive; } } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@supports', () => {
		const testCase = '@supports not (display: grid) { div { float: right; } } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@page', () => {
		const testCase = '@page :first { margin: 2cm; } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@document', () => {
		const testCase = '@document url("https://www.example.com/") { h1 { color: green; } } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@font-face', () => {
		const testCase = '@font-face { font-family: "Open Sans"; src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"), url("/fonts/OpenSans-Regular-webfont.woff") format("woff"); } .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@import', () => {
		const testCase = '@import url(\'landscape.css\') screen and (orientation:landscape); @import url("fineprint.css") print; .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@charset', () => {
		const testCase = '@charset "utf-8"; .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});

	it('@namespace', () => {
		const testCase = '@namespace svg url(http://www.w3.org/2000/svg); .test { color: red; }';
		const reworkAST = reworkCssParse(testCase, { source: 'file.css' });
		const cssTreeAST = cssTreeParse(testCase, 'file.css');

		expect(cssTreeAST.stylesheet.rules[0].position.content).toBe(testCase);
	});
});
