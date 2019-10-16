const semver = require("semver");

module.exports = function ($staticConfig, hookArgs) {
    const cliVersion = semver.parse($staticConfig.version);
    const majorVersion = cliVersion && cliVersion.major;
    const minorVersion = cliVersion && cliVersion.minor;
    const platfrom = hookArgs.prepareData.platform;

    if (platfrom.toLowerCase() === "ios" &&
        (majorVersion < 6 || (majorVersion === 6 && minorVersion < 2))) {
        throw new Error(`Building @nativescript/core for iOS requires NativeScript CLI with version at least 6.2.0. Please upgrade your NativeScript CLI version (npm i -g nativescript).`);
    }
};
