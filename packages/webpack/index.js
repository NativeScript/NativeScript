const path = require("path");
const { existsSync } = require("fs");
const { ANDROID_APP_PATH } = require("./helpers/androidProjectHelpers");
const {
    getPackageJson,
    isAndroid,
    isIos,
} = require("./helpers/projectHelpers");

Object.assign(exports, require("./plugins"));
Object.assign(exports, require("./host/resolver"));

exports.processTsPathsForScopedModules = function ({ compilerOptions }) {
    const tnsModulesOldPackage = "tns-core-modules";
    const tnsModulesNewPackage = "@nativescript/core";
    replacePathInCompilerOptions({
        compilerOptions,
        targetPath: tnsModulesOldPackage,
        replacementPath: tnsModulesNewPackage
    });
    ensurePathInCompilerOptions({
        compilerOptions,
        sourcePath: tnsModulesOldPackage,
        destinationPath: `./node_modules/${tnsModulesNewPackage}`
    });
    ensurePathInCompilerOptions({
        compilerOptions,
        sourcePath: `${tnsModulesOldPackage}/*`,
        destinationPath: `./node_modules/${tnsModulesNewPackage}/*`
    });
}

exports.processTsPathsForScopedAngular = function ({ compilerOptions }) {
    const nsAngularOldPackage = "nativescript-angular";
    const nsAngularNewPackage = "@nativescript/angular";
    replacePathInCompilerOptions({
        compilerOptions,
        targetPath: nsAngularOldPackage,
        replacementPath: nsAngularNewPackage
    });
    ensurePathInCompilerOptions({
        compilerOptions,
        sourcePath: nsAngularOldPackage,
        destinationPath: `./node_modules/${nsAngularNewPackage}`
    });
    ensurePathInCompilerOptions({
        compilerOptions,
        sourcePath: `${nsAngularOldPackage}/*`,
        destinationPath: `./node_modules/${nsAngularNewPackage}/*`
    });
}

exports.hasRootLevelScopedModules = function ({ projectDir }) {
    return hasRootLevelPackage({ projectDir, packageName: "@nativescript/core" });
}

exports.hasRootLevelScopedAngular = function ({ projectDir }) {
    return hasRootLevelPackage({ projectDir, packageName: "@nativescript/angular" });
}

exports.getAotEntryModule = function (appDirectory) {
    verifyEntryModuleDirectory(appDirectory);

    const entry = getPackageJsonEntry(appDirectory);
    const aotEntry = `${entry}.aot.ts`;

    const aotEntryPath = path.resolve(appDirectory, aotEntry);
    if (!existsSync(aotEntryPath)) {
        throw new Error(`For ahead-of-time compilation you need to have an entry module ` +
            `at ${aotEntryPath} that bootstraps the app with a static platform instead of dynamic one!`)
    }

    return aotEntry;
}

exports.getEntryModule = function (appDirectory, platform) {
    verifyEntryModuleDirectory(appDirectory);

    const entry = getPackageJsonEntry(appDirectory);

    const tsEntryPath = path.resolve(appDirectory, `${entry}.ts`);
    const jsEntryPath = path.resolve(appDirectory, `${entry}.js`);
    let entryExists = existsSync(tsEntryPath) || existsSync(jsEntryPath);
    if (!entryExists && platform) {
        const platformTsEntryPath = path.resolve(appDirectory, `${entry}.${platform}.ts`);
        const platformJsEntryPath = path.resolve(appDirectory, `${entry}.${platform}.js`);
        entryExists = existsSync(platformTsEntryPath) || existsSync(platformJsEntryPath);
    }

    if (!entryExists) {
        throw new Error(`The entry module ${entry} specified in ` +
            `${appDirectory}/package.json doesn't exist!`)
    }

    return entry;
};

