import * as unitTestingConfigLoader from './unit-testing-config-loader';
import { loader } from 'webpack';
import { getOptions } from 'loader-utils';
import * as escapeRegExp from 'escape-string-regexp';

// Matches all source, markup and style files that are not in App_Resources and in tests folder
const defaultMatch = '(?<!\\bApp_Resources\\b.*)(?<!\\.\\/\\btests\\b\\/.*?)\\.(xml|css|js|(?<!\\.d\\.)ts|(?<!\\b_[\\w-]*\\.)scss)$';

const loader: loader.Loader = function (source, map) {
	let { angular = false, loadCss = true, platform, unitTesting, projectRoot, appFullPath, registerModules, ignoredFiles = [] } = getOptions(this);

	if (!registerModules) {
		registerModules = defaultMatch;
		for (const key in <any>ignoredFiles) {
			registerModules = `(?<!${escapeRegExp(ignoredFiles[key])})` + registerModules;
		}
		registerModules = <any>new RegExp(registerModules);
	}

	if (unitTesting) {
		source = unitTestingConfigLoader({ appFullPath, projectRoot, angular, rootPagesRegExp: registerModules });
		this.callback(null, source);
		return;
	}

	const hmr = `
        if (module.hot) {
            const hmrUpdate = require("@nativescript/webpack/hmr").hmrUpdate;
            global.__coreModulesLiveSync = global.__onLiveSync;

            global.__onLiveSync = function () {
                // handle hot updated on LiveSync
                hmrUpdate();
            };

            global.hmrRefresh = function({ type, path } = {}) {
                // the hot updates are applied, ask the modules to apply the changes
                setTimeout(() => {
                    global.__coreModulesLiveSync({ type, path });
                });
            };

            // handle hot updated on initial app start
            hmrUpdate();
        }
        `;

	let sourceModule = '@nativescript/core';

	if (platform && platform !== 'ios' && platform !== 'android') {
		sourceModule = `nativescript-platform-${platform}`;
	}

	source = `
        import "${sourceModule}/bundle-entry-points";
        ${source}
    `;

	if (angular) {
		source = `
            ${hmr}
            ${source}
        `;
	} else if (registerModules) {
		source = `
            ${hmr}
            const context = require.context("~/", true, ${registerModules});
            global.registerWebpackModules(context);
            if (module.hot) {
                module.hot.accept(context.id, () => { 
                    console.log("HMR: Accept module '" + context.id + "' from '" + module.id + "'"); 
                });
            }
            ${source}
        `;
	}

	if (loadCss) {
		source = `
            require("${angular ? '@nativescript/webpack/helpers/load-application-css-angular' : '@nativescript/webpack/helpers/load-application-css-regular'}")();
            ${source}
        `;
	}

	this.callback(null, source, map);
};

export default loader;
