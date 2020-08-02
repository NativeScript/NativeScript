const npsUtils = require('nps-utils');

module.exports = {
	scripts: {
		default: 'nps-i',
		nx: {
      script: 'nx',
      description: 'Execute any command with the @nrwl/cli'
    },
		format: {
      script: 'nx format:write',
      description: 'Format the source code of the entire workspace (auto-run on precommit hook)'
    },
    "> apps_________________": '--------',
		// app testing targets
		apps: {
			// Automated test runner which executes unit tests on the target platform
			automated: {
				clean: {
          script: 'nx run apps-automated:clean',
          description: '🧹 Clean'
        },
				ios: {
          script: 'nx run apps-automated:ios',
          description: ' Run iOS'
        },
				android: {
          script: 'nx run apps-automated:android',
          description: '🤖 Run Android'
        },
			},
			// Playground useful for livesyncing changes and experimenting
			playground: {
				clean: {
          script: 'nx run apps-playground:clean',
          description: '🧹 Clean'
        },
				ios: {
          script: 'nx run apps-playground:ios',
          description: ' Run iOS'
        },
				android: {
          script: 'nx run apps-playground:android',
          description: '🤖 Run Android'
        },
			},
			// Various UI level setups for @nativescript/core testing
			ui: {
				clean: {
          script: 'nx run apps-ui:clean',
          description: '🧹 Clean'
        },
				ios: {
          script: 'nx run apps-ui:ios',
          description: ' Run iOS'
        },
				android: {
          script: 'nx run apps-ui:android',
          description: '🤖 Run Android'
        },
			},
    },
    "> packages______________": '--------',
		// packages
		// build output is always in dist/packages
		'@nativescript': {
			// @nativescript/core
			core: {
				build: {
          script: 'nx run core:build.npm',
          description: '@nativescript/core: Build for npm'
        },
				test: {
          script: 'nx run core:unit',
          description: '@nativescript/core: Unit tests',
					watch: {
            script: 'nx run core:unit.watch',
            description: '@nativescript/core: Unit tests with watcher'
					},
				},
			},
			// tns-core-modules (old historic compatibility)
			'core-compat': {
				build: {
          script: 'nx run core-compat:build',
          description: 'tns-core-modules: (Compatibility package) Build for npm'
        },
			},
			// @nativescript/ui-mobile-base
			'ui-mobile-base': {
				build: {
          script: 'nx run ui-mobile-base:build',
          description: '@nativescript/ui-mobile-base: Build for npm'
        },
			},
			// @nativescript/webpack
			webpack: {
				build: {
          script: 'nx run webpack:build',
          description: '@nativescript/webpack: Build for npm'
        },
				test: {
          script: 'nx run webpack:test',
          description: '@nativescript/webpack: Unit tests'
        },
			},
    },
    "> ______________________": '--------',
	},
};
