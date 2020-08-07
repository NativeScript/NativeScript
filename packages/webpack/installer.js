const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const dependencyManager = require("./dependencyManager");

function install() {
    const projectDir = helpers.getProjectDir();
    const packageJson = helpers.getPackageJson(projectDir);

    projectFilesManager.addProjectFiles(projectDir);

    const postinstallOptions = dependencyManager.addProjectDeps(packageJson);
    packageJson.devDependencies = postinstallOptions.deps;

    helpers.writePackageJson(packageJson, projectDir);

    dependencyManager.showHelperMessages(postinstallOptions);
}

function uninstall() {
    const projectDir = helpers.getProjectDir();
    projectFilesManager.removeProjectFiles(projectDir);

    console.log("NativeScript Webpack removed!");
}

module.exports = {
    install,
    uninstall,
};
