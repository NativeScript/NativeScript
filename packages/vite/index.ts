export * from './configuration/base.js';
export * from './configuration/angular.js';
export * from './configuration/react.js';
export * from './configuration/solid.js';
export * from './configuration/vue.js';
export * from './configuration/javascript.js';
export * from './configuration/typescript.js';

// App components plugin for custom Android Activity/Application classes
export { appComponentsPlugin, type AppComponentsOptions } from './helpers/app-components.js';

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
