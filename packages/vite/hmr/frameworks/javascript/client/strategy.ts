import type { FrameworkClientStrategy } from '../../../client/framework-client-strategy.js';
import { typescriptClientStrategy } from '../../typescript/client/strategy.js';

/**
 * Mirrors the server's `{ ...typescriptServerStrategy, flavor: 'javascript' }`:
 * XML pages, `.js` code-behind re-registration, modal re-presentation and the
 * `app-root` reset are the same whether the code-behind was compiled or not.
 */
export const javascriptClientStrategy: FrameworkClientStrategy = {
	...typescriptClientStrategy,
	flavor: 'javascript',
};
