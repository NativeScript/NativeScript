"use strict";
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var arg1 = process.argv.length > 2 ? process.argv[2] : "";
var isTranspile = arg1.indexOf("t") >= 0;
var isIncremental = arg1.indexOf("i") >= 0;
var isWatching = arg1.indexOf("w") >= 0;
var opts = [];
if (isTranspile) {
    opts.push("transpile");
}
if (isIncremental) {
    opts.push("incremental");
}
if (isWatching) {
    opts.push("watch");
}
if (opts.length > 0) {
    console.log("Options: " + opts.join(", "));
}
function isTS(file) {
    return file.lastIndexOf(".ts") === file.length - 3;
}
function isDTS(file) {
    return file.lastIndexOf(".d.ts") === file.length - 5;
}
function getJsPath(tsPath) {
    return path.join(path.dirname(tsPath), path.basename(tsPath, ".ts")) + ".js";
}
function hasChanged(tsName) {
    try {
        var jsName = getJsPath(tsName);
        var tsTime = fs.statSync(tsName).mtime.getTime();
        var jsTime = fs.statSync(jsName).mtime.getTime();
        return jsTime < tsTime;
    }
    catch (e) {
        return true;
    }
}
function transpile(fileNames, options) {
    console.time("transpile");
    var files = fileNames.filter(function (f) { return !isDTS(f); });
    if (isIncremental) {
        files = files.filter(hasChanged);
    }
    files.forEach(function (tsPath) {
        var tsSource = fs.readFileSync(tsPath, { encoding: "utf8" });
        var jsSource = ts.transpile(tsSource, options);
        var jsPath = getJsPath(tsPath);
        fs.writeFileSync(jsPath, jsSource, { flag: "w" }, function (err) { console.log(err); });
        if (isIncremental) {
            console.log(" - " + tsPath);
        }
    });
    console.timeEnd("transpile");
    if (isWatching) {
        console.log("Watching for changes...");
        fs.watch(".", { persistent: true, recursive: true, encoding: "utf8" }, function (event, file) {
            try {
                if (isTS(file) && !isDTS(file)) {
                    var tsPath = file;
                    var label = " - " + tsPath;
                    console.time(label);
                    var tsSource = fs.readFileSync(tsPath, { encoding: "utf8" });
                    var jsSource = ts.transpile(tsSource, options);
                    var jsPath = getJsPath(tsPath);
                    fs.writeFileSync(jsPath, jsSource, { flag: "w" }, function (err) { console.log(err); });
                    console.timeEnd(label);
                }
            }
            catch (e) {
            }
        });
    }
}
function compile(fileNames, options) {
    console.time("program");
    var program = ts.createProgram(fileNames, options);
    console.timeEnd("program");
    var sourceFiles = program.getSourceFiles().filter(function (f) { return !isDTS(f.fileName); });
    var emitResults = [];
    var allDiagnostics = [];
    console.time("transpile");
    if (isIncremental) {
        sourceFiles = sourceFiles.filter(function (srcFile) { return hasChanged(srcFile.fileName); });
        sourceFiles.forEach(function (srcFile) {
            console.log(" - " + srcFile.fileName);
            emitResults.push(program.emit(srcFile));
        });
    }
    else {
        sourceFiles.forEach(function (srcFile) { return emitResults.push(program.emit(srcFile)); });
    }
    console.timeEnd("transpile");
    console.time("diagnostics");
    sourceFiles.forEach(function (srcFile) { return allDiagnostics = allDiagnostics.concat(ts.getPreEmitDiagnostics(program, srcFile)); });
    emitResults.forEach(function (er) { return allDiagnostics = allDiagnostics.concat(er.diagnostics); });
    allDiagnostics.forEach(function (diagnostic) {
        var d = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var line = d.line;
        var character = d.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        var code = diagnostic.code;
        console.log(diagnostic.file.fileName + "(" + (line + 1) + "," + (character + 1) + "): TS" + code + ": " + message);
    });
    console.timeEnd("diagnostics");
    var exitCode = emitResults.some(function (er) { return er.emitSkipped; }) ? 1 : 0;
    console.log("Process exiting with code " + exitCode + ".");
    process.exit(exitCode);
}
var files = JSON.parse(fs.readFileSync("./tsconfig.json")).files;
var options = {
    noEmitOnError: true,
    noEmitHelpers: true,
    target: 1 /* ES5 */,
    module: 1 /* CommonJS */,
    declaration: false,
    noImplicitAny: false,
    noImplicitUseStrict: true,
    experimentalDecorators: true
};
if (isTranspile) {
    transpile(files, { module: 1 /* CommonJS */ });
}
else {
    compile(files, options);
}
