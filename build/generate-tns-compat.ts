import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";

import * as readdirp from "readdirp";
import { EntryInfo } from "readdirp";

const inputFolder = path.resolve("dist/nativescript-core");
const outputFolder = path.resolve("dist/tns-core-modules");

// rimraf.sync(outputFolder);
// console.log(`OUTPUT folder purged: ${outputFolder}`);

interface TestImport {
    module: string;
    origin: "pck" | "dts";
}
const testImports = [];

const dtsBlacklist = [
    "module.d.ts",
    "nativescript-error.d.ts",
    "references.d.ts",
    "tns-core-modules.d.ts"
];

readdirp(inputFolder, {
    fileFilter: ["*.ts", "*.js", "package.json"],
    directoryFilter: (di) => {
        return !di.path.startsWith("node_modules") &&
            !di.path.startsWith("platforms");
    }
}).on("data", (entry: typeof EntryInfo) => {
    const basename = entry.basename;
    const relativePath = entry.path;

    if (basename.endsWith(".d.ts")) {
        processDefinitionFile(entry);
    } else if (basename.endsWith(".ts")) {
        // processTypeScriptFile(entry);
    } else if (basename.endsWith(".js")) {
        // processJavaScriptFile(entry);
    } else if (basename === "package.json" && relativePath !== "package.json") {
        processPackageJsonFile(entry);
    }
})
    .on("warn", error => console.error("non-fatal error", error))
    .on("error", error => console.error("fatal error", error))
    .on("end", checkJsonFiles);

function processDefinitionFile(entry: typeof EntryInfo) {
    if (dtsBlacklist.includes(entry.path)) {
        console.log(`SKIP: ${entry.path}`);

        return;
    }

    let relativeFilePathNoExt = entry.path.replace(/\.d\.ts$/, "");
    let outputDefinitionFilePath = path.join(outputFolder, relativeFilePathNoExt + ".d.ts");
    let outputTypescriptFilePath = path.join(outputFolder, relativeFilePathNoExt + ".ts");

    ensureDirectoryExistence(outputDefinitionFilePath);

    fs.writeFileSync(outputDefinitionFilePath, `export * from "@nativescript/core/${relativeFilePathNoExt}";`);
    logFileCreated(outputDefinitionFilePath, "d.ts");

    fs.writeFileSync(outputTypescriptFilePath, `export * from "@nativescript/core/${relativeFilePathNoExt}";`);
    logFileCreated(outputDefinitionFilePath, "ts");

    addTestImport(relativeFilePathNoExt, "dts");
}

function processTypeScriptFile(entry: typeof EntryInfo) {
    let relativeFilePathNoPlat = entry.path.replace(/(\.android|\.ios)?\.ts$/, "");
    let outputFilePath = path.join(outputFolder, relativeFilePathNoPlat + ".ts");

    ensureDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, `export * from "@nativescript/core/${relativeFilePathNoPlat}";`);

    logFileCreated(outputFilePath, "ts");
}

function processPackageJsonFile(entry: typeof EntryInfo) {
    let outputFilePath = path.join(outputFolder, entry.path);

    ensureDirectoryExistence(outputFilePath);

    (<any>fs).copyFileSync(entry.fullPath, outputFilePath);
    logFileCreated(outputFilePath, "package.json");

    const json = require(entry.fullPath);
    if (json.main) {
        addTestImport(path.dirname(entry.path), "pck");
    }
}

function processJavaScriptFile(entry: typeof EntryInfo) {
    const tsFile = entry.fullPath.replace(/\.js$/, ".ts");
    if (fs.existsSync(tsFile)) {
        return;
    }

    let relativeFilePathNoExt = entry.path.replace(/\.js$/, "");
    let outputFilePath = path.join(outputFolder, relativeFilePathNoExt + ".ts");

    // crate a TS file re-exporting everything from the js
    ensureDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, `export * from "@nativescript/core/${relativeFilePathNoExt}";`);

    logFileCreated(outputFilePath, "ts-from-js");
}

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}


function logFileCreated(file: string, type: string) {
    console.log(`CREATED[${type}]: ${file}`);
}

// Check JSON files
function checkJsonFiles() {

    readdirp(outputFolder, {
        fileFilter: ["package.json"],
        directoryFilter: (di) => !di.path.includes("node_modules")
    }).on("data", (entry: typeof EntryInfo) => {
        const jsonDir = path.dirname(entry.fullPath);
        const json = require(entry.fullPath);
        if (json.main) {
            let mainPath = path.join(jsonDir, json.main + ".ts");
            if (!fs.existsSync(mainPath)) {
                console.log(`-------> ${entry.path} -> main: ${mainPath} not found`);
            }
        }
        if (json.types) {
            let typesPath = path.join(jsonDir, json.types);
            if (!fs.existsSync(typesPath)) {
                console.log(`-------> ${entry.path} -> types: ${typesPath} not found`);
            }
        }
    })
        .on("warn", error => console.error("non-fatal error", error))
        .on("error", error => console.error("fatal error", error))
        .on("end", generateTestFile);
}

function addTestImport(module: string, origin: "pck" | "dts") {
    const importStatement = `import * as module_${origin}_${testImports.length} from "tns-core-modules/${module}";`;
    testImports.push(importStatement);
}

function generateTestFile() {
    console.log("--------- tests imports start ---------");
    console.log(testImports.join("\n"));
    console.log("--------- tests imports end ---------");
}