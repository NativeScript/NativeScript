import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { typescriptConfig } from '@nativescript/vite';
import path from 'path';
import { existsSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

function automatedBundlerExtrasPlugin() {
	return {
		name: 'automated-bundler-extras',
		enforce: 'pre' as const,
		transform(code: string, id: string) {
			// Patch the generic virtual bundler context to add app-specific module registrations needed by tests
			if (id.includes('virtual:ns-bundler-context')) {
				const importLines = [
					"import * as __auto_btnCounter from '/src/ui/lifecycle/pages/button-counter.ts';",
					"import * as __auto_myControl from '/src/ui/root-view/mymodule/MyControl.ts';",
					"import * as __auto_testPageModule from '/src/ui/page/test-page-module.ts';",
					"import * as __auto_testModuleCssPage from '/src/ui/page/test-module-css-page.ts';",
					// Force profiling suite into the bundle even when CI builds strip it out.
					"import '/src/profiling/profiling-tests.ts';",
				];
				const imports = importLines.join('\n');

				const append = `\n;(function(){\n  try {\n    if (global.registerModule) {\n      // Register explicit modules used by automated tests (navigateToModule, xmlns)\n      global.registerModule('ui/lifecycle/pages/button-counter', function(){ return __auto_btnCounter; });\n      global.registerModule('ui/root-view/mymodule/MyControl', function(){ return __auto_myControl; });\n      // Folder alias to satisfy xmlns=\"ui/root-view/mymodule\":MyControl\n      global.registerModule('ui/root-view/mymodule', function(){ return __auto_myControl; });\n      global.registerModule('ui/page/test-page-module', function(){ return __auto_testPageModule; });\n      global.registerModule('ui/page/test-module-css-page', function(){ return __auto_testModuleCssPage; });\n    }\n  } catch(_) {}\n})();\n`;

				return { code: `${imports}\n${code}${append}`, map: null };
			}
			return null;
		},
	};
}

export default defineConfig(({ mode }): UserConfig => {
	const base = typescriptConfig({ mode });
	const projectRoot = path.resolve(__dirname);
	const testImagePath = path.resolve(projectRoot, 'src/ui/image/700x50.png');
	const extraPlugins = [] as UserConfig['plugins'];
	// Inject app-specific bundler module registrations required by this test app
	extraPlugins.push(automatedBundlerExtrasPlugin());
	if (existsSync(testImagePath)) {
		extraPlugins.push(
			viteStaticCopy({
				targets: [{ src: testImagePath, dest: 'ui/image' }],
			}),
		);
	}
	return mergeConfig(base, {
		// Ensure CI builds keep the profiling suite enabled so tests match webpack behaviour.
		define: {
			__CI__: JSON.stringify(false),
			// Enable these for verbose profiling output during tests if needed
			__NS_PROFILING_DEBUG__: JSON.stringify(true),
			__NS_PROFILING_DEBUG_CONSOLE__: JSON.stringify(false),
		},
		plugins: extraPlugins,
	});
});
