import { ApplicationCommon } from './application-common';

export * from './application-common';
export * from './application-shims';

class MacOSApplication extends ApplicationCommon {
	run(): void {}
}

export const Application = new MacOSApplication();
