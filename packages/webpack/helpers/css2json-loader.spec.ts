import css2jsonLoader from './css2json-loader';

const importTestCases = [`@import url("custom.css");`, `@import url('custom.css');`, `@import url('custom.css') print;`, `@import url("custom.css") print;`, `@import url('custom.css') screen and (orientation:landscape);`, `@import url("custom.css") screen and (orientation:landscape);`, `@import 'custom.css';`, `@import "custom.css";`, `@import 'custom.css' screen;`, `@import "custom.css" screen;`, `@import url(custom.css);`];

const someCSS = `
.btn {
    background-color: #7f9
}
`;

describe('css2jsonLoader', () => {
	it('converts CSS to JSON', (done) => {
		const loaderContext = {
			callback: (error, source: string, map) => {
				expect(source).toContain(`{"type":"declaration","property":"background-color","value":"#7f9"}`);

				done();
			},
		};

		css2jsonLoader.call(loaderContext, someCSS);
	});

	importTestCases.forEach((importTestCase) => {
		it(`handles: ${importTestCase}`, (done) => {
			const loaderContext = {
				callback: (error, source: string, map) => {
					expect(source).toContain(`global.registerModule("./custom.css", () => require("./custom.css"))`);
					expect(source).toContain(`{"type":"declaration","property":"background-color","value":"#7f9"}`);

					done();
				},
			};

			css2jsonLoader.call(loaderContext, importTestCase + someCSS);
		});
	});

	it('inlines css2json loader in imports if option is provided', (done) => {
		const loaderContext = {
			callback: (error, source: string, map) => {
				expect(source).toContain(`global.registerModule("./custom.css", () => require("!@nativescript/webpack/helpers/css2json-loader?useForImports!./custom.css"))`);
				expect(source).toContain(`{"type":"declaration","property":"background-color","value":"#7f9"}`);

				done();
			},
			query: { useForImports: true },
		};

		css2jsonLoader.call(loaderContext, `@import url("custom.css");` + someCSS);
	});

	it('registers modules for paths starting with ~', (done) => {
		const loaderContext = {
			callback: (error, source: string, map) => {
				expect(source).toContain(`global.registerModule("~custom.css", () => require("custom.css"))`);
				expect(source).toContain(`global.registerModule("custom.css", () => require("custom.css"))`);
				expect(source).toContain(`{"type":"declaration","property":"background-color","value":"#7f9"}`);

				done();
			},
		};

		css2jsonLoader.call(loaderContext, `@import url("~custom.css");` + someCSS);
	});
});
