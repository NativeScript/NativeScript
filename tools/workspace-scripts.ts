const npsUtils = require('nps-utils');

module.exports = {
	scripts: {
		default: 'nps',
		// execute any command with the @nrwl/cli
		nx: 'nx',
		// format the entire workspace
		format: 'nx format:write',
		// setup the workspace for development
		setup: 'npx rimraf -- hooks node_modules package-lock.json && npm i && ts-patch install && nx run core:setup',
		// app testing targets
		apps: {
			// Automated test runner which executes unit tests on the target platform
			automated: {
				clean: 'nx run apps-automated:clean',
				ios: 'nx run apps-automated:ios',
				android: 'nx run apps-automated:android',
			},
			// Playground useful for livesyncing changes and experimenting
			playground: {
				clean: 'nx run apps-playground:clean',
				ios: 'nx run apps-playground:ios',
				android: 'nx run apps-playground:android',
			},
			// Various UI level setups for @nativescript/core testing
			ui: {
				clean: 'nx run apps-ui:clean',
				ios: 'nx run apps-ui:ios',
				android: 'nx run apps-ui:android',
			},
		},
		// packages
		// build output is always in dist/packages
		packages: {
			// @nativescript/core
			core: {
				// build for npm
				build: 'nx run core:build.npm',
				test: {
					// unit tests
					script: 'nx run core:unit',
					watch: {
						// unit tests with watcher
						script: 'nx run core:unit.watch',
					},
				},
			},
			// tns-core-modules (old historic compatibility)
			'core-compat': {
				// build for npm
				build: 'nx run core-compat:build',
			},
			// @nativescript/ui-mobile-base
			'ui-mobile-base': {
				// build for npm
				build: 'nx run ui-mobile-base:build',
			},
			// @nativescript/webpack
			webpack: {
				build: 'nx run webpack:build',
				test: 'nx run webpack:test',
			},
		},
	},
};
