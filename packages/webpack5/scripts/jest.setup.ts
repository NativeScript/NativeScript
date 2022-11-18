// we are mocking the cwd for the tests, since webpack needs absolute paths
// and we don't want them in tests
process.cwd = () => '__jest__';

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

const getValueMock = jest.fn();
getValueMock.mockImplementation((key, defaultValue) => defaultValue);
jest.mock('../src/helpers/config.ts', () => ({
	getValue: getValueMock,
}));

jest.mock('os', () => {
	const os = jest.requireActual('os');

	return {
		...os,
		networkInterfaces() {
			return {
				in0: [
					{
						address: '127.0.0.1',
						family: 'IPv4',
					},
					{
						address: 'in0-ipv6-should-not-use',
						family: 'IPv6',
					},
				],
				in1: [
					{
						address: '192.168.0.10',
						family: 'IPv4',
					},
					{
						address: 'in1-ipv6-should-not-use',
						family: 'IPv6',
					},
				],
			};
		},
	};
});

jest.mock('path', () => {
	const path = jest.requireActual('path');
	return {
		...path,
		resolve(...args) {
			if (args[0] === '__jest__') {
				return path.join(...args.filter(Boolean));
			}

			const resolved = path.resolve(...args);
			if (resolved.includes('__jest__')) {
				const li = resolved.lastIndexOf('__jest__');
				return resolved.substr(li);
			}

			// handle resolutions with __dirname
			// used in base config's resolveLoader
			const root = path.resolve(__dirname, '..');
			if (resolved.startsWith(root)) {
				const newPath = resolved.replace(root, '__jest__');

				if (newPath.startsWith('__jest__/src')) {
					return newPath.replace(
						'__jest__/src',
						'__jest__/node_modules/@nativescript/webpack/dist'
					);
				}

				return newPath;
			}

			return resolved;
		},
	};
});

// a virtual mock for package.json
jest.mock(
	'__jest__/package.json',
	() => ({
		main: 'src/app.js',
		devDependencies: {
			typescript: '*',
		},
	}),
	{ virtual: true }
);
