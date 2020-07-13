# Contributing
====================

<!-- TOC depthFrom:2 -->

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Testing locally](#testing-locally-by-running-e2e-tests)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Submitting PR](#submitting-pr)
- [Publishing new versions](#publishing-new-versions)

<!-- /TOC -->

## Introduction

First of all, thank you for taking the time to contribute!

Before starting, make yourself familiar with the `@nativescript/webpack`'s [documentation](http://docs.nativescript.org/best-practices/bundling-with-webpack) and the official [NativeScript Code Of Conduct]( https://github.com/NativeScript/codeofconduct).

## Project Structure

The repository contains several ingredients:
*   `installer.js` - combination of postinstall scripts for adding or removing webpack configurations and necessary dependecies when installing the plugin.
*   `templates/` - webpack config templates for different types of projects - NativeScript with JavaScript, NativeScript with TypeScript and NativeScript Angular projects.
*   `plugins/` - several [Webpack plugins](https://webpack.js.org/concepts/plugins/) necessary for bundling NativeScript applications.
*   `snapshot/android/` - tools used with the `NativeScriptSnapshot` plugin for generating V8 Heap Snapshots.
*   `nativescript-target/` - configuration of a [Webpack deployment target](https://webpack.js.org/concepts/targets/) for building NativeScript applications.
*   `bin/` - helper node/npm scripts for projects using the plugin.
*   `demo/` - resides several NativeScript applications, testing different scenarios. You can execute each app's tests by navigating to its directory and running `npm run e2e -- --runType nameOfRuntype`. For more information on runTypes, check out the [nativescript-dev-appium](https://github.com/NativeScript/nativescript-dev-appium#custom-appium-capabilities) plugin.

## Setup

> Note that you need npm 5+ for local development of the plugin.
1. [Fork](https://help.github.com/articles/fork-a-repo/) and clone the GitHub repository:
    ```bash
    git clone https://github.com/your-username/nativescript-dev-webpack.git
    ```

2. Add an 'upstream' remote pointing to the original repository:
    ```bash
    cd nativescript-dev-webpack
    git remote add upstream https://github.com/NativeScript/nativescript-dev-webpack.git
    ```

3. Create a branch for your changes:
    ```bash
    git checkout -b <my-fix-branch> master
    ```

4. Install dependencies:
    ```bash
    npm install
    ```

The last command also runs `npm prepare` which compiles the TypeScript files in the plugin. 
You are good to go! You're strongly encouraged to follow the official NativeScript [Coding Conventions](https://github.com/NativeScript/NativeScript/blob/master/CodingConvention.md) and to use ES features available in NodeJS v6. If unsure, check on [node.green](http://node.green/).

## Testing locally by running e2e tests

NOTE: There are three test apps in the repository, located in the `/demo` directory. The steps below describe how to run the tests for the `AngularApp`, but the same approach can be used to run any other `e2e` tests.

1. Navigate to `demo/AngularApp`.
    ``` bash
    cd demo/AngularApp
    ```

2. Install your local copy of the `@nativescript/webpack` plugin.
    ```bash
    npm run setup
    ```

3. Make sure to have an emulator set up or connect a physical Android/iOS device.

4. Build the app for Android or iOS.
    ``` bash
    tns run android/ios
    ```

5. Install [appium](http://appium.io/) globally.
    ``` bash
    npm install -g appium
    ```

6. Follow the instructions in the [nativescript-dev-appium](https://github.com/nativescript/nativescript-dev-appium#custom-appium-capabilities) plugin to add an appium capability for your device inside `./e2e/renderer/e2e/config/appium.capabilities.json`.

7. Run the automated tests. The value of the `runType` argument should match the name of the capability that you just added.
    ``` bash
    npm run e2e -- --runType capabilityName
    ```

## Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the [Submitting a PR](#submitting-pr) section).

## Requesting Features

1. Use Github Issues to submit feature requests.
2. First, search for a similar request and extend it if applicable. This way it would be easier for the community to track the features.
3. When requesting a new feature, please provide as much detail as possible about why you need the feature in your apps. We prefer that you explain a need rather than explain a technical solution for it. That might trigger a nice conversation on finding the best and broadest technical solution to a specific need.

## Submitting PR

1. Create one or several commits describing your changes. Follow the [Angular commit message guidelines](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w).

2. Push your branch to GitHub:
    ```bash
    git push origin my-fix-branch
    ```

3. In GitHub, send a pull request to `nativescript-dev-webpack:master`. If we suggest changes, then:

    *   Make the required updates.
    *   Commit the changes to your branch (e.g. `my-fix-branch`).
    *   Push the changes to your GitHub repository (this will update your PR).

4. If your branch gets too outdated you may need to rebase it on top of the upstream master and force push to update your PR:

    1. Fetch the latest changes
        ```bash
        git fetch upstream
        ```

    2. Check out to your fork's local `master` branch
        ```bash
        git checkout master
        ```

    3. Merge the original repo changes into your local `master` branch
        ```bash
        git merge upstream/master
        ```

    4. Rebase it on top of `master`
        ```bash
        git rebase -i master
        ```

    5. Update your PR with force push
        ```bash
        git push -f origin my-fix-branch
        ```

Thank you for your contribution!

## Publishing new versions


## <a name="release"></a> Releasing new versions
Instructions how to release a new version for **NativeScript Core Team Members**.

![](./release-contribution-guide-schema-webpack.png?raw=true)

1. Checkout release branch
```
git checkout release && git pull
```
#### If we prepare major or minor release, merge master in release branch else **skip this step**.
```
git merge --ff-only origin/master
```
*** Note: If there are commits in release branch which are not merged in master branch '-ff-merge' command will fail. 
In this case the commits should be merge firstly from release in master branch as explained in section 'Merge changes from release into master' and then repeat step 1.

2. Execute `npm i` to install dependencies:
```
npm i
```
3. Execute [`npm version`](https://docs.npmjs.com/cli/version) to bump the version:
```
npm --no-git-tag-version version [patch|minor|major] -m "release: cut the %s release"
```
or
```
npm --no-git-tag-version version [version] --allow-same-version -m "release: cut the %s release"

```
7. Create release-branch with change log
```
git checkout -b release-[release-version]
```

7. Add changes
```
git add changed-files
git commit -m "release: cut the %s release"
git push
```
8. Create git tag
```
git tag release-version
git push --tags
```
9. Create a pull request from git in web or try to use script below. Be careful to base your branch on the correct "release" branch
```
curl -d '{"title": "release: cut the [release-version] release","body": "docs: update changelog","head": "${BRANCH}","base": "release"}' -X POST https://api.github.com/repos/NativeScript/nativescript-dev-webpack/pulls -H "Authorization: token ${GIT_TOKEN}"
```
10. Merge PR into release branch.

11. If all checks has passed publish package. Usually the night builds will be triggered and the package will be ready to be released on the next day. 

## Merge changes from release into master

![](./merge-guidance-schema.png)

### Here are steps described in the diagram above.

1. Make sure you are in release branch:
```
git checkout release
git pull
```
2. Create PR to merge changes back in master and preserve history:
```
export MERGE_BRANCH='merge-release-in-master'
git checkout -b ${MERGE_BRANCH}
git push --set-upstream origin ${MERGE_BRANCH}
git merge origin/master
```
3. Resolve conflicts. Choose to keep the version of master branch. If it is needed to revert versions of modules, see at the bottom.

4. Add conflicts:
```
git add resolved files
```
5. Commit changes with default merge message:
```
git commit
git push
```

6. Create pull request. Replace replace env ${MERGE_BRANCH} with its value
```
curl -d '{"title": "chore: merge release in master","body": "chore: merge release in master","head": "merge-release-in-master","base": "master"}' -X POST https://api.github.com/repos/NativeScript/NativeScript/pulls -H "Authorization: token ${GIT_TOKEN}"
```

**If needed, revert version of modules and platform declarations to take the one from master:**
```
git checkout origin/master tns-platform-declarations/package.json tns-core-modules/package.json
git commit --amend
git push --force-with-lease
```
This will require to repeat steps from 1 to 4, since we need to keep the branches with the same history
