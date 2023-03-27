let mockedPaths = new Set([]);

export let fsExistsSyncSpy: jest.SpiedFunction<any>;

export function mockExistsSync() {
	const fs = require('fs');
	const original = fs.existsSync;
	fsExistsSyncSpy = jest.spyOn(fs, 'existsSync');

	fsExistsSyncSpy.mockImplementation((path) => {
		if (mockedPaths.has(path)) {
			return true;
		}

		return original.call(fs, path);
	});
}

export function restoreExistsSync() {
	if (fsExistsSyncSpy) {
		fsExistsSyncSpy.mockRestore();
	}
}

export function setHasTSConfig(value: boolean = true) {
	if (value) {
		mockedPaths.add('__jest__/tsconfig.json');

		return;
	}

	mockedPaths.delete('__jest__/tsconfig.json');
}

export function addMockFile(path: string) {
	mockedPaths.add(path);

	return () => {
		mockedPaths.delete(path);
	};
}
