const madge = require('madge');
const path = require("path");
const fs = require("fs");

const workingDirecotry = process.cwd();
const androidApp = path.join(workingDirecotry, "platforms/android/app/src/main/assets/app/tns_modules/tns-core-modules");
const iosApp = path.join(workingDirecotry, "platforms/ios/tests/app/tns_modules/tns-core-modules");

const iosWhiteList = ['image-source/image-source.js'];
const androidWhiteList = ['image-source/image-source.js', 'ui/frame/frame.js'];

const printResult = (allCircleDeps) => {
    allCircleDeps.forEach(circleDeps => {
        const log = circleDeps.join(" -> ");
        console.log(log);
    });
}

const checkAppForCircualr = async (appName, whiteList) => {
    if (!fs.existsSync(appName)) {
        console.error(`${appName} doesn't exists!`);
        return;
    }

    const result = await madge(appName);
    const circular = result.circular();
    console.info(`Check ${appName}`);
    console.log(`Initial check: `, circular);

    const filteredResult = circular && circular.length > 0 && (whiteList ? circular.filter(c => whiteList.indexOf(c[0]) < 0) : circular);

    if (circular && circular.length > 0 && filteredResult.length > 0) {

        console.log(`Found circular deps!`);
        printResult(filteredResult);
        process.exit(1);
    }
}

(async () => await checkAppForCircualr(androidApp, androidWhiteList))();
(async () => await checkAppForCircualr(iosApp, iosWhiteList))();