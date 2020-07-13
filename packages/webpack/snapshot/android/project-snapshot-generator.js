const { isAbsolute, join, resolve, sep } = require("path");
const { readFileSync, writeFileSync } = require("fs");

const shelljs = require("shelljs");
const semver = require("semver");

const SnapshotGenerator = require("./snapshot-generator");
const {
    CONSTANTS
} = require("./utils");
const {
    ANDROID_PROJECT_DIR,
    ANDROID_APP_PATH,
    ANDROID_CONFIGURATIONS_PATH,
    getAndroidRuntimeVersion,
    getAndroidV8Version,
    getRuntimeNdkRevision,
    getMksnapshotParams
} = require("../../androidProjectHelpers");

// min version with settings.json file specifying the V8 version
const MIN_ANDROID_RUNTIME_VERSION = "5.2.1";
const VALID_ANDROID_RUNTIME_TAGS = Object.freeze(["next", "rc"]);

const resolveRelativePath = (path) => {
    if (path)
        return isAbsolute(path) ? path : resolve(process.cwd(), path);
    return null;
};

function ProjectSnapshotGenerator(options) {
    this.options = options = options || {};
    options.projectRoot = resolveRelativePath(options.projectRoot) || process.cwd();

    console.log("Project root: " + options.projectRoot);
    console.log("Snapshots build directory: " + this.getBuildPath());

    this.validateAndroidRuntimeVersion();
}
module.exports = ProjectSnapshotGenerator;

ProjectSnapshotGenerator.calculateBuildPath = function (projectRoot) {
    return join(
        ProjectSnapshotGenerator.calculateProjectPath(projectRoot),
        "snapshot-build",
        "build"
    );
}

ProjectSnapshotGenerator.prototype.getBuildPath = function () {
    return ProjectSnapshotGenerator.calculateBuildPath(this.options.projectRoot);
}

ProjectSnapshotGenerator.calculateProjectPath = function (projectRoot) {
    return join(projectRoot, ANDROID_PROJECT_DIR);
}

ProjectSnapshotGenerator.calculateConfigurationsPath = function (projectRoot) {
    return join(projectRoot, ANDROID_CONFIGURATIONS_PATH);
}

ProjectSnapshotGenerator.calculateAppPath = function (projectRoot) {
    return join(projectRoot, ANDROID_APP_PATH);
}

ProjectSnapshotGenerator.prototype.getProjectPath = function () {
    return ProjectSnapshotGenerator.calculateProjectPath(this.options.projectRoot);
}

ProjectSnapshotGenerator.cleanSnapshotArtefacts = function (projectRoot) {
    const platformPath = ProjectSnapshotGenerator.calculateProjectPath(projectRoot);

    // Remove blob files from prepared folder
    shelljs.rm("-rf", join(platformPath, "src/main/assets/snapshots"));

    // Remove prepared include.gradle configurations
    const configurationsPath = ProjectSnapshotGenerator.calculateConfigurationsPath(projectRoot);
    shelljs.rm("-rf", join(configurationsPath, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE));
}

ProjectSnapshotGenerator.installSnapshotArtefacts = function (projectRoot) {
    const buildPath = ProjectSnapshotGenerator.calculateBuildPath(projectRoot);
    const platformPath = ProjectSnapshotGenerator.calculateProjectPath(projectRoot);

    const appPath = ProjectSnapshotGenerator.calculateAppPath(projectRoot);
    const configurationsPath = ProjectSnapshotGenerator.calculateConfigurationsPath(projectRoot);
    const configDestinationPath = join(configurationsPath, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);

    // Remove build folder to make sure that the apk will be fully rebuild
    shelljs.rm("-rf", join(platformPath, "build"));

    // Copy include.gradle to the specified destination in the platforms folder
    shelljs.mkdir("-p", configDestinationPath);
    shelljs.cp(join(buildPath, "include.gradle"), join(configDestinationPath, "include.gradle"));

    if (shelljs.test("-e", join(buildPath, "ndk-build/libs"))) {
        // useLibs = true
        const libsDestinationPath = join(platformPath, "src", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE, "jniLibs");

        // Copy the libs to the specified destination in the platforms folder
        shelljs.mkdir("-p", libsDestinationPath);
        shelljs.cp("-R", join(buildPath, "ndk-build/libs") + sep, libsDestinationPath);
    } else {
        // useLibs = false
        const blobsSrcPath = join(buildPath, "snapshots/blobs");
        const blobsDestinationPath = resolve(appPath, "../snapshots");
        const appPackageJsonPath = join(appPath, "package.json");

        // Copy the blobs in the prepared app folder
        shelljs.cp("-R", blobsSrcPath + sep, resolve(appPath, "../snapshots"));

        // Update the package.json file
        const appPackageJson = shelljs.test("-e", appPackageJsonPath) ? JSON.parse(readFileSync(appPackageJsonPath, 'utf8')) : {};
        appPackageJson["android"] = appPackageJson["android"] || {};
        appPackageJson["android"]["heapSnapshotBlob"] = "../snapshots";
        writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2));
    }
}

