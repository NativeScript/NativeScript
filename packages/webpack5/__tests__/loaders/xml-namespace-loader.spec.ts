import dedent from 'ts-dedent';

import xmlNsLoader from '../../src/loaders/xml-namespace-loader';

const CODE_FILE = dedent`
	<Page xmlns="http://www.nativescript.org/tns.xsd">
			<StackLayout>
					<GridLayout xmlns:chart="nativescript-ui-chart">
							<chart:RadCartesianChart></chart:RadCartesianChart>
					</GridLayout>
					<GridLayout xmlns:chart="nativescript-ui-chart">
							<chart:RadCartesianChart></chart:RadCartesianChart>
					</GridLayout>
			</StackLayout>
	</Page>
`;

interface TestSetup {
	resolveMap: { [path: string]: string };
	expectedDeps: string[];
	expectedRegs: { name: string; path: string }[];
	ignore?: RegExp;
	assureNoDeps?: boolean;
	expectError?: boolean;
	expectWarnings?: number;
}

function getContext(
	done,
	{
		resolveMap,
		expectedDeps,
		expectedRegs,
		assureNoDeps,
		ignore,
		expectError,
		expectWarnings,
	}: TestSetup
) {
	const actualDeps: string[] = [];
	const actualWarnings: Error[] = [];
	let callbackCalled = false;

	return {
		rootContext: 'app',
		context: 'app/component',
		async() {
			return (error, source: string) => {
				if (callbackCalled) {
					throw new Error('Callback called more than once!');
				}
				callbackCalled = true;

				expectedDeps.forEach((expectedDep) => {
					expect(actualDeps).toContain(expectedDep);
				});

				expectedRegs.forEach(({ name, path }) => {
					expect(source).toContain(dedent`
					global.registerModule(
						'${name}',
						() => require("${path}")
					)
				`);
				});

				if (assureNoDeps) {
					expect(actualDeps.length).toBe(0);
					expect(source).not.toContain('global.registerModule');
				}

				if (expectWarnings) {
					expect(actualWarnings.length).toEqual(expectWarnings);
				}

				if (error && !expectError) {
					throw error;
				} else if (!error && expectError) {
					throw new Error('Error expected here');
				} else {
					done();
				}
			};
		},
		resolve: (
			context: string,
			request: string,
			callback: (err: Error, result: string) => void
		) => {
			request = request.replace(/\\/g, '/');
			if (resolveMap[request]) {
				callback(undefined, resolveMap[request]);
			} else {
				callback(new Error(`Module ${request} not found`), undefined);
			}
		},
		addDependency: (dep: string) => {
			actualDeps.push(dep);
		},
		emitWarning: (err: Error) => {
			actualWarnings.push(err);
		},
		emitError: (err: Error) => {
			//actualWarnings.push(err);
		},
		query: { ignore },
	};
}

