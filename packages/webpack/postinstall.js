"use strict";

const hook = require("@nativescript/hook")(__dirname);

const { compareProjectFiles } = require("./helpers/projectFilesManager");
const { getProjectDir } = require("./helpers/projectHelpers");
const path = require("path");
const fs = require("fs");

const projectDir = getProjectDir();

// This method is introduced as in version 1.0.0 of @nativescript/webpack (compatible and required for NativeScript 6.0.0)
// we have changed a lot of hooks and old ones are incompatible. This should be automatically handled with preuninstall script of the old version.
// However, old versions of nativescript-dev-webpack do not have such logic, so remove them manually on postinstall of the current version.
// This logic can be removed later, once most of the projects are migrated to 1.0.0 of the package or later.
// These new versions have preuninstall script that will automatically handle this case.
function removeOldHooks() {
    const oldHooks = [
        "before-prepareJSApp",
        "before-cleanApp",
        "before-watch",
        "after-watch",
        "before-watchPatterns",
        "before-shouldPrepare",
        "after-prepare",
        "before-preview-sync"
    ];

    const hooksDir = path.join(projectDir, "hooks");
    const pkgName = require("./package.json").name;
    const filename = `${pkgName}.js`;
    oldHooks.forEach(hookName => {
        const hookPath = path.join(hooksDir, hookName, filename);

        try {
            if (fs.existsSync(hookPath)) {
                fs.unlinkSync(hookPath);
            }
        } catch (err) {
            console.warn(`${pkgName} postinstall task: unable to delete hook ${hookPath}. Error is: ${err}`);
        }
    });
}

if (projectDir) {
    compareProjectFiles(projectDir);
    removeOldHooks();
    hook.postinstall();
    const installer = require("./installer");
    installer.install();
} else {
    // We are installing dev dependencies for the @nativescript/webpack plugin.
    console.log("Skipping postinstall artifacts! We assumed the @nativescript/webpack is installing devDependencies");
}

