import type { FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import { typescriptServerStrategy } from '../../typescript/server/strategy.js';

/**
 * A plain JavaScript app is the XML flavor without a compile step: the same
 * app-file graph, code-behind re-registration and root reset as `typescript`,
 * whose strategy already matches `.js` modules. This entry only re-labels it,
 * but it must exist in `STRATEGY_REGISTRY`: the `/ns/*` device routes are
 * installed only for flavors with a server strategy, and without them the
 * app's boot import of `/ns/core/xhr` is a 404.
 */
export const javascriptServerStrategy: FrameworkServerStrategy = {
	...typescriptServerStrategy,
	flavor: 'javascript',
};
