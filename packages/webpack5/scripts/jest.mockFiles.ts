import dedent from 'ts-dedent';

const mockedFiles: { [path: string]: string } = {};

export function mockFile(path, content) {
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
}

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

jest.mock('fs', () => {
	const fs = jest.requireActual('fs');
	const unionFS = require('unionfs').default;
	unionFS.reset = () => {
		unionFS.fss = [fs];
	};

	return unionFS.use(fs);
});