describe('xml-namespace-loader', () => {
	it('with namespace pointing to files', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart': 'app/nativescript-ui-chart.js',
			'app/nativescript-ui-chart.xml': 'app/nativescript-ui-chart.xml',
			'app/nativescript-ui-chart.css': 'app/nativescript-ui-chart.css',
		};

		const expectedDeps = [
			'app/nativescript-ui-chart.js',
			'app/nativescript-ui-chart.xml',
			'app/nativescript-ui-chart.css',
		];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'app/nativescript-ui-chart.js' },
			{
				name: 'nativescript-ui-chart/RadCartesianChart',
				path: 'app/nativescript-ui-chart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.xml',
				path: 'app/nativescript-ui-chart.xml',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.css',
				path: 'app/nativescript-ui-chart.css',
			},
		];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
		});

		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files (with package.json)', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart':
				'app/nativescript-ui-chart/RadCartesianChart.js', //simulate package.json
			'app/nativescript-ui-chart/RadCartesianChart':
				'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml':
				'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css':
				'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = [
			'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css',
		];

		const expectedRegs = [
			{
				name: 'nativescript-ui-chart',
				path: 'app/nativescript-ui-chart/RadCartesianChart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart',
				path: 'app/nativescript-ui-chart/RadCartesianChart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.xml',
				path: 'app/nativescript-ui-chart/RadCartesianChart.xml',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.css',
				path: 'app/nativescript-ui-chart/RadCartesianChart.css',
			},
		];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
		});
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart/RadCartesianChart':
				'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml':
				'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css':
				'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = [
			'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css',
		];

		const expectedRegs = [
			{
				name: 'nativescript-ui-chart',
				path: 'app/nativescript-ui-chart/RadCartesianChart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart',
				path: 'app/nativescript-ui-chart/RadCartesianChart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.xml',
				path: 'app/nativescript-ui-chart/RadCartesianChart.xml',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.css',
				path: 'app/nativescript-ui-chart/RadCartesianChart.css',
			},
		];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
		});
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files - only XML and CSS', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart/RadCartesianChart.xml':
				'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css':
				'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = [
			'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css',
		];

		const expectedRegs = [
			{
				name: 'nativescript-ui-chart/RadCartesianChart.xml',
				path: 'app/nativescript-ui-chart/RadCartesianChart.xml',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart.css',
				path: 'app/nativescript-ui-chart/RadCartesianChart.css',
			},
		];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
		});
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with plugin path', (done) => {
		const resolveMap = {
			'nativescript-ui-chart': 'node_modules/nativescript-ui-chart/ui-chart.js',
		};

		const expectedDeps = [];

		const expectedRegs = [
			{
				name: 'nativescript-ui-chart',
				path: 'node_modules/nativescript-ui-chart/ui-chart.js',
			},
			{
				name: 'nativescript-ui-chart/RadCartesianChart',
				path: 'node_modules/nativescript-ui-chart/ui-chart.js',
			},
		];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
		});
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with ignored namespace should not add deps or register calls', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart': 'app/nativescript-ui-chart.js',
			'app/nativescript-ui-chart.xml': 'app/nativescript-ui-chart.xml',
			'app/nativescript-ui-chart.css': 'app/nativescript-ui-chart.css',
		};
		const expectedDeps = [];
		const expectedRegs = [];

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			ignore: /nativescript-ui-chart/,
			assureNoDeps: true,
		});

		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with XML declaration and Doctype does not fail', (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = dedent`
    	<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
		 	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    	<!-- comment.xml -->
    	<Page xmlns="http://www.nativescript.org/tns.xsd"></Page>
		`;

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			assureNoDeps: true,
		});

		xmlNsLoader.call(loaderContext, testXml);
	});

	it('with invalid XML fails', (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `<Page xmlns="http://www.nativescript.org/tns.xsd"></PageOpsWrongTagHere>`;

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			expectError: true,
		});

		xmlNsLoader.call(loaderContext, testXml);
	});

	it("doesn't throw with ios and android platform namespaces", (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = dedent`
			<Page xmlns="http://www.nativescript.org/tns.xsd">
				<ios:GridLayout />
				<ios:GridLayout></ios:GridLayout>
				<android:GridLayout />
				<android:GridLayout></android:GridLayout>
			</Page>
		`;

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			assureNoDeps: true,
		});

		xmlNsLoader.call(loaderContext, testXml);
	});

	it('throws with unbound namespace namespaces', (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `
        <Page xmlns="http://www.nativescript.org/tns.xsd">
            <custom1:CustomComponent />
            <custom2:CustomComponent />
        </Page>`;

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			expectError: true,
		});

		xmlNsLoader.call(loaderContext, testXml);
	});

	it("with '&&', '||', '<=' and '>=' in binding expression, emits warnings, but does not fail", (done) => {
		const resolveMap = {};

		const expectedDeps = [];

		const expectedRegs = [];

		const testXml = `
        <Page xmlns="http://www.nativescript.org/tns.xsd">
            <StackLayout xmlns:chart="nativescript-ui-chart">
                <TextField text="{{ var1 && var2 || var1 >= var2 || var2 <= var1 }}" />
            </StackLayout>
        </Page>`;

		const loaderContext = getContext(done, {
			resolveMap,
			expectedDeps,
			expectedRegs,
			expectWarnings: 1,
		});

		xmlNsLoader.call(loaderContext, testXml);
	});
});
