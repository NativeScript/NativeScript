export * from './configuration';
import { existsSync } from "fs";
import { getPackageJson } from './helpers/projectHelpers';
import { resolve } from "path";


export type Platform = 'android' | 'ios';
/**
 * Function to ensure the app directory exists
 *
 * @param appDirectory
 */
function verifyEntryModuleDirectory(appDirectory: string) {
    if (!appDirectory) {
        throw new Error("Path to app directory is not specified. Unable to find entry module.");
    }

    if (!existsSync(appDirectory)) {
        throw new Error(`The specified path to app directory ${appDirectory} does not exist. Unable to find entry module.`);
    }
}

function getPackageJsonEntry(appDirectory) {
    const packageJsonSource = getPackageJson(appDirectory);
    const entry = packageJsonSource.main;

    if (!entry) {
        throw new Error(`${appDirectory}/package.json must contain a 'main' attribute!`);
    }

    return entry.replace(/\.js$/i, "");
}


export function getEntryModule  (appDirectory: string, platform: 'android' | 'ios') {
    verifyEntryModuleDirectory(appDirectory);

    const entry = getPackageJsonEntry(appDirectory);

    const tsEntryPath = resolve(appDirectory, `${entry}.ts`);
    const jsEntryPath = resolve(appDirectory, `${entry}.js`);
    let entryExists = existsSync(tsEntryPath) || existsSync(jsEntryPath);
    if (!entryExists && platform) {
        const platformTsEntryPath = resolve(appDirectory, `${entry}.${platform}.ts`);
        const platformJsEntryPath = resolve(appDirectory, `${entry}.${platform}.js`);
        entryExists = existsSync(platformTsEntryPath) || existsSync(platformJsEntryPath);
    }

    if (!entryExists) {
        throw new Error(`The entry module ${entry} specified in ` +
            `${appDirectory}/package.json doesn't exist!`)
    }

    return entry;
};