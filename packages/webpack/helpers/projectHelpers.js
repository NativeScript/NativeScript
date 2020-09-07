const { resolve } = require("path");
const fs = require("fs");

const hook = require("@nativescript/hook")(__dirname);

const isTypeScript = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return (
        packageJson.dependencies &&
            packageJson.dependencies.hasOwnProperty("typescript"))
           || (packageJson.devDependencies &&
            packageJson.devDependencies.hasOwnProperty("typescript"))
         || isAngular({ packageJson });
};

const isShared = ({ projectDir }) => {
    const nsConfig = getNsConfig(projectDir);
    return nsConfig && !!nsConfig.shared;
}

const isPlugin = ({ projectDir, packageJson } = {}) => {
  packageJson = packageJson || getPackageJson(projectDir);
  return packageJson && packageJson.bootstrapper && (['nativescript-plugin-seed', '@nativescript/plugin-seed'].includes(packageJson.bootstrapper));
}

const isAngular = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && Object.keys(packageJson.dependencies)
        .some(dependency => /^@angular\b/.test(dependency));
};

const getAngularVersion = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && packageJson.dependencies["@angular/core"];
}

const isVue = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && Object.keys(packageJson.dependencies)
        .some(dependency => dependency === "nativescript-vue");
};

const isReact = ({ projectDir, packageJson } = {}) => {
  packageJson = packageJson || getPackageJson(projectDir);

  return packageJson.dependencies && Object.keys(packageJson.dependencies)
      .some(dependency => dependency === "react-nativescript");
};

const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    const result = readJsonFile(packageJsonPath);

    return result;
};

const getNsConfig = projectDir => {
    const nsConfigPath = getNsConfigPath(projectDir);
    const result = readJsonFile(nsConfigPath);

    return result;
};

const readJsonFile = filePath => {
    let result;
    try {
        result = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
        result = {};
    }

    return result;
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    const currentJsonContent = fs.readFileSync(packageJsonPath);
    const indentation = getIndentationCharacter(currentJsonContent);
    const stringifiedContent = JSON.stringify(content, null, indentation);
    const currentPackageJsonContent = JSON.parse(currentJsonContent);

    if (JSON.stringify(currentPackageJsonContent, null, indentation) !== stringifiedContent) {
        fs.writeFileSync(packageJsonPath, stringifiedContent)
    }
}

const getIndentationCharacter = (jsonContent) => {
    const matches = jsonContent && jsonContent.toString().match(/{\r*\n*(\W*)"/m);
    return matches && matches[1];
}

const getProjectDir = hook.findProjectDir;

const getPackageJsonPath = projectDir => {
  const packagePath = resolve(projectDir, "package.json");
  if (fs.existsSync(packagePath)) {
    return packagePath;
  } else {
    return getPackageJsonPath(resolve(projectDir, '..'));
  }
  
}
const getNsConfigPath = projectDir => resolve(projectDir, "nsconfig.json");

const isAndroid = platform => /android/i.test(platform);
const isIos = platform => /ios/i.test(platform);

function safeGet(object, property, ...args) {
    if (!object) {
        return;
    }

    const value = object[property];
    if (!value) {
        return;
    }

    return typeof value === "function" ?
        value.bind(object)(...args) :
        value;
}

// Convert paths from C:\some\path to C:/some/path in order to be required
function convertSlashesInPath(modulePath) {
    if (isWindows) {
        modulePath = modulePath.replace(/\\/g, "/");
    }
    return modulePath;
}

const isWindows = process.platform.startsWith("win32");

module.exports = {
    getPackageJson,
    getProjectDir,
    isAndroid,
    isIos,
    isAngular,
    isShared,
    isPlugin,
    getAngularVersion,
    isVue,
    isReact,
    isTypeScript,
    writePackageJson,
    convertSlashesInPath,
    getIndentationCharacter,
    safeGet,
};

