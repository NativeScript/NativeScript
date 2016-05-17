"use strict";
var ts = require("typescript");
var fs = require("fs");
function compile(fileNames, options) {
    var program = ts.createProgram(fileNames, options);
    var sourceFiles = program.getSourceFiles().filter(function (f) { return f.fileName.lastIndexOf(".d.ts") !== f.fileName.length - 5; });
    // sourceFiles.forEach(sf => console.log(" - " + sf.fileName));
    var emitResults = [];
    var allDiagnostics = [];
    sourceFiles.forEach(function (srcFile) { return emitResults.push(program.emit(srcFile)); });
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
