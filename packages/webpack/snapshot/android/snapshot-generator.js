const fs = require("fs");
const { dirname, relative, join, EOL } = require("path");
const child_process = require("child_process");
const { convertToUnixPath, warn } = require("../../lib/utils");
const { isWindows } = require("./utils");
const PropertiesReader = require('properties-reader');
const semver = require("semver");
const shelljs = require("shelljs");

const { createDirectory, downloadFile, getHostOS, getHostOSArch, CONSTANTS, has32BitArch, isMacOSCatalinaOrHigher, isSubPath } = require("./utils");

const SNAPSHOTS_DOCKER_IMAGE = "nativescript/v8-snapshot:latest";
const SNAPSHOT_TOOLS_DIR_NAME = "mksnapshot-tools";
const NDK_BUILD_SEED_PATH = join(__dirname, "snapshot-generator-tools/ndk-build");
const BUNDLE_PREAMBLE_PATH = join(__dirname, "snapshot-generator-tools/bundle-preamble.js");
const BUNDLE_ENDING_PATH = join(__dirname, "snapshot-generator-tools/bundle-ending.js");
const INCLUDE_GRADLE_PATH = join(__dirname, "snapshot-generator-tools/include.gradle");
const MKSNAPSHOT_TOOLS_DOWNLOAD_ROOT_URL = "https://raw.githubusercontent.com/NativeScript/mksnapshot-tools/production/";
const MKSNAPSHOT_TOOLS_DOWNLOAD_TIMEOUT = 60000;
const SNAPSHOT_BLOB_NAME = "TNSSnapshot";
const DOCKER_IMAGE_OS = "linux";
const DOCKER_IMAGE_ARCH = "x64";

