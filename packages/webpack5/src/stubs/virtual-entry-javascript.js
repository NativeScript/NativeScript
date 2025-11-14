// VIRTUAL ENTRY START
require('@nativescript/core/bundle-entry-points')
const context = require.context("~/", /* deep: */ true, /* filter: */ /.(xml|js|s?css)$/);
global.registerBundlerModules(context);
// VIRTUAL ENTRY END