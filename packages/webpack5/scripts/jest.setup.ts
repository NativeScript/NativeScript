import './jest.mockFiles';
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

			return resolved;
		},
	};
});