function shellJsExecuteInDir(dir, action) {
    const currentDir = shelljs.pwd();
    shelljs.cd(dir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}

function SnapshotGenerator(options) {
    this.buildPath = options.buildPath || join(__dirname, "build");
}
module.exports = SnapshotGenerator;

SnapshotGenerator.SNAPSHOT_PACKAGE_NANE = "nativescript-android-snapshot";

SnapshotGenerator.prototype.shouldSnapshotInDocker = function (hostOS, targetArchs, currentRuntimeVersion) {
    let shouldSnapshotInDocker = false;
    const minRuntimeWithoutMacOSSnapshotTools = "6.3.0";
    const generateInDockerMessage = "The snapshots will be generated in a docker container.";
    if (hostOS === CONSTANTS.WIN_OS_NAME) {
        console.log(`The V8 snapshot tools are not supported on Windows. ${generateInDockerMessage}`);
        shouldSnapshotInDocker = true;
    } else if (hostOS === CONSTANTS.MAC_OS_NAME && semver.gte(currentRuntimeVersion, minRuntimeWithoutMacOSSnapshotTools)) {
        console.log(`Starting from Android Runtime 6.3.0, the Snapshot tools are no longer supported on macOS. ${generateInDockerMessage}`);
        shouldSnapshotInDocker = true;
    } else if (isMacOSCatalinaOrHigher() && has32BitArch(targetArchs)) {
        console.log(`Starting from macOS Catalina, the 32-bit processes are no longer supported. ${generateInDockerMessage}`);
        shouldSnapshotInDocker = true;
    }

    return shouldSnapshotInDocker;
}

SnapshotGenerator.prototype.preprocessInputFiles = function (inputFiles, outputFile) {
    // Make some modifcations on the original bundle and save it on the specified path
    const bundlePreambleContent = fs.readFileSync(BUNDLE_PREAMBLE_PATH, "utf8");
    const bundleEndingContent = fs.readFileSync(BUNDLE_ENDING_PATH, "utf8");

    // IMPORTANT: join by "\n;" as we are joining IIFE functions and if the snapshot tool is used
    // along with Uglify configuration for replacing `;` with `/n`, we will generate invalid JavaScript
    // Example:
    // (function() {
    //  some code here
    //  })()
    //  // sourceMapUrl......
    //  ** when we join without `;` here, the next IIFE is assumed as a function call to the result of the first IIFE
    // (function() {
    //  some code here
    //  })()
    //  // sourceMapUrl......
    const inputFilesContent = inputFiles.map(file => fs.readFileSync(file, "utf8")).join("\n;");
    const snapshotFileContent = bundlePreambleContent + "\n" + inputFilesContent + "\n" + bundleEndingContent;
    fs.writeFileSync(outputFile, snapshotFileContent, { encoding: "utf8" });
}

const snapshotToolsDownloads = {};

SnapshotGenerator.prototype.downloadMksnapshotTools = function (snapshotToolsPath, v8Version, targetArchs, snapshotInDocker) {
    var toolsOS = "";
    var toolsArch = "";
    if (snapshotInDocker) {
        toolsOS = DOCKER_IMAGE_OS;
        toolsArch = DOCKER_IMAGE_ARCH;
    } else {
        toolsOS = getHostOS();
        toolsArch = getHostOSArch();
    }

    return Promise.all(targetArchs.map((arch) => {
        return this.downloadMksnapshotTool(snapshotToolsPath, v8Version, arch, toolsOS, toolsArch).then(path => {
            return { path, arch };
        });
    }));
}

SnapshotGenerator.prototype.downloadMksnapshotTool = function (snapshotToolsPath, v8Version, targetArch, hostOS, hostArch) {
    const mksnapshotToolRelativePath = join(SNAPSHOT_TOOLS_DIR_NAME, "v8-v" + v8Version, hostOS + "-" + hostArch, "mksnapshot-" + targetArch);
    const mksnapshotToolPath = join(snapshotToolsPath, mksnapshotToolRelativePath);
    if (fs.existsSync(mksnapshotToolPath))
        return Promise.resolve(mksnapshotToolPath);

    if (snapshotToolsDownloads[mksnapshotToolPath])
        return snapshotToolsDownloads[mksnapshotToolPath];

    const downloadUrl = MKSNAPSHOT_TOOLS_DOWNLOAD_ROOT_URL + mksnapshotToolRelativePath;
    createDirectory(dirname(mksnapshotToolPath));
    snapshotToolsDownloads[mksnapshotToolPath] = downloadFile(downloadUrl, mksnapshotToolPath, MKSNAPSHOT_TOOLS_DOWNLOAD_TIMEOUT);
    snapshotToolsDownloads[mksnapshotToolPath].catch(err => {
        const errorMessage = err && err.message ? err.message : "";
        let cleanupError = "";
        try {
            fs.unlinkSync(mksnapshotToolPath);
        } catch (unlinkErr) {
            if (unlinkErr && unlinkErr.code !== "ENOENT") {
                cleanupError = `${EOL}Failed to cleanup mksnapshot tool.`;
            }
        }

        throw new Error(`Failed to download mksnapshot tool. Error: ${errorMessage}.${cleanupError}`);
    });
    return snapshotToolsDownloads[mksnapshotToolPath];
}

SnapshotGenerator.prototype.convertToAndroidArchName = function (archName) {
    switch (archName) {
        case "arm": return "armeabi-v7a";
        case "arm64": return "arm64-v8a";
        case "ia32": return "x86";
        case "ia64": return "x86_64";
        default: return archName;
    }
}

SnapshotGenerator.prototype.generateSnapshots = function (snapshotToolsPath, inputFile, v8Version, targetArchs, buildCSource, mksnapshotParams, snapshotInDocker) {
    // Cleans the snapshot build folder
    shelljs.rm("-rf", join(this.buildPath, "snapshots"));
    return this.downloadMksnapshotTools(snapshotToolsPath, v8Version, targetArchs, snapshotInDocker).then((localTools) => {
        var shouldDownloadDockerTools = false;
        if (!snapshotInDocker) {
            snapshotInDocker = localTools.some(tool => !this.canUseSnapshotTool(tool.path));
            shouldDownloadDockerTools = snapshotInDocker;
        }

        if (shouldDownloadDockerTools) {
            return this.downloadMksnapshotTools(snapshotToolsPath, v8Version, targetArchs, snapshotInDocker).then((dockerTools) => {
                console.log(`Generating snapshots in a docker container.`);
                return this.runMksnapshotTools(snapshotToolsPath, dockerTools, inputFile, mksnapshotParams, buildCSource, snapshotInDocker);
            });
        }

        return this.runMksnapshotTools(snapshotToolsPath, localTools, inputFile, mksnapshotParams, buildCSource, snapshotInDocker);
    });
}


SnapshotGenerator.prototype.runMksnapshotTools = function (snapshotToolsBasePath, snapshotTools, inputFile, mksnapshotParams, buildCSource, snapshotInDocker) {
    let currentSnapshotOperation = Promise.resolve();
    const canRunInParallel = !snapshotInDocker;
    return Promise.all(snapshotTools.map((tool) => {
        if (canRunInParallel) {
            return this.runMksnapshotTool(tool, mksnapshotParams, inputFile, snapshotInDocker, snapshotToolsBasePath, buildCSource);
        } else {
            currentSnapshotOperation = currentSnapshotOperation.then(() => {
                return this.runMksnapshotTool(tool, mksnapshotParams, inputFile, snapshotInDocker, snapshotToolsBasePath, buildCSource);
            });

            return currentSnapshotOperation;
        }
    })).then(() => {
        console.log("***** Finished generating snapshots. *****");
    });
}

SnapshotGenerator.prototype.canUseSnapshotTool = function (snapshotToolPath) {
    try {
        child_process.execSync(`${snapshotToolPath} --help`);
        return true;
    }
    catch (error) {
        console.log(`Unable to execute '${snapshotToolPath}' locally.Error message: '${error.message}'`);
        return false;
    }
}

SnapshotGenerator.prototype.setupDocker = function () {
    try {
        child_process.execSync(`docker --version`);
    }
    catch (error) {
        throw new Error(`Docker installation cannot be found. Install Docker and add it to your PATH in order to build snapshots.`);
    }

    child_process.execSync(`docker pull ${SNAPSHOTS_DOCKER_IMAGE}`);
}

SnapshotGenerator.prototype.buildSnapshotLibs = function (androidNdkPath, recommendedAndroidNdkRevision, targetArchs) {
    // Compile *.c files to produce *.so libraries with ndk-build tool
    const androidNdkBuildPath = this.getAndroidNdkBuildPath(androidNdkPath, recommendedAndroidNdkRevision);
    const ndkBuildPath = join(this.buildPath, "ndk-build");
    const androidArchs = targetArchs.map(arch => this.convertToAndroidArchName(arch));
    console.log("Building native libraries for " + androidArchs.join());
    shelljs.rm("-rf", ndkBuildPath);
    shelljs.cp("-r", NDK_BUILD_SEED_PATH, ndkBuildPath);
    fs.writeFileSync(join(ndkBuildPath, "jni/Application.mk"), "APP_ABI := " + androidArchs.join(" ")); // create Application.mk file
    shelljs.mv(join(this.buildPath, "snapshots/src/*"), join(ndkBuildPath, "jni"));
    shellJsExecuteInDir(ndkBuildPath, function () {
        shelljs.exec(androidNdkBuildPath);
    });
    return join(ndkBuildPath, "libs");
}

SnapshotGenerator.prototype.getAndroidNdkBuildPath = function (androidNdkPath, recommendedAndroidNdkRevision) {
    const ndkBuildExecutableName = isWindows() ? "ndk-build.cmd" : "ndk-build";
    let hasNdk = false;
    // fallback for Android Runtime < 6.2.0 with the 6.1.0 value
    recommendedAndroidNdkRevision = recommendedAndroidNdkRevision || "20.0.5594570";
    let androidNdkBuildPath = "";
    if (androidNdkPath) {
        // specified by the user
        const localNdkRevision = this.getAndroidNdkRevision(androidNdkPath);
        androidNdkBuildPath = join(androidNdkPath, ndkBuildExecutableName);
        if (!fs.existsSync(androidNdkBuildPath)) {
            throw new Error(`The provided Android NDK path does not contain ${ndkBuildExecutableName} executable.`);
        } else if (localNdkRevision !== recommendedAndroidNdkRevision) {
            warn(this.getRecommendedNdkWarning(localNdkRevision, recommendedAndroidNdkRevision));
        }

        hasNdk = true;
        console.log("Using Android NDK from webpack.config.");
    } else {
        if (process.env.ANDROID_NDK_HOME) {
            // check ANDROID_NDK_HOME
            const localNdkRevision = this.getAndroidNdkRevision(process.env.ANDROID_NDK_HOME);
            androidNdkBuildPath = join(process.env.ANDROID_NDK_HOME, ndkBuildExecutableName);
            if (fs.existsSync(androidNdkBuildPath)) {
                hasNdk = true;
                console.log("Using Android NDK from ANDROID_NDK_HOME.");
            }

            if (localNdkRevision !== recommendedAndroidNdkRevision) {
                warn(this.getRecommendedNdkWarning(localNdkRevision, recommendedAndroidNdkRevision));
            }
        }

        if (!hasNdk) {
            // available globally
            androidNdkBuildPath = ndkBuildExecutableName;
            try {
                child_process.execSync(`${androidNdkBuildPath} --version`, { stdio: "ignore" });
                hasNdk = true;
                console.log("Using Android NDK from PATH.");
                console.log(`Cannot determine the version of the global Android NDK. The recommended versions is v${recommendedAndroidNdkRevision}`);
            } catch (_) {
            }
        }

        if (!hasNdk) {
            // installed in ANDROID_HOME
            androidNdkBuildPath = join(process.env.ANDROID_HOME, "ndk", recommendedAndroidNdkRevision, ndkBuildExecutableName);
            if (fs.existsSync(androidNdkBuildPath)) {
                hasNdk = true;
                console.log("Using Android NDK from ANDROID_HOME.");
            }
        }
    }

    if (!hasNdk) {
        throw new Error(`Android NDK v${recommendedAndroidNdkRevision} is not installed. Install it from Android Studio or download it and set ANDROID_NDK_HOME or add it to your PATH. You can find installation instructions in this article: https://developer.android.com/studio/projects/install-ndk#specific-version`);
    }

    return androidNdkBuildPath;
}

SnapshotGenerator.prototype.getAndroidNdkRevision = function (androidNdkPath) {
    const ndkPropertiesFile = join(androidNdkPath, "source.properties");
    if (fs.existsSync(ndkPropertiesFile)) {
        const properties = PropertiesReader(ndkPropertiesFile);
        return properties.get("Pkg.Revision");
    } else {
        return null;
    }
}

SnapshotGenerator.prototype.buildIncludeGradle = function () {
    shelljs.cp(INCLUDE_GRADLE_PATH, join(this.buildPath, "include.gradle"));
}

SnapshotGenerator.prototype.generate = function (options) {
    // Arguments validation
    options = options || {};
    if (!options.v8Version) { throw new Error("No v8 version specified."); }
    if (!options.snapshotToolsPath) { throw new Error("snapshotToolsPath option is not specified."); }
    const preprocessedInputFile = options.preprocessedInputFile || join(this.buildPath, "inputFile.preprocessed");

    console.log("***** Starting snapshot generation using V8 version: ", options.v8Version);

    this.preprocessInputFiles(options.inputFiles, preprocessedInputFile);
    const hostOS = getHostOS();
    const snapshotInDocker = options.snapshotInDocker || this.shouldSnapshotInDocker(hostOS, options.targetArchs, options.runtimeVersion);

    // generates the actual .blob and .c files
    return this.generateSnapshots(
        options.snapshotToolsPath,
        preprocessedInputFile,
        options.v8Version,
        options.targetArchs,
        options.useLibs,
        options.mksnapshotParams,
        snapshotInDocker
    ).then(() => {
        this.buildIncludeGradle();
        if (options.useLibs) {
            this.buildSnapshotLibs(options.androidNdkPath, options.recommendedAndroidNdkRevision, options.targetArchs);
        }
        return this.buildPath;
    });
}

SnapshotGenerator.prototype.getSnapshotToolCommand = function (snapshotToolPath, inputFilePath, outputPath, toolParams) {
    return `${snapshotToolPath} ${inputFilePath} --startup_blob ${outputPath} ${toolParams}`;
}

SnapshotGenerator.prototype.getXxdCommand = function (srcOutputDir, xxdLocation) {
    // https://github.com/NativeScript/docker-images/tree/master/v8-snapshot/bin
    return `${xxdLocation || ""}xxd -i ${SNAPSHOT_BLOB_NAME}.blob > ${srcOutputDir}`;
}

SnapshotGenerator.prototype.getPathInDocker = function (mappedLocalDir, mappedDockerDir, targetPath) {
    if (!isSubPath(mappedLocalDir, targetPath)) {
        throw new Error(`Cannot determine a docker path. '${targetPath}' should be inside '${mappedLocalDir}'`)
    }

    const pathInDocker = join(mappedDockerDir, relative(mappedLocalDir, targetPath));

    return convertToUnixPath(pathInDocker);
}

SnapshotGenerator.prototype.handleSnapshotToolResult = function (error, stdout, stderr, inputFile, androidArch) {
    let toolError = null;
    const errorHeader = `Target architecture: ${androidArch}\n`;
    let errorFooter = ``;
    if ((stderr && stderr.length) || error) {
        try {
            require(inputFile);
        }
        catch (e) {
            errorFooter = `\nJavaScript execution error: ${e.stack}$`;
        }
    }

    if (stderr && stderr.length) {
        const message = `${errorHeader}${stderr}${errorFooter}`;
        toolError = new Error(message);
    }
    else if (error) {
        error.message = `${errorHeader}${error.message}${errorFooter}`;
        toolError = error;
    } else {
        console.log(stdout);
    }

    return toolError;
}

SnapshotGenerator.prototype.copySnapshotTool = function (allToolsDir, targetTool, destinationDir) {
    // we cannot mount the source tools folder as its not shared by default:
    // docker: Error response from daemon: Mounts denied:
    // The path /var/folders/h2/1yck52fx2mg7c790vhcw90s8087sk8/T/snapshot-tools/mksnapshot-tools
    // is not shared from OS X and is not known to Docker.
    const toolPathRelativeToAllToolsDir = relative(allToolsDir, targetTool);
    const toolDestinationPath = join(destinationDir, toolPathRelativeToAllToolsDir)
    createDirectory(dirname(toolDestinationPath));
    shelljs.cp(targetTool, toolDestinationPath);

    return toolDestinationPath;
}

SnapshotGenerator.prototype.buildCSource = function (androidArch, blobInputDir, snapshotInDocker) {
    const srcOutputDir = join(this.buildPath, "snapshots/src", androidArch);
    createDirectory(srcOutputDir);
    let command = "";
    if (snapshotInDocker) {
        const blobsInputInDocker = `/blobs/${androidArch}`
        const srcOutputDirInDocker = `/dist/src/${androidArch}`;
        const outputPathInDocker = this.getPathInDocker(srcOutputDir, srcOutputDirInDocker, join(srcOutputDir, `${SNAPSHOT_BLOB_NAME}.c`));
        const buildCSourceCommand = this.getXxdCommand(outputPathInDocker, "/bin/");
        command = `docker run --rm -v "${blobInputDir}:${blobsInputInDocker}" -v "${srcOutputDir}:${srcOutputDirInDocker}" ${SNAPSHOTS_DOCKER_IMAGE} /bin/sh -c "cd ${blobsInputInDocker} && ${buildCSourceCommand}"`;
    }
    else {
        command = this.getXxdCommand(join(srcOutputDir, `${SNAPSHOT_BLOB_NAME}.c`));
    }
    shellJsExecuteInDir(blobInputDir, function () {
        shelljs.exec(command);
    });
}

SnapshotGenerator.prototype.getRecommendedNdkWarning = function (localNdkRevision, recommendedAndroidNdkRevision) {
    return `The provided Android NDK is v${localNdkRevision} while the recommended one is v${recommendedAndroidNdkRevision}`;
}

SnapshotGenerator.prototype.runMksnapshotTool = function (tool, mksnapshotParams, inputFile, snapshotInDocker, snapshotToolsPath, buildCSource) {
    const toolPath = tool.path;
    const androidArch = this.convertToAndroidArchName(tool.arch);
    if (!fs.existsSync(toolPath)) {
        throw new Error(`Can't find mksnapshot tool for ${androidArch} at path ${toolPath}`);
    }

    const tempFolders = [];
    return new Promise((resolve, reject) => {
        console.log("***** Generating snapshot for " + androidArch + " *****");
        const inputFileDir = dirname(inputFile);
        const blobOutputDir = join(this.buildPath, "snapshots/blobs", androidArch);
        createDirectory(blobOutputDir);
        const toolParams = mksnapshotParams || "--profile_deserialization";

        let command = "";
        if (snapshotInDocker) {
            this.setupDocker();
            const appDirInDocker = "/app";
            const blobOutputDirInDocker = `/dist/blobs/${androidArch}`;
            const toolsTempFolder = join(inputFileDir, "tmp");
            tempFolders.push(toolsTempFolder);
            const toolPathInAppDir = this.copySnapshotTool(snapshotToolsPath, toolPath, toolsTempFolder);
            const toolPathInDocker = this.getPathInDocker(inputFileDir, appDirInDocker, toolPathInAppDir);
            const inputFilePathInDocker = this.getPathInDocker(inputFileDir, appDirInDocker, inputFile);
            const outputPathInDocker = this.getPathInDocker(blobOutputDir, blobOutputDirInDocker, join(blobOutputDir, `${SNAPSHOT_BLOB_NAME}.blob`));
            const toolCommandInDocker = this.getSnapshotToolCommand(toolPathInDocker, inputFilePathInDocker, outputPathInDocker, toolParams);
            command = `docker run --rm -v "${inputFileDir}:${appDirInDocker}" -v "${blobOutputDir}:${blobOutputDirInDocker}" ${SNAPSHOTS_DOCKER_IMAGE} /bin/sh -c "${toolCommandInDocker}"`;
        } else {
            command = this.getSnapshotToolCommand(toolPath, inputFile, join(blobOutputDir, `${SNAPSHOT_BLOB_NAME}.blob`), toolParams);
        }

        // Generate .blob file
        child_process.exec(command, { encoding: "utf8" }, (error, stdout, stderr) => {
            tempFolders.forEach(tempFolder => {
                shelljs.rm("-rf", tempFolder);
            });

            const snapshotError = this.handleSnapshotToolResult(error, stdout, stderr, inputFile, androidArch);
            if (snapshotError) {
                return reject(snapshotError);
            }

            return resolve(blobOutputDir);
        });
    }).then((blobOutputDir) => {
        // Generate .c file
        if (buildCSource) {
            this.buildCSource(androidArch, blobOutputDir, snapshotInDocker)
        }

        /*
        Rename TNSSnapshot.blob files to snapshot.blob files. The xxd tool uses the file name for the name of the static array. 
        This is why the *.blob files are initially named  TNSSnapshot.blob. 
        After the xxd step, they must be renamed to snapshot.blob, because this is the filename that the Android runtime is looking for.
        */
        shelljs.mv(join(blobOutputDir, `${SNAPSHOT_BLOB_NAME}.blob`), join(blobOutputDir, `snapshot.blob`));
    });
}
