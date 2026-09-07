import { describe, expect, it } from 'vitest';
import { javascriptServerStrategy } from './strategy.js';
import { typescriptServerStrategy } from '../../typescript/server/strategy.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';

describe('javascriptServerStrategy', () => {
	it('is the TypeScript strategy under the javascript flavor name', () => {
		expect(javascriptServerStrategy.flavor).toBe('javascript');
		expect(javascriptServerStrategy.handleHotUpdate).toBe(typescriptServerStrategy.handleHotUpdate);
		expect(javascriptServerStrategy.processFile).toBe(typescriptServerStrategy.processFile);
		expect(javascriptServerStrategy.buildRegistry).toBe(typescriptServerStrategy.buildRegistry);
		expect(javascriptServerStrategy.normalizeServedExports).toBe(typescriptServerStrategy.normalizeServedExports);
	});

	it('treats plain .js app modules as HMR graph members', () => {
		expect(javascriptServerStrategy.matchesFile(getProjectAppVirtualPath('main-page.js'))).toBe(true);
		expect(javascriptServerStrategy.matchesFile(`${getProjectAppVirtualPath('app.js')}?import`)).toBe(true);
		expect(javascriptServerStrategy.matchesFile(getProjectAppVirtualPath('main-page.spec.js'))).toBe(false);
	});
});