ProjectSnapshotGenerator.prototype.validateAndroidRuntimeVersion = function () {
    const currentRuntimeVersion = getAndroidRuntimeVersion(this.options.projectRoot);

    if (!currentRuntimeVersion || !this.getProjectPath()) {
        throw new Error("In order to generate a V8 snapshot you must have the \"android\" platform installed - to do so please run \"tns platform add android\".");
    }

    if (!VALID_ANDROID_RUNTIME_TAGS.includes(currentRuntimeVersion) &&
        !semver.gte(currentRuntimeVersion, MIN_ANDROID_RUNTIME_VERSION)) {

        throw new Error("In order to support heap snapshots, you must have at least tns-android@" + MIN_ANDROID_RUNTIME_VERSION +
            " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
    }
}

ProjectSnapshotGenerator.prototype.generate = function (generationOptions) {
    if (generationOptions.skipSnapshotTools) {
        console.log("Skipping snapshot tools.");
        return Promise.resolve();
    }

    generationOptions = generationOptions || {};

    console.log("Running snapshot generation with the following arguments: ");
    console.log(JSON.stringify(generationOptions, null, '\t'));

    // Clean build folder
    shelljs.rm("-rf", this.getBuildPath());
    shelljs.mkdir("-p", this.getBuildPath());

    const snapshotToolsPath = resolveRelativePath(generationOptions.snapshotToolsPath) || CONSTANTS.SNAPSHOT_TMP_DIR;
    console.log("Snapshot tools path: " + snapshotToolsPath);

    // Generate snapshots
    const generator = new SnapshotGenerator({ buildPath: this.getBuildPath() });
    const noV8VersionFoundMessage = `Cannot find suitable v8 version!`;
    const mksnapshotParams = getMksnapshotParams(this.options.projectRoot);
    const recommendedAndroidNdkRevision = getRuntimeNdkRevision(this.options.projectRoot);
    const v8Version = generationOptions.v8Version || getAndroidV8Version(this.options.projectRoot);
    if (!v8Version) {
        throw new Error(noV8VersionFoundMessage);
    }

    // NOTE: Order is important! Add new archs at the end of the array
    const defaultTargetArchs = ["arm", "arm64", "ia32", "ia64"];
    const runtimeVersion = getAndroidRuntimeVersion(this.options.projectRoot);
    if (runtimeVersion && semver.lt(semver.coerce(runtimeVersion), "6.0.2")) {
        const indexOfIa64 = defaultTargetArchs.indexOf("ia64");
        // Before 6.0.2 version of Android runtime we supported only arm, arm64 and ia32.
        defaultTargetArchs.splice(indexOfIa64, defaultTargetArchs.length - indexOfIa64);
    }

    const options = {
        snapshotToolsPath,
        targetArchs: generationOptions.targetArchs || defaultTargetArchs,
        v8Version: generationOptions.v8Version || v8Version,
        preprocessedInputFile: generationOptions.preprocessedInputFile,
        useLibs: generationOptions.useLibs || false,
        inputFiles: generationOptions.inputFiles || [join(this.options.projectRoot, "__snapshot.js")],
        androidNdkPath: generationOptions.androidNdkPath,
        mksnapshotParams: mksnapshotParams,
        snapshotInDocker: generationOptions.snapshotInDocker,
        recommendedAndroidNdkRevision,
        runtimeVersion
    };

    return generator.generate(options).then(() => {
        console.log("Snapshots build finished succesfully!");

        if (generationOptions.install) {
            ProjectSnapshotGenerator.cleanSnapshotArtefacts(this.options.projectRoot);
            ProjectSnapshotGenerator.installSnapshotArtefacts(this.options.projectRoot);
            console.log(generationOptions.useLibs ?
                "Snapshot is included in the app as dynamically linked library (.so file)." :
                "Snapshot is included in the app as binary .blob file. The more space-efficient option is to embed it in a dynamically linked library (.so file).");
        }
    });;
}
