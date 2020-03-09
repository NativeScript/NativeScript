const semver = require("semver");

const webpackPackageName = "nativescript-dev-webpack";

module.exports = function ($staticConfig, hookArgs) {
    const cliVersion = semver.parse($staticConfig.version);
    const platfrom = hookArgs.prepareData.platform;
    const projectData = hookArgs.projectData;

    // Required CLI version for building IOS: 6.2.0
    if (platfrom.toLowerCase() === "ios" &&
        !satisfiesRequriredVersion(cliVersion, 6, 2)) {
        throw new Error(`Building @nativescript/core for iOS requires NativeScript CLI with version at least 6.2.0. Please upgrade your NativeScript CLI version (npm i -g nativescript).`);
    }

    // Required webpack version for angular projects: 1.3.0
    if (projectData.projectType === "Angular") {
        const webpackMinVer = getMinWebpackVersion(projectData);

        if (webpackMinVer && !satisfiesRequriredVersion(webpackMinVer, 1, 3)) {
            throw new Error(`Building @nativescript/core for Angular requires ${webpackPackageName} with version at least 1.3.0. Please upgrade: npm i ${webpackPackageName} --save-dev.`);
        }
    }
};

/**
 * Checks if semver object satisifies a major/minor requirement. Pre-release versions are OK too!
 */
function satisfiesRequriredVersion(actualVersion, requiredMajor, requiredMinor) {
    // Return true for null version to handle tags (ex. "next", "rc")
    if (!actualVersion) {
        return true;
    }

    if (actualVersion.major < requiredMajor) {
        return false;
    }

    if (actualVersion.major === requiredMajor && actualVersion.minor < requiredMinor) {
        return false;
    }

    return true;
}

function getMinWebpackVersion(projectData) {
    const devDependencies = projectData.devDependencies || {};
    const dependencies = projectData.dependencies || {};
    const webpackVer = dependencies[webpackPackageName] || devDependencies[webpackPackageName];

    let webpackMinVer = null;

    if (semver.valid(webpackVer)) {
        webpackMinVer = semver.parse(webpackVer);
    } else if (semver.validRange(webpackVer)) {
        webpackMinVer = semver.minVersion(webpackVer);
    }

    return webpackMinVer;
}