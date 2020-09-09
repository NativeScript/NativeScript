const { join, resolve } = require("path");
const { existsSync, readFileSync } = require("fs");

const { getPackageJson } = require("./projectHelpers");

const PLATFORMS_ANDROID = "platforms/android";
const ANDROID_PROJECT_DIR = join(PLATFORMS_ANDROID, "app");
const ANDROID_APP_PATH = join(ANDROID_PROJECT_DIR, "src/main/assets/app");
const ANDROID_CONFIGURATIONS_PATH = join(ANDROID_PROJECT_DIR, "build/configurations");

const getAndroidRuntimeVersion = (projectDir) => {
    try {
        const projectPackageJSON = getPackageJson(projectDir);

        const version = projectPackageJSON["nativescript"]["tns-android"]["version"];
        return version && toReleaseVersion(version);
    } catch (e) {
        return null;
    }
}

const toReleaseVersion = version => version.replace(/-.*/, "");

const getAndroidV8Version = (projectDir) => {
    try {
        const androidSettingsJSON = getAndroidSettingsJson(projectDir);
        if (androidSettingsJSON !== null) {
            return androidSettingsJSON.v8Version;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

const getMksnapshotParams = (projectDir) => {
    try {
        const androidSettingsJSON = getAndroidSettingsJson(projectDir);
        if (androidSettingsJSON !== null) {
            return androidSettingsJSON.mksnapshotParams;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};

const getRuntimeNdkRevision = (projectDir) => {
    try {
        const androidSettingsJSON = getAndroidSettingsJson(projectDir);
        const result = androidSettingsJSON && androidSettingsJSON.ndkRevision;
        return result;
    } catch (e) {
        return null;
    }
};

const getAndroidSettingsJson = projectDir => {
    const androidSettingsJsonPath = resolve(projectDir, PLATFORMS_ANDROID, "settings.json");
    if (existsSync(androidSettingsJsonPath)) {
        return JSON.parse(readFileSync(androidSettingsJsonPath, "utf8"));
    } else {
        return null;
    }
};

module.exports = {
    ANDROID_PROJECT_DIR,
    ANDROID_APP_PATH,
    ANDROID_CONFIGURATIONS_PATH,
    getAndroidRuntimeVersion,
    getAndroidV8Version,
    getMksnapshotParams,
    getRuntimeNdkRevision
};
