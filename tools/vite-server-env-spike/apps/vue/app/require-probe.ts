import { Color } from '@nativescript/core/color';

// A pre-bundled CommonJS package that requires core, and a require in served ESM:
// both must hand back the same core module instance as the import above.
const probe = require('ns-cjs-probe');
const required = require('@nativescript/core/color');

console.log(`[ns-require-probe] cjs=${probe.tag === 'ns-cjs-probe' && probe.Color === Color} esm-require=${required.Color === Color}`);
