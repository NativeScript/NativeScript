const { relative, resolve, join } = require("path");
const { closeSync, openSync, writeFileSync } = require("fs");
const validateOptions = require("schema-utils");

const ProjectSnapshotGenerator = require("../../snapshot/android/project-snapshot-generator");
const { getPackageJson } = require("../../helpers/projectHelpers");
const {
    ANDROID_PROJECT_DIR,
    ANDROID_APP_PATH,
} = require("../../helpers/androidProjectHelpers");
const { ensureDirectoryExistence } = require("../../lib/utils");
const schema = require("./options.json");

const SNAPSHOT_ENTRY_NAME = "snapshot-entry";
const SNAPSHOT_ENTRY_MODULE = `${SNAPSHOT_ENTRY_NAME}.js`;
exports.SNAPSHOT_ENTRY_NAME = SNAPSHOT_ENTRY_NAME;

exports.NativeScriptSnapshotPlugin = (function () {
    function NativeScriptSnapshotPlugin(options) {
        NativeScriptSnapshotPlugin.validateSchema(options);

        ProjectSnapshotGenerator.call(this, options);

        const { webpackConfig } = this.options;
        NativeScriptSnapshotPlugin.removeLibraryTarget(webpackConfig);

        const { entry } = webpackConfig;
        if (typeof entry === "string" || Array.isArray(entry)) {
            webpackConfig.entry = { bundle: entry };
        }

        NativeScriptSnapshotPlugin.ensureSnapshotModuleEntry(this.options);
    }

    NativeScriptSnapshotPlugin.removeLibraryTarget = function (webpackConfig) {
        const { output } = webpackConfig;
        if (output) {
            output.libraryTarget = undefined;
        }
    }

    NativeScriptSnapshotPlugin.ensureSnapshotModuleEntry = function (options) {
        const { webpackConfig, requireModules, chunks, includeApplicationCss } = options;
        const internalRequireModules = this.getInternalRequireModules(webpackConfig.context);

        const snapshotEntryPath = join(ANDROID_PROJECT_DIR, SNAPSHOT_ENTRY_MODULE);

        let snapshotEntryContent = "";
        if (includeApplicationCss) {
            snapshotEntryContent += `
            require("${
                options.angular ?
                    '@nativescript/webpack/helpers/load-application-css-angular' :
                    '@nativescript/webpack/helpers/load-application-css-regular'
                }")();
            `;
        }
        snapshotEntryContent += [...requireModules, ...internalRequireModules]
            .map(mod => `require('${mod}')`).join(";");

        ensureDirectoryExistence(snapshotEntryPath);
        writeFileSync(snapshotEntryPath, snapshotEntryContent, { encoding: "utf8" });

        // add the module to the entry points to make sure it's content is evaluated
        webpackConfig.entry[SNAPSHOT_ENTRY_NAME] = relative(webpackConfig.context, snapshotEntryPath);

        // prepend the module to the script that will be snapshotted
        chunks.unshift(SNAPSHOT_ENTRY_NAME);

        // ensure that the runtime is installed only in the snapshotted chunk
        webpackConfig.optimization.runtimeChunk = { name: SNAPSHOT_ENTRY_NAME };
    }
    NativeScriptSnapshotPlugin.getInternalRequireModules = function (webpackContext) {
        const packageJson = getPackageJson(webpackContext);
        return (packageJson && packageJson["android"] && packageJson["android"]["requireModules"]) || [];
    }

    NativeScriptSnapshotPlugin.validateSchema = function (options) {
        if (!options.chunk && !options.chunks) {
            const error = NativeScriptSnapshotPlugin.extendError({ message: `No chunks specified!` });
            throw error;
        }

        try {
            validateOptions(schema, options, "NativeScriptSnapshotPlugin");

            if (options.chunk) {
                options.chunks = options.chunks || [];
                options.chunks.push(options.chunk);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    NativeScriptSnapshotPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
    NativeScriptSnapshotPlugin.prototype.constructor = NativeScriptSnapshotPlugin;

    NativeScriptSnapshotPlugin.prototype.generate = function (webpackChunks) {
        const options = this.options;
        if (options.skipSnapshotTools) {
            console.log(`Skipping snapshot tools.`);
            return Promise.resolve();
        }

        const inputFiles = webpackChunks.map(chunk => join(options.webpackConfig.output.path, chunk.files[0]));
        const preprocessedInputFile = join(
            this.options.projectRoot,
            ANDROID_APP_PATH,
            "_embedded_script_.js"
        );

        console.log(`\n Snapshotting bundle from ${inputFiles}`);

        return ProjectSnapshotGenerator.prototype.generate.call(this, {
            inputFiles,
            preprocessedInputFile,
            targetArchs: options.targetArchs,
            useLibs: options.useLibs,
            androidNdkPath: options.androidNdkPath,
            v8Version: options.v8Version,
            snapshotInDocker: options.snapshotInDocker,
            skipSnapshotTools: options.skipSnapshotTools
        }).then(() => {
            // Make the original files empty
            inputFiles.forEach(inputFile =>
                closeSync(openSync(inputFile, "w")) // truncates the input file content
            );
        });
    }

    NativeScriptSnapshotPlugin.prototype.apply = function (compiler) {
        const options = this.options;

        compiler.hooks.afterEmit.tapAsync("NativeScriptSnapshotPlugin", function (compilation, callback) {
            const chunksToSnapshot = options.chunks
                .map(name => ({ name, chunk: compilation.chunks.find(chunk => chunk.name === name) }));
            const unexistingChunks = chunksToSnapshot.filter(pair => !pair.chunk);

            if (unexistingChunks.length) {
                const message = `The following chunks does not exist: ` + unexistingChunks.map(pair => pair.name).join(", ");
                const error = NativeScriptSnapshotPlugin.extendError({ message });
                compilation.errors.push(error);
                return callback();
            }

            this.generate(chunksToSnapshot.map(pair => pair.chunk))
                .then(() => {
                    console.log("Successfully generated snapshots!");
                    return callback();
                })
                .catch((error) => {
                    const extendedError = NativeScriptSnapshotPlugin.extendError({ originalError: error });
                    compilation.errors.push(extendedError);
                    return callback();
                });
        }.bind(this));
    }

    NativeScriptSnapshotPlugin.extendError = function ({ originalError, message } = {}) {
        const header = `NativeScriptSnapshot. Snapshot generation failed!\n`;
        if (originalError) {
            originalError.message = `${header}${originalError.message}`;
            return originalError;
        }

        const newMessage = message ? `${header}${message}` : header;
        return new Error(newMessage);
    };

    return NativeScriptSnapshotPlugin;
})();

