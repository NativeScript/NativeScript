import { env } from '../../src/';
import { addPlatform, getEntryPath } from '../../src/helpers/platform';

import { getValue } from '../../src/helpers/config';

describe('getEntryPath', () => {
	it('uses platform getEntryPath if the platform specifies it', () => {
		env.platform = 'testPlatform';
		addPlatform('testPlatform', {
			getEntryPath() {
				return 'custom-entry-path';
			},
		});

		const res = getEntryPath();
		expect(res).toEqual('custom-entry-path');

		// cleanup env
		delete env.platform;
	});

	it('uses main from nativescript.config.ts if set', () => {
		env.ios = true;

		// mock getValue
		const getValueMock = getValue as jest.Mock;
		const getValueMockImpl = getValueMock.getMockImplementation();

		getValueMock.mockImplementation((key) => {
			if (key === 'main') {
				return 'main-from-config';
			}
		});

		const res = getEntryPath();
		expect(res).toEqual('__jest__/main-from-config');

		// reset mock implementation
		getValueMock.mockImplementation(getValueMockImpl);
	});

	it('uses main from package.json', () => {
		env.ios = true;

		const res = getEntryPath();
		// set in jest.setup.ts mock for package.json...
		expect(res).toEqual('__jest__/src/app.js');
	});
});
