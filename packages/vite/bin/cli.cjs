#!/usr/bin/env node

// Small CommonJS launcher that forwards to the ESM library's init helper.
// This allows `npx @nativescript/vite init` to work reliably across npm versions.

(async () => {
  try {
    const mod = await import('../dist/index.cjs').catch(async () => import('../index.js'));
    if (process.argv[2] === 'init') {
      if (typeof mod.runInit === 'function') {
        await mod.runInit();
      } else if (mod && mod.helpers && typeof mod.helpers.runInit === 'function') {
        await mod.helpers.runInit();
      } else if (mod && mod.default && typeof mod.default.runInit === 'function') {
        await mod.default.runInit();
      } else {
        const initMod = await import('../helpers/init.js');
        if (typeof initMod.runInit === 'function') {
          await initMod.runInit();
        } else {
          console.error('[@nativescript/vite] `runInit` not found in helpers.');
          process.exitCode = 1;
        }
      }
    } else {
      console.log('Usage: npx @nativescript/vite init');
    }
  } catch (err) {
    console.error('[@nativescript/vite] CLI failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
