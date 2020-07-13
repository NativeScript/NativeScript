const os = require("os");
const { dirname } = require("path");
const { existsSync, mkdirSync } = require("fs");
const { isAndroid } = require("../projectHelpers");

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);

    return config.release && platformSupportsSnapshot;
}

function convertToUnixPath(relativePath) {
    return relativePath.replace(/\\/g, "/");
}

function isWinOS() {
    return os.type() === "Windows_NT";
}

function warn(message) {
    if (message) {
        console.log(`\x1B[33;1m${message}\x1B[0m`);
    }
}

function ensureDirectoryExistence(filePath) {
    var dir = dirname(filePath);
    if (existsSync(dir)) {
        return true;
    }
    ensureDirectoryExistence(dir);
    mkdirSync(dir);
}

module.exports = {
    shouldSnapshot,
    convertToUnixPath,
    isWinOS,
    warn,
    ensureDirectoryExistence
};
