#!/usr/bin/env node

const { dirname: pathDirname } = require("path");
const { getPackageJson, writePackageJson } = require("../projectHelpers");

let processArgs = process.argv;
const distTag = processArgs.includes("--distTag") ? processArgs[processArgs.indexOf("--distTag") + 1] : undefined;

const tag = distTag || process.env["distTag"] || "next";

const projectDir = pathDirname(__dirname);
const packageJson = getPackageJson(projectDir);

if (distTag) {
    processArgs = processArgs.splice(processArgs.indexOf("--distTag"), 2);
}
const [, , packageVersion = new Date()] = processArgs;

packageJson.publishConfig = Object.assign(
    packageJson.publishConfig || {},
    { tag }
);

delete packageJson.private;

const currentVersion = packageJson.version;
const nextVersion = `${currentVersion}-${packageVersion}`;
const newPackageJson = Object.assign(packageJson, { version: nextVersion });

writePackageJson(newPackageJson, projectDir);
