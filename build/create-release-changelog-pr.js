const { readFileSync } = require("fs");
const { resolve } = require("path");
const { createPR, argsParser, gitBranch } = require("./pr-helper");

const currentBranch = argsParser().currentBranch || gitBranch;
const modulesPackageVersion = argsParser().packageVersion || JSON.parse(readFileSync(resolve(process.cwd(), "tns-core-modules/package.json")).toString()).version;
const title = argsParser().title || `release: cut the ${modulesPackageVersion} release`;
const baseBranch = argsParser().base || "release";
const body = argsParser().body || "docs: update changelog";

const postQuery = {
    "body": body,
    "head": currentBranch,
    "base": baseBranch,
    "title": title
}

createPR(postQuery);