exports.getAppPath = (platform, projectDir) => {
    if (isIos(platform)) {
        const appName = path.basename(projectDir);
        const sanitizedName = sanitize(appName);

        return `platforms/ios/${sanitizedName}/app`;
    } else if (isAndroid(platform)) {
        return ANDROID_APP_PATH;
    } else if (hasPlatformPlugin(projectDir, platform)) {
        return `platforms/${platform}/app`;
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
};

/**
 * For backward compatibility. This method is deprecated. Do not use it anymore.
 * This method also has a bug of not escaping valid regex symbols in entry path.
 * For module rules use: "include" instead of "test".
 */
exports.getEntryPathRegExp = (appFullPath, entryModule) => {
    const entryModuleFullPath = path.join(appFullPath, entryModule);
    // Windows paths contain `\`, so we need to convert each of the `\` to `\\`, so it will be correct inside RegExp
    const escapedPath = entryModuleFullPath.replace(/\\/g, "\\\\");
    return new RegExp(escapedPath);
}

exports.getSourceMapFilename = (hiddenSourceMap, appFolderPath, outputPath) => {
    const appFolderRelativePath = path.join(path.relative(outputPath, appFolderPath));
    let sourceMapFilename = "[file].map";
    if (typeof hiddenSourceMap === "string") {
        sourceMapFilename = path.join(appFolderRelativePath, hiddenSourceMap, "[file].map");
    } else if (typeof hiddenSourceMap === "boolean" && !!hiddenSourceMap) {
        sourceMapFilename = path.join(appFolderRelativePath, "sourceMap", "[file].map");
    }

    return sourceMapFilename;
}

/**
 * Converts an array of strings externals to an array of regular expressions.
 * Input is an array of string, which we need to convert to regular expressions, so all imports for this module will be treated as externals.

 * For example, in case we want nativescript-vue to be external, we will pass `["nativescript-vue"]`.
 * If we pass it to webpack in this way, it will treat all `require("nativescript-vue")` as externals.
 * However, you may import some file/subdir of the module, for example `require("nativescript-vue/somedir/file1")`.
 * To treat this as external, we convert the strings to regular expressions, which makes webpack exclude all imports of the module.
 * @param {string[]} externals Array of strings.
 * @returns {RegExp[]} Array of regular expressions constructed from the input strings. In case the input is nullable, an empty array is returned.
 */
exports.getConvertedExternals = (externals) => {
    const modifiedExternals = (externals || []).map((e) => {
        return new RegExp(`^${e}((/.*)|$)`);
    });

    return modifiedExternals;
};


/**
 * The `require.context` call in `bundle-config-loader` will ask the FS for files and
 * the PlatformFSPlugin will return files without `.${platform}`. The SplitChunksPlugin will
 * compare the `appComponents` with the files returned from the `PlatformFSPlugin` and when they
 * do not match because of the platform extension, it will duplicate the custom components
 * in `bundle` (activity.js - included by the `require.context` call in `bundle-config-loader`)
 * and `vendor` (activity.android.js - included by `android-app-components-loader` and `SplitChunksPlugin`).
 * We are post-processing the `appComponents` in order to unify the file names and avoid getting
 * a build-time SBG exception for duplicate native class definition.
 */
exports.processAppComponents = (appComponents, platform) => {
    for (const key in appComponents) {
        appComponents[key] = appComponents[key].replace(`.${platform}`, "");
    }
};

/**
 * The `bundle-config-loader` needs this in order to skip the custom entries in its `require.context` call.
 * If we don't skip them, custom entries like custom Android application will be included in both `application.js`
 * (because its defined as an entry) and `bundle.js` (included by the `require.context` call in `bundle-config-loader`)
 * causing a build-time SBG exception for duplicate native class definition.
 * We are removing the extension in order to unify the file names with the `PlatformFSPlugin`.
 */
exports.getUserDefinedEntries = (entries, platform) => {
    const userDefinedEntries = [];
    for (const entry in entries) {
        if (entry !== "bundle" && entry !== "tns_modules/@nativescript/core/inspector_modules") {
            userDefinedEntries.push(entries[entry].replace(`.${platform}`, ""));
        }
    }

    return userDefinedEntries;
};

const sanitize = name => name
    .split("")
    .filter(char => /[a-zA-Z0-9]/.test(char))
    .join("");

function hasPlatformPlugin(appDirectory, platform) {
    const packageJsonSource = getPackageJson(appDirectory);
    const { dependencies } = packageJsonSource;

    return !!dependencies[`nativescript-platform-${platform}`];
}

function getPackageJsonEntry(appDirectory) {
    const packageJsonSource = getPackageJson(appDirectory);
    const entry = packageJsonSource.main;

    if (!entry) {
        throw new Error(`${appDirectory}/package.json must contain a 'main' attribute!`);
    }

    return entry.replace(/\.js$/i, "");
}

function verifyEntryModuleDirectory(appDirectory) {
    if (!appDirectory) {
        throw new Error("Path to app directory is not specified. Unable to find entry module.");
    }

    if (!existsSync(appDirectory)) {
        throw new Error(`The specified path to app directory ${appDirectory} does not exist. Unable to find entry module.`);
    }
}


function hasRootLevelPackage({ projectDir, packageName }) {
    let hasRootLevelPackage;
    try {
        require.resolve(packageName, { paths: [projectDir] });
        hasRootLevelPackage = true;
    } catch (e) {
        hasRootLevelPackage = false;
    }

    return hasRootLevelPackage;
}

function replacePathInCompilerOptions({ compilerOptions, targetPath, replacementPath }) {
    const paths = (compilerOptions && compilerOptions.paths) || {};
    for (const key in paths) {
        if (paths.hasOwnProperty(key)) {
            const pathsForPattern = paths[key];
            if (Array.isArray(pathsForPattern)) {
                for (let i = 0; i < pathsForPattern.length; ++i) {
                    if (typeof pathsForPattern[i] === "string") {
                        pathsForPattern[i] = pathsForPattern[i].replace(targetPath, replacementPath);
                    }
                }
            }
        }
    }
}

function ensurePathInCompilerOptions({ compilerOptions, sourcePath, destinationPath }) {
    compilerOptions = compilerOptions || {};
    compilerOptions.paths = compilerOptions.paths || {};
    const paths = compilerOptions.paths;
    if (paths[sourcePath]) {
        if (Array.isArray(paths[sourcePath]) && paths[sourcePath].indexOf(destinationPath) === -1) {
            paths[sourcePath].push(destinationPath);
        }
    } else {
        paths[sourcePath] = [destinationPath];
    }
}
