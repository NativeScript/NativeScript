import xmlNsLoader from './xml-namespace-loader';
import { convertSlashesInPath } from './projectHelpers';

const CODE_FILE = `
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

function getContext(done: DoneFn, { resolveMap, expectedDeps, expectedRegs, assureNoDeps, ignore, expectError, expectWarnings }: TestSetup) {
	const actualDeps: string[] = [];
	const actualWarnings: Error[] = [];
	let callbackCalled = false;

	const loaderContext = {
		rootContext: 'app',
		context: 'app/component',
		async: () => (error, source: string) => {
			if (callbackCalled) {
				done.fail('Callback called more than once!');
			}
			callbackCalled = true;

			expectedDeps.forEach((expectedDep) => expect(actualDeps).toContain(expectedDep));

			expectedRegs.forEach(({ name, path }) => {
				const regCode = `global.registerModule("${name}", function() { return require("${path}"); });`;
				expect(source).toContain(regCode);
			});

			if (assureNoDeps) {
				expect(actualDeps.length).toBe(0);
				expect(source).not.toContain('global.registerModule');
			}

			if (expectWarnings) {
				expect(actualWarnings.length).toEqual(expectWarnings);
			}

			if (error && !expectError) {
				done.fail(error);
			} else if (!error && expectError) {
				done.fail('Error expected here');
			} else {
				done();
			}
		},
		resolve: (context: string, request: string, callback: (err: Error, result: string) => void) => {
			request = convertSlashesInPath(request);
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
		query: { ignore },
	};

	return loaderContext;
}

describe('XmlNamespaceLoader', () => {
	it('with namespace pointing to files', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart': 'app/nativescript-ui-chart.js',
			'app/nativescript-ui-chart.xml': 'app/nativescript-ui-chart.xml',
			'app/nativescript-ui-chart.css': 'app/nativescript-ui-chart.css',
		};

		const expectedDeps = ['app/nativescript-ui-chart.js', 'app/nativescript-ui-chart.xml', 'app/nativescript-ui-chart.css'];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'app/nativescript-ui-chart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart', path: 'app/nativescript-ui-chart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.xml', path: 'app/nativescript-ui-chart.xml' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.css', path: 'app/nativescript-ui-chart.css' },
		];

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });

		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files (with package.json)', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart': 'app/nativescript-ui-chart/RadCartesianChart.js', //simulate package.json
			'app/nativescript-ui-chart/RadCartesianChart': 'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml': 'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css': 'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = ['app/nativescript-ui-chart/RadCartesianChart.js', 'app/nativescript-ui-chart/RadCartesianChart.xml', 'app/nativescript-ui-chart/RadCartesianChart.css'];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'app/nativescript-ui-chart/RadCartesianChart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart', path: 'app/nativescript-ui-chart/RadCartesianChart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.xml', path: 'app/nativescript-ui-chart/RadCartesianChart.xml' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.css', path: 'app/nativescript-ui-chart/RadCartesianChart.css' },
		];

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart/RadCartesianChart': 'app/nativescript-ui-chart/RadCartesianChart.js',
			'app/nativescript-ui-chart/RadCartesianChart.xml': 'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css': 'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = ['app/nativescript-ui-chart/RadCartesianChart.js', 'app/nativescript-ui-chart/RadCartesianChart.xml', 'app/nativescript-ui-chart/RadCartesianChart.css'];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'app/nativescript-ui-chart/RadCartesianChart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart', path: 'app/nativescript-ui-chart/RadCartesianChart.js' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.xml', path: 'app/nativescript-ui-chart/RadCartesianChart.xml' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.css', path: 'app/nativescript-ui-chart/RadCartesianChart.css' },
		];

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with namespace/elementName pointing to files - only XML and CSS', (done) => {
		const resolveMap = {
			'app/nativescript-ui-chart/RadCartesianChart.xml': 'app/nativescript-ui-chart/RadCartesianChart.xml',
			'app/nativescript-ui-chart/RadCartesianChart.css': 'app/nativescript-ui-chart/RadCartesianChart.css',
		};

		const expectedDeps = ['app/nativescript-ui-chart/RadCartesianChart.xml', 'app/nativescript-ui-chart/RadCartesianChart.css'];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart/RadCartesianChart.xml', path: 'app/nativescript-ui-chart/RadCartesianChart.xml' },
			{ name: 'nativescript-ui-chart/RadCartesianChart.css', path: 'app/nativescript-ui-chart/RadCartesianChart.css' },
		];

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with plugin path', (done) => {
		const resolveMap = {
			'nativescript-ui-chart': 'node_module/nativescript-ui-chart/ui-chart.js',
		};

		const expectedDeps = [];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'nativescript-ui-chart' },
			{ name: 'nativescript-ui-chart/RadCartesianChart', path: 'nativescript-ui-chart' },
		];

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
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

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, ignore: /nativescript\-ui\-chart/, assureNoDeps: true });

		xmlNsLoader.call(loaderContext, CODE_FILE);
	});

	it('with XML declaration and Doctype does not fail', (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `
    <?xml version="1.0" encoding="UTF-8" standalone="no" ?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <!-- comment.xml -->
    <Page xmlns="http://www.nativescript.org/tns.xsd"></Page>`;

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, assureNoDeps: true });

		xmlNsLoader.call(loaderContext, testXml);
	});
	it('with invalid XML fails', (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `<Page xmlns="http://www.nativescript.org/tns.xsd"></PageOpsWrongTagHere>`;

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, expectError: true });

		xmlNsLoader.call(loaderContext, testXml);
	});

	it("doesn't throw with ios and android platform namespaces", (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `
        <Page xmlns="http://www.nativescript.org/tns.xsd">
            <ios:GridLayout />
            <android:GridLayout />
        </Page>`;

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, assureNoDeps: true });

		xmlNsLoader.call(loaderContext, testXml);
	});

	it("doesn't throw with ios and android platform namespaces", (done) => {
		const resolveMap = {};
		const expectedDeps = [];
		const expectedRegs = [];

		const testXml = `
        <Page xmlns="http://www.nativescript.org/tns.xsd">
            <ios:GridLayout />
            <ios:GridLayout></ios:GridLayout>
            <android:GridLayout />
            <android:GridLayout></android:GridLayout>
        </Page>`;

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, assureNoDeps: true });

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

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, expectError: true });

		xmlNsLoader.call(loaderContext, testXml);
	});

	it("with '&&', '||', '<=' and '>=' in binding expression, emits warnings, but does not fail", (done) => {
		const resolveMap = {
			'nativescript-ui-chart': 'node_module/nativescript-ui-chart/ui-chart.js',
		};

		const expectedDeps = [];

		const expectedRegs = [
			{ name: 'nativescript-ui-chart', path: 'nativescript-ui-chart' },
			{ name: 'nativescript-ui-chart/RadCartesianChart', path: 'nativescript-ui-chart' },
		];

		const testXml = `
        <Page xmlns="http://www.nativescript.org/tns.xsd">
            <StackLayout xmlns:chart="nativescript-ui-chart">
                <TextField text="{{ var1 && var2 || var1 >= var2 || var2 <= var1 }}" />
                <chart:RadCartesianChart></chart:RadCartesianChart>
            </StackLayout>        
        </Page>`;

		const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, expectWarnings: 1 });

		xmlNsLoader.call(loaderContext, testXml);
	});
});
