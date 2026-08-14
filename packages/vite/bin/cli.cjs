#!/usr/bin/env node

// Small CommonJS launcher that forwards to the ESM library's init helper.
// This allows `npx @nativescript/vite init` to work reliably across npm versions.
// The package is ESM-only (no dist/index.cjs); the init entry lives at
// `../helpers/init.js` relative to this file in both the source tree and the
// published `dist/packages/vite` layout.

(async () => {
  try {
    if (process.argv[2] === 'init') {
      const { runInit } = await import('../helpers/init.js');
      if (typeof runInit === 'function') {
        await runInit();
      } else {
        console.error('[@nativescript/vite] `runInit` not found in helpers/init.js.');
        process.exitCode = 1;
      }
    } else {
      console.log('Usage: npx @nativescript/vite init');
    }
  } catch (err) {
    console.error('[@nativescript/vite] CLI failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
