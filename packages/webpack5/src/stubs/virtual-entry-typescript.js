// VIRTUAL ENTRY START
require('@nativescript/core/bundle-entry-points')
const context = require.context("~/", /* deep: */ true, /* filter: */ /\.(xml|js|(?<!\.d\.)ts|s?css)$/);
if (typeof global.registerBundlerModules === 'function') {
    global.registerBundlerModules(context);
} else {
    global.registerWebpackModules(context);
}
// VIRTUAL ENTRY END