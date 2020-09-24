const { chmodSync, createWriteStream } = require("fs");
const { tmpdir, EOL } = require("os");
const { join, relative, isAbsolute } = require("path");
const os = require("os");

const { mkdir } = require("shelljs");
const { get } = require("request");
const { getProxySettings } = require("proxy-lib");
const semver = require("semver");

const CONSTANTS = {
    SNAPSHOT_TMP_DIR: join(tmpdir(), "snapshot-tools"),
    MAC_OS_NAME: "darwin",
    WIN_OS_NAME: "win",
    LINUX_OS_NAME: "linux"
};

const createDirectory = dir => mkdir('-p', dir);

function getHostOS() {
    const hostOS = os.type().toLowerCase();
    if (hostOS.startsWith(CONSTANTS.MAC_OS_NAME))
        return CONSTANTS.MAC_OS_NAME;
    if (hostOS.startsWith(CONSTANTS.LINUX_OS_NAME))
        return CONSTANTS.LINUX_OS_NAME;
    if (hostOS.startsWith(CONSTANTS.WIN_OS_NAME))
        return CONSTANTS.WIN_OS_NAME;
    return hostOS;
}

function getHostOSVersion() {
    return os.release();
}

function getHostOSArch() {
    return os.arch();
}

function has32BitArch(targetArchs) {
    return (Array.isArray(targetArchs) && targetArchs.some(arch => arch === "arm" || arch === "ia32")) ||
        (targetArchs === "arm" || targetArchs === "ia32");
}

function isSubPath(parentPath, childPath) {
    const relativePath = relative(parentPath, childPath);

    return relativePath === "" ||
        (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath));
}

function isMacOSCatalinaOrHigher() {
    let isCatalinaOrHigher = false;
    const catalinaVersion = "19.0.0";
    const hostOS = getHostOS();
    if (hostOS === CONSTANTS.MAC_OS_NAME) {
        const hostOSVersion = getHostOSVersion();
        isCatalinaOrHigher = semver.gte(hostOSVersion, catalinaVersion);
    }

    return isCatalinaOrHigher;
}

function isWindows() {
    return getHostOS() === CONSTANTS.WIN_OS_NAME;
}

const downloadFile = (url, destinationFilePath, timeout) =>
    new Promise((resolve, reject) => {
        getRequestOptions(url, timeout)
            .then(options =>
                get(options)
                    .on("error", reject)
                    .pipe(createWriteStream(destinationFilePath, { autoClose: true }))
                    .on("finish", _ => {
                        chmodSync(destinationFilePath, 0755);
                        return resolve(destinationFilePath);
                    })
            ).catch(reject);
    });

const getJsonFile = url =>
    new Promise((resolve, reject) => {
        getRequestOptions(url)
            .then(options =>
                get(options, (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }

                    if (!response || response.statusCode !== 200) {
                        return reject(`Couldn't fetch ${url}! Response:${EOL}${response}`);
                    }

                    try {
                        const data = JSON.parse(body);
                        resolve(data);
                    } catch (error) {
                        reject(`Couldn't parse json data! Original error:${EOL}${error}`);
                    }
                })
            ).catch(reject);
    });

const getRequestOptions = (url, timeout) =>
    new Promise((resolve, reject) => {
        const options = { url, timeout };
        getProxySettings()
            .then(proxySettings => {
                const allOptions = Object.assign(options, proxySettings);
                resolve(allOptions);
            })
            .catch(error =>
                reject(`Couldn't get proxy settings! Original error:${EOL}${error}`));
    });

module.exports = {
    CONSTANTS,
    createDirectory,
    has32BitArch,
    getHostOS,
    getHostOSVersion,
    getHostOSArch,
    isMacOSCatalinaOrHigher,
    downloadFile,
    getJsonFile,
    isSubPath,
    isWindows
};
