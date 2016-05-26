"use strict";
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var arg1 = process.argv.length > 2 ? process.argv[2] : "";
var isIncremental = arg1.indexOf("i") >= 0;
if (isIncremental) {
    console.log("incremental");
}
function compile(fileNames, options) {
    console.time("program");
    var program = ts.createProgram(fileNames, options);
    console.timeEnd("program");
    var sourceFiles = program.getSourceFiles().filter(function (f) { return f.fileName.lastIndexOf(".d.ts") !== f.fileName.length - 5; });
    var emitResults = [];
    var allDiagnostics = [];
    console.time("transpile");
    if (isIncremental) {
        sourceFiles = sourceFiles.filter(function (srcFile) {
            try {
                var tsName = srcFile.fileName;
                var jsName = path.join(path.dirname(tsName), path.basename(tsName, ".ts")) + ".js";
                var tsTime = fs.statSync(tsName).mtime.getTime();
                var jsTime = fs.statSync(jsName).mtime.getTime();
                return jsTime < tsTime;
            }
            catch (e) {
                return true;
            }
        });
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
compile(files, {
    noEmitOnError: true,
    noEmitHelpers: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    declaration: false,
    noImplicitAny: false,
    noImplicitUseStrict: true,
    experimentalDecorators: true
});
