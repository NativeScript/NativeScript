import { describe, expect, it } from 'vitest';
import { buildVersionedCoreSubpathAliasModule } from './websocket.js';

describe('buildVersionedCoreSubpathAliasModule', () => {
	it('aliases an unversioned deep core subpath to the canonical versioned module', () => {
		const out = buildVersionedCoreSubpathAliasModule('ui/core/view-base/index.js', 7);

		expect(out).toContain('import * as __ns_core_alias from "/ns/core/7?p=ui/core/view-base/index.js";');
		expect(out).toContain('export default (__ns_core_alias.default || __ns_core_alias);');
		expect(out).toContain('export * from "/ns/core/7?p=ui/core/view-base/index.js";');
	});

	it('strips leading slashes from the requested core subpath', () => {
		const out = buildVersionedCoreSubpathAliasModule('/ui/layouts/layout-base-common.js', 3);

		expect(out).toContain('"/ns/core/3?p=ui/layouts/layout-base-common.js"');
		expect(out).not.toContain('"/ns/core/3?p=/ui/layouts/layout-base-common.js"');
	});
});
