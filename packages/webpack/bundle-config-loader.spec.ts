import bundleConfigLoader from './bundle-config-loader';

const defaultLoaderOptions = {
	angular: false,
	loadCss: true,
	unitTesting: false,
};

const defaultTestFiles = {
	'./app-root.xml': true,
	'./app-root.land.xml': true,
	'./app.ts': true,
	'./app.css': true,
	'./app.android.scss': true,
	'./app.ios.scss': true,
	'./app.land.css': true,
	'./components/my-component.css': true,
	'./components/my-component.land.ts': true,
	'./components/my-component.ts': true,
	'./components/my-component.land.xml': true,
	'./components/my-component.xml': true,
	'./components/my-component.land.css': true,
	'./main/main-page.land.css': true,
	'./main/main-page.css': true,
	'./main/main-page.ts': true,
	'./main/main-page.land.xml': true,
	'./main/main-page.xml': true,
	'./main/main-page.land.ts': true,
	'./main/main-page-vm.ts': true,

	'./app_component.scss': true,
	'./App_Resources123/some-file.xml': true,
	'./MyApp_Resources/some-file.xml': true,
	'./App_Resources_Nobody_Names_Folders_Like_That_Roska/some-file.xml': true,

	'./package.json': false, // do not include package.json files
	'./app.d.ts': false, // do not include ts definitions
	'./_app-common.scss': false, // do not include scss partial files
	'./_app-variables.scss': false, // do not include scss partial files
	'./App_Resources/Android/src/main/res/values/colors.xml': false, // do not include App_Resources
	'./App_Resources/Android/src/main/AndroidManifest.xml': false, // do not include App_Resources
	'./tests/example.js': false, // do not include files from tests folder
	'./tests/component1/model1/file1.js': false, // do not include files from tests folder
	'./components/tests/example.js': true,
};

const loaderOptionsWithIgnore = {
	angular: false,
	loadCss: true,
	unitTesting: false,
	ignoredFiles: ['./application', './activity'],
};

const ignoredTestFiles = {
	'./application.ts': false,
	'./activity.ts': false,
};

function getRequireContextRegex(source: string): RegExp {
	const requireContextStr = `require.context("~/", true, `;

	expect(source).toContain(requireContextStr);

	const start = source.indexOf(requireContextStr) + requireContextStr.length;
	const end = source.indexOf(');\n', start);
	const regexStr = source.substring(start, end);
	const regex: RegExp = eval(regexStr);

	expect(regex instanceof RegExp).toBeTruthy();
	return regex;
}

function assertTestFilesAreMatched(testFiles: { [key: string]: boolean }, regex: RegExp) {
	for (let fileName in testFiles) {
		if (defaultTestFiles[fileName]) {
			expect(fileName).toMatch(regex);
		} else {
			expect(fileName).not.toMatch(regex);
		}
	}
}

describe('BundleConfigLoader should create require.context', () => {
	it('default case', (done) => {
		const loaderContext = {
			callback: (error, source: string, map) => {
				const regex = getRequireContextRegex(source);

				assertTestFilesAreMatched(defaultTestFiles, regex);

				done();
			},
			query: defaultLoaderOptions,
		};

		bundleConfigLoader.call(loaderContext, ' ___CODE___');
	});

	it('with ignored files', (done) => {
		const loaderContext = {
			callback: (error, source: string, map) => {
				const regex = getRequireContextRegex(source);
				const testFiles = { ...defaultTestFiles, ...ignoredTestFiles };

				assertTestFilesAreMatched(testFiles, regex);

				done();
			},
			query: loaderOptionsWithIgnore,
		};

		bundleConfigLoader.call(loaderContext, ' ___CODE___');
	});
});
