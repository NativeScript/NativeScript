const { join, relative } = require("path");
const { existsSync } = require("fs");
const { convertSlashesInPath } = require("./helpers/projectHelpers");

function getRunnerFullPath(projectRoot) {
    const runnerRootPath = join(projectRoot, "node_modules", "@nativescript/unit-test-runner");
    const runnerAppPath = join(runnerRootPath, "app");
    const result = existsSync(runnerAppPath) ? runnerAppPath : runnerRootPath;

    return result;
}

module.exports = function ({ appFullPath, projectRoot, angular, rootPagesRegExp }) {
    // TODO: Consider to use the files property from karma.conf.js
    const testFilesRegExp = /tests\/.*\.(ts|js)/;
    const runnerFullPath = getRunnerFullPath(projectRoot);
    const runnerRelativePath = convertSlashesInPath(relative(appFullPath, runnerFullPath));
    const appCssFilePath = convertSlashesInPath(join(runnerRelativePath, "app.css"));
    let source = `
        require("@nativescript/core/bundle-entry-points");
        const runnerContext = require.context("${runnerRelativePath}", true, ${rootPagesRegExp});
        global.registerWebpackModules(runnerContext);
        global.registerModule("${appCssFilePath}", () => require("${appCssFilePath}"));
        require("@nativescript/core").Application.setCssFileName("${appCssFilePath}");
    `;

    if (angular) {
        source += `
            const context = require.context("~/", true, ${testFilesRegExp});
            global.registerWebpackModules(context);
        `;
    } else {
        const registerModules = new RegExp(`(${rootPagesRegExp.source})|(${testFilesRegExp.source})`);
        source += `
            const context = require.context("~/", true, ${registerModules});
            global.registerWebpackModules(context);
        `;
    }

    const runnerEntryPointPath = convertSlashesInPath(join(runnerRelativePath, "bundle-app.js"));
    source += `
        require("${runnerEntryPointPath}");
    `;

    return source;
}