module.exports = {
  message: 'NativeScript ~ made with ❤️  Choose a command to start...',
  pageSize: 32,
	scripts: {
		default: 'nps-i',
		nx: {
      script: 'nx',
      description: 'Execute any command with the Nx cli'
    },
		format: {
      script: 'nx format:write',
      description: 'Format source code of the entire workspace (auto-run on precommit hook)'
    },
    "🔧": {
      script: `npx cowsay "NativeScript apps are key to a user's ❤️"`,
      description: '_____________  Apps to develop and experiment with  _____________'
    },
		// app testing targets
		apps: {
      "...Automated...": {
        script: `npx cowsay "These run fast, watch the fireworks! 🎆"`,
        description: ` 🔻 Automated test runner which executes e2e tests on the target platform 🎆`
      },
			// Automated test runner which executes e2e tests on the target platform
			automated: {
				clean: {
          script: 'nx clean apps-automated',
          description: '⚆  Clean  🧹'
        },
				ios: {
          script: 'nx debug apps-automated ios',
          description: '⚆  Run iOS  '
        },
        visionos: {
          script: 'nx debug apps-automated vision',
          description: '⚆  Run visionOS  🥽'
        },
				android: {
          script: 'nx debug apps-automated android',
          description: '⚆  Run Android  🤖'
        },
      },
      "...ToolBox...": {
        script: `npx cowsay "🎯 The best development target to experiment with ideas and debug core"`,
        description: ` 🔻 Toolbox for livesyncing changes and experimenting 🎯`
      },
			// Toolbox useful for livesyncing changes and experimenting
			toolbox: {
				clean: {
          script: 'nx clean apps-toolbox',
          description: '⚆  Clean  🧹'
        },
				ios: {
          script: 'nx debug apps-toolbox ios',
          description: '⚆  Run iOS  '
        },
        visionos: {
          script: 'nx debug apps-toolbox vision',
          description: '⚆  Run visionOS  🥽'
        },
				android: {
          script: 'nx debug apps-toolbox android',
          description: '⚆  Run Android  🤖'
        },
      },
      "...UI...": {
        script: `npx cowsay "Tons of ui samples to prove out core behavior and validate github issue fixes ☑️"`,
        description: ` 🔻 Tons of ui samples to prove out core behavior and validate github issue fixes ☑️`
      },
			// Various UI level setups for @nativescript/core testing
			ui: {
				clean: {
          script: 'nx clean apps-ui',
          description: '⚆  Clean  🧹'
        },
				ios: {
          script: 'nx debug apps-ui ios',
          description: '⚆  Run iOS  '
        },
        visionos: {
          script: 'nx debug apps-ui vision',
          description: '⚆  Run visionOS  🥽'
        },
				android: {
          script: 'nx debug apps-ui android',
          description: '⚆  Run Android  🤖'
        },
			},
    },
    "⚙️": {
      script: `npx cowsay "@nativescript/* packages will keep your ⚙️ cranking"`,
      description: '_____________  @nativescript/*  _____________'
    },
		// packages
		// build output is always in dist/packages
		'@nativescript': {
			// @nativescript/core
			core: {
				build: {
          script: 'nx build core',
          description: '@nativescript/core: Build'
        },
				test: {
          script: 'nx test core',
          description: '@nativescript/core: Unit tests'
				},
			},
      // @nativescript/core API Reference Docs
      'core-api-docs': {
				build: {
          script: 'nx build core-api-docs',
          description: '@nativescript/core: API Reference Docs Build'
        }
      },
			// @nativescript/ui-mobile-base
			'ui-mobile-base': {
				build: {
          script: 'nx build ui-mobile-base',
          description: '@nativescript/ui-mobile-base: Build for npm'
        },
			},
      // @nativescript/webpack (5)
			webpack5: {
				build: {
          script: 'nx build webpack5',
          description: '@nativescript/webpack(5): Build for npm'
        },
				test: {
					script: 'nx test webpack5',
					description: '@nativescript/webpack(5): Unit tests'
				},
			},
			// @nativescript/vite
			vite: {
				build: {
					script: 'nx build vite',
					description: '@nativescript/vite: Build'
				},
				test: {
					script: 'nx test vite',
					description: '@nativescript/vite: Unit tests'
				},
			},
    },
    "⚡": {
      script: `npx cowsay "Focus only on source you care about for efficiency ⚡"`,
      description: '_____________  Focus (VS Code supported)  _____________'
    },
    focus: {
      core: {
        script: 'nx g @nstudio/focus:mode core',
        description: 'Focus on @nativescript/core'
      },
      types: {
        script: 'nx g @nstudio/focus:mode types-android,types-ios',
        description: 'Focus on @nativescript/types'
      },
      'ui-mobile-base': {
        script: 'nx g @nstudio/focus:mode ui-mobile-base',
        description: 'Focus on @nativescript/ui-mobile-base'
      },
      webpack: {
        script: 'nx g @nstudio/focus:mode webpack',
        description: 'Focus on @nativescript/webpack'
      },
      reset: {
        script: 'nx g @nstudio/focus:mode',
        description: 'Reset Focus'
      }
    },
    ".....................": {
      script: `npx cowsay "That's all for now folks ~"`,
      description: '.....................'
    }
	},
};
