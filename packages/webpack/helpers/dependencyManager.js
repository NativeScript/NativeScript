const { isAngular } = require("./projectHelpers");

const NEW_DEPS_MESSAGE = `\
A few new dependencies were added. \
Run "npm install" before building your project.
`;

const ALREADY_ADDED_MESSAGE = `\
Some dependencies have already been added. \
If you want to force update them, please run "node_modules/.bin/update-ns-webpack".
`;

function addProjectDeps(packageJson, force = false) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    const postinstallOptions = {
        deps: Object.assign({}, packageJson.devDependencies),
    };

    const depsToAdd = getRequiredDeps(packageJson);
    Object.keys(depsToAdd).forEach(function (name) {
        const version = depsToAdd[name];
        Object.assign(postinstallOptions,
            addDependency(postinstallOptions.deps, name, version, force));
    });

    return postinstallOptions;
}

function forceUpdateProjectDeps(packageJson) {
    removeObsoleteDeps(packageJson);

    return addProjectDeps(packageJson, true);
}

function removeObsoleteDeps(packageJson) {
    const depsToRemove = [
        "webpack",
        "webpack-cli",
        "webpack-bundle-analyzer",
        "webpack-sources",
        "clean-webpack-plugin",
        "copy-webpack-plugin",
        "raw-loader",
        "css-loader",
        "nativescript-worker-loader",
        "terser-webpack-plugin",
        "@angular-devkit/core",
        "resolve-url-loader",
        "sass-loader",
    ];

    depsToRemove.forEach(dep => delete packageJson.devDependencies[dep]);
}

function addDependency(deps, name, version, force) {
    const options = { deps };

    if (!deps[name] || force) {
        deps[name] = version;
        options.newDepsAdded = true;
        console.info(`Adding dev dependency: ${name}@${version}`);
    } else if (deps[name] !== version) {
        options.hasOldDeps = true;
        console.info(`Dev dependency: ${name} already added. Leaving version: ${deps[name]}`);
    }

    return options;
}

function getRequiredDeps(packageJson) {
    if (!isAngular({ packageJson })) {
        return false;
    }

    const deps = {
        "@angular/compiler-cli": "~8.2.0",
    };

    if (!dependsOn(packageJson, "@angular-devkit/build-angular")) {
        deps["@ngtools/webpack"] = "8.2.0";
    }

    return deps;
}


function dependsOn(packageJson, package) {
    if (!packageJson) {
        return false;
    }

    return packageJson.dependencies.hasOwnProperty(package) ||
        packageJson.devDependencies.hasOwnProperty(package);
}

function showHelperMessages({ newDepsAdded, hasOldDeps }) {
    if (hasOldDeps) {
        console.info(ALREADY_ADDED_MESSAGE);
    }

    if (newDepsAdded) {
        console.info(NEW_DEPS_MESSAGE);
    }
}

module.exports = {
    addProjectDeps,
    forceUpdateProjectDeps,
    showHelperMessages,
};
