const { convertToUnixPath } = require("../lib/utils");
const { RawSource, ConcatSource } = require("webpack-sources");
const { getPackageJson } = require("../projectHelpers");
const { SNAPSHOT_ENTRY_NAME } = require("./NativeScriptSnapshotPlugin");
const path = require("path");

exports.GenerateNativeScriptEntryPointsPlugin = (function () {
    const GenerationFailedError = "Unable to generate entry files.";

    function GenerateNativeScriptEntryPointsPlugin(appEntryName) {
        this.appEntryName = appEntryName;
        this.files = {};
    };

    GenerateNativeScriptEntryPointsPlugin.prototype.apply = function (compiler) {
        this.webpackContext = compiler.options.context;

        compiler.hooks.emit.tapAsync("GenerateNativeScriptEntryPointsPlugin", (compilation, cb) => {
            compilation.entrypoints.forEach(entryPoint => {
                this.generateEntryFile(compilation, entryPoint);
            });
            this.addAsset(compilation, "package.json", this.generatePackageJson());
            this.generateTnsJavaClasses(compilation);

            cb();
        });
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generateTnsJavaClasses = function (compilation) {
        const path = compilation.compiler.outputPath;
        const isAndroid = path.indexOf("android") > -1;

        if (isAndroid && !compilation.assets["tns-java-classes.js"]) {
            this.addAsset(compilation, "tns-java-classes.js", ""); 0
        }
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generatePackageJson = function () {
        const packageJson = getPackageJson(this.webpackContext);
        packageJson.main = this.appEntryName;

        return JSON.stringify(packageJson, null, 4);
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generateEntryFile = function (compilation, entryPoint) {
        const entryPointName = entryPoint.options.name;
        let entryChunk;
        if (entryPointName === SNAPSHOT_ENTRY_NAME) {
            // Do not require the snapshot entry dependencies as the snapshot will fail.
            return;
        }

        const requiredFiles = [];
        entryPoint.chunks.forEach(chunk => {
            if (chunk.name === entryPointName) {
                entryChunk = chunk;
            } else {
                chunk.files.forEach(fileName => {
                    if (!this.isHMRFile(fileName) && this.isSourceFile(fileName)) {
                        requiredFiles.push(fileName);
                    }
                });
            }
        });

        if (!entryChunk) {
            throw new Error(`${GenerationFailedError} Entry chunk not found for entry "${entryPointName}".`);
        }

        entryChunk.files.forEach(filePath => {
            if (!compilation.assets[filePath]) {
                throw new Error(`${GenerationFailedError} File "${filePath}" not found for entry "${entryPointName}".`);
            }

            if (!this.isHMRFile(filePath) && this.isSourceFile(filePath)) {
                const currFileDirRelativePath = path.dirname(filePath);
                const pathToRootFromCurrFile = path.relative(currFileDirRelativePath, ".");

                const requireDeps = requiredFiles.map(depPath => {
                    const depRelativePath = path.join(pathToRootFromCurrFile, depPath);
                    const depRelativePathUnix = convertToUnixPath(depRelativePath);

                    return `require("./${depRelativePathUnix}");`;
                }).join("");
                const currentEntryFileContent = compilation.assets[filePath].source();

                if(compilation.assets[filePath] instanceof ConcatSource) {
                    compilation.assets[filePath].children.unshift(`${requireDeps}`);
                } else {
                    compilation.assets[filePath] = new RawSource(`${requireDeps}${currentEntryFileContent}`);
                }
            }
        });
    }
    GenerateNativeScriptEntryPointsPlugin.prototype.addAsset = function (compilation, name, content) {
        if (this.files[name] !== content) {
            this.files[name] = content;
            compilation.assets[name] = new RawSource(content);
        }
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.isHMRFile = function (fileName) {
        return fileName.indexOf("hot-update") > -1;
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.isSourceFile = function (fileName) {
        return fileName.endsWith(".js");
    }

    return GenerateNativeScriptEntryPointsPlugin;
})();
