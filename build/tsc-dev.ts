import * as ts from "typescript";
declare var process, require;
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

function isTS(file: string): boolean {
    return file.lastIndexOf(".ts") === file.length - 3;
}

function isDTS(file: string): boolean {
    return file.lastIndexOf(".d.ts") === file.length - 5;
}

function getJsPath(tsPath: string): string {
    return path.join(path.dirname(tsPath), path.basename(tsPath, ".ts")) + ".js";
}

function hasChanged(tsName: string): boolean {
    try {
        var jsName = getJsPath(tsName);
        
        var tsTime = fs.statSync(tsName).mtime.getTime();
        var jsTime = fs.statSync(jsName).mtime.getTime();
    
        return jsTime < tsTime;
    } catch(e) {
        return true;
    }
}

function transpile(fileNames: string[], options: ts.CompilerOptions) {
    console.time("transpile");
    var files = fileNames.filter(f => !isDTS(f));
    if (isIncremental) {
        files = files.filter(hasChanged);
    }
    files.forEach(tsPath => {
        var tsSource = fs.readFileSync(tsPath, { encoding: "utf8" });
        var jsSource = ts.transpile(tsSource, options);
        var jsPath = getJsPath(tsPath);
        fs.writeFileSync(jsPath, jsSource, { flag: "w" }, function(err) { console.log(err); });
        if (isIncremental) {
            console.log(" - " + tsPath);
        }
    });
    console.timeEnd("transpile");
    
    if (isWatching) {
        // NOTE: Perhaps on file change before incremental compilation we should read the tsconfig.json again and update only tsconfig.json files.

        console.log("Watching for changes...");
        fs.watch(".", { persistent: true, recursive: true, encoding: "utf8" }, (event, file) => {
            try {
                if (isTS(file) && !isDTS(file) && file.indexOf("platforms/android/") < 0 && file.indexOf("platforms/ios/") < 0) {
                    var tsPath = file;
                    var label = " - " + tsPath;
                    console.time(label);
                    var tsSource = fs.readFileSync(tsPath, { encoding: "utf8" });
                    var jsSource = ts.transpile(tsSource, options);
                    var jsPath = getJsPath(tsPath);
                    fs.writeFileSync(jsPath, jsSource, { flag: "w" }, function(err) { console.log(err); });
                    console.timeEnd(label);
                }
            } catch(e) {
                // console.log(e);
            }
        });
    }
}

function compile(fileNames: string[], options: ts.CompilerOptions) {
    console.time("program");
    var program = ts.createProgram(fileNames, options);
    
    console.timeEnd("program");
    var sourceFiles = program.getSourceFiles().filter(f => !isDTS(f.fileName));
    
    var emitResults = [];
    var allDiagnostics = [];
    
    console.time("transpile");
    if (isIncremental) {
        sourceFiles = sourceFiles.filter(srcFile => hasChanged(srcFile.fileName));
        sourceFiles.forEach(srcFile => {
            console.log(" - " + srcFile.fileName);
            emitResults.push(program.emit(srcFile));
        });
    } else {
        sourceFiles.forEach(srcFile => emitResults.push(program.emit(srcFile)));
    }
    console.timeEnd("transpile");
    
    console.time("diagnostics");
    sourceFiles.forEach(srcFile => allDiagnostics = allDiagnostics.concat(ts.getPreEmitDiagnostics(program, srcFile)));
    emitResults.forEach(er => allDiagnostics = allDiagnostics.concat(er.diagnostics));

    allDiagnostics.forEach(diagnostic => {
        var d = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var line = d.line;
        var character = d.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        var code = diagnostic.code;
        console.log(diagnostic.file.fileName + "(" + (line + 1) + "," + (character + 1) + "): TS" + code + ": " + message);
    });
    console.timeEnd("diagnostics");

    var exitCode = emitResults.some(er => er.emitSkipped) ? 1 : 0;

    console.log("Process exiting with code " + exitCode + ".");
    process.exit(exitCode);
}

var configFileName = path.resolve("tsconfig.json");
var configObject = JSON.parse(fs.readFileSync("./tsconfig.json"));
var configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));

if (isTranspile) {
    transpile(configParseResult.fileNames, configParseResult.options);
} else {
    compile(configParseResult.fileNames, configParseResult.options);
}

