// define our global helpers
declare global {
	function mockFile(path: string, content: string);
}

// enable TEST mode
global.__TEST__ = true;

// we are mocking the cwd for the tests, since webpack needs absolute paths
// and we don't want them in tests
import dedent from 'ts-dedent';

process.cwd = () => '__jest__';

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

jest.mock('path', () => {
	const path = jest.requireActual('path');
	return {
		...path,
		resolve(...args) {
			if (args[0] === '__jest__') {
				return path.join(...args);
			}

			const resolved = path.resolve(...args);
			if (resolved.includes('__jest__')) {
				const li = resolved.lastIndexOf('__jest__');
				return resolved.substr(li);
			}

			return resolved;
		},
	};
});

const mockedFiles: { [path: string]: string } = {};

global.mockFile = function mockFile(path, content) {
	const unionFS = require('unionfs').default;
	const Volume = require('memfs').Volume;

	// reset to fs
	unionFS.reset();

	// add mocked file
	mockedFiles[path] = dedent(content);

	// create new volume
	const vol = Volume.fromJSON(mockedFiles, '__jest__');

	// use the new volume
	unionFS.use(vol as any);
};

jest.mock('fs', () => {
	const fs = jest.requireActual('fs');
	const unionFS = require('unionfs').default;
	unionFS.reset = () => {
		unionFS.fss = [fs];
	};

	return unionFS.use(fs);
});
