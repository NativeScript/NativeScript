// @swift
// CommonJS modules compiled from their JavaScript: each module evaluates once, on its first
// require, in order; a cycle sees the exports as they stand; TypeScript's and Babel's interop
// helpers (`__esModule`, `__importDefault`, `__importStar`, `__exportStar`) work as in Node.
import main from './js/cjs/main.cjs';

console.log('app: main exports', JSON.stringify(main));
