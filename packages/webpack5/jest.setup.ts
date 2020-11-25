// we are mocking the cwd for the tests, since webpack needs absolute paths
// and we don't want them in tests
process.cwd = () => '__jest__';

// a virtual mock for package.json
jest.mock(
	'__jest__/package.json',
	() => ({
		main: 'src/app.js',
	}),
	{ virtual: true }
);

jest.mock('cosmiconfig', () => ({
	cosmiconfigSync(moduleName) {
		return {
			search() {
				// no-op in tests
				return null;
			},
		};
	},
}));

jest.mock('path', () => ({
	...jest.requireActual('path'),
	// we are mocking resolve to just simply join the paths for tests
	resolve(...args) {
		return args.join('/');
	},
}));
