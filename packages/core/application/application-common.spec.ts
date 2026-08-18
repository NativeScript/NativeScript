import { ApplicationCommon } from './application-common';
import { getAppMainEntry, setAppMainEntry } from './helpers-common';

class TestApplication extends ApplicationCommon {
	getRootView() {
		return null as any;
	}
}

describe('__onApplicationReload', () => {
	afterEach(() => {
		setAppMainEntry(undefined);
		delete global.__onApplicationReload;
	});

	it('remounts the current main entry without constructing a new Application', () => {
		const app = new TestApplication();
		const entry = { moduleName: 'app-root' };
		setAppMainEntry(entry);

		const remount = vi.spyOn(app, 'resetRootView');
		global.__onApplicationReload();

		expect(remount).toHaveBeenCalledWith(entry);
		expect(getAppMainEntry()).toBe(entry);
	});

	it('is a no-op when the app has no main entry yet', () => {
		const app = new TestApplication();
		const remount = vi.spyOn(app, 'resetRootView');

		global.__onApplicationReload();

		expect(remount).not.toHaveBeenCalled();
	});
});
