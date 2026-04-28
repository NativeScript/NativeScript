export * from './configuration/base.js';
export * from './configuration/javascript.js';
export * from './configuration/typescript.js';

// App components plugin for custom Android Activity/Application classes
export { appComponentsPlugin, type AppComponentsOptions } from './helpers/app-components.js';

// Helper for parsing `--env.foo=bar` style flags forwarded by the NativeScript
// CLI (and any other `vite … -- --env.X=Y` invocation). Exposed so apps with a
// custom `vite.config.ts` can read the same flag set the base config sees
// without having to re-implement the parser.
export { getCliFlags } from './helpers/cli-flags.js';

// Simple CLI entry to support `npx @nativescript/vite init`
// This keeps the library export surface intact while allowing a
// lightweight command for project bootstrapping.
if (process.argv[1] && /@nativescript[\/\\]vite/.test(process.argv[1]) && process.argv[2] === 'init') {
	import('./helpers/init.js')
		.then(({ runInit }) => runInit())
		.catch((err) => {
			console.error('[@nativescript/vite] init failed:', err?.message ?? err);
			process.exitCode = 1;
		});
}
