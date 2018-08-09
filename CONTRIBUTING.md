# Contributing to NativeScript

:+1: First of all, thank you for taking the time to contribute! :+1:

Here are some guides on how to do that:
 - [Code of Conduct](#coc)
 - [Reporting Bugs](#bugs)
 - [Requesting New Features](#features)
 - [Submitting a PR](#pr)
 - [Commit Message Guidelines](#commit-messages)
 - [Releasing new versions](#release)

##  <a name="coc"></a> Code of Conduct
Help us keep a healthy and open community. We expect all participants in this project to adhere to the [NativeScript Code Of Conduct](https://github.com/NativeScript/codeofconduct).


## <a name="bugs"></a> Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the [Submitting a PR](#pr) section).

> While we are doing all we can to take care of every issue, sometimes we get overwhelmed. That's why
> - issues that are not constructive or describe problems that cannot be reproduced will be closed
> - feature requests or bug reports with unanswered questions regarding the behavior/reproduction for more than 20 days will be closed 

## <a name="features"></a> Requesting Features

1. Use Github Issues to submit feature requests.
2. First, search for a similar request and extend it if applicable. This way it would be easier for the community to track the features.
3. When requesting a new feature, please provide as much detail as possible about why you need the feature in your apps. We prefer that you explain a need rather than explain a technical solution for it. That might trigger a nice conversation on finding the best and broadest technical solution to a specific need.

## <a name="pr"></a> Submitting a PR

Before you begin:
* Read and sign the [NativeScript Contribution License Agreement](http://www.nativescript.org/cla).
* Make sure there is an issue for the bug or feature you will be working on.

Following these steps is the best way to get you code included in the project:

1. Fork and clone the NativeScript repo:
```bash
git clone https://github.com/<your-git-username>/NativeScript.git
# Navigate to the newly cloned directory
cd NativeScript
# Add an "upstream" remote pointing to the original {N} repo.
git remote add upstream https://github.com/NativeScript/NativeScript.git
```

2. Set up the project (for detailed info check our [development workflow guide](DevelopmentWorkflow.md)):

```bash
#In the repo root
npm install
npm run setup
```

3. Create a branch for your PR
```bash
git checkout -b <my-fix-branch> master
```

4. The fun part! Make your code changes. Make sure you:
    - Follow the [code conventions guide](CodingConvention.md).
    - Follow the [guide on handling errors and exceptions](HandlingErrors.md).
    - Write unit tests for your fix or feature. Check out [writing unit tests guide](WritingUnitTests.md).

5. Before you submit your PR:
    - Rebase your changes to the latest master: `git pull --rebase upstream master`.
    - Ensure all unit test are green for Android and iOS. Check [running unit   tests](DevelopmentWorkflow.md#running-unit-tests).
    - Ensure your changes pass tslint validation. (run `npm run tslint` in the root of the repo).

6. Push your fork. If you have rebased you might have to use force-push your branch:
```
git push origin <my-fix-branch> --force
```

7. [Submit your pull request](https://github.com/NativeScript/NativeScript/compare). Please, fill in the Pull Request template - it will help us better understand the PR and increase the chances of it getting merged quickly.

It's our turn from there on! We will review the PR and discuss changes you might have to make before merging it! Thanks! 

>Note: Sometimes you will see someone from the contributors team writing strange comments like: `test` or `test branch_functional_tests#css-gradients-tests branch_widgets#vultix/css-gradients` - don't worry about it, these are just phrases that trigger the internal CI builds.

## <a name="commit-messages"></a> Commit Message Guidelines

Please follow the git commit message format described below when committing your changes or submitting a PR. That allows us to use the commit messages to generate a change log for every new release.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Samples:

```
docs(README): add link to NativeScript roadmap
```
```
fix(ios-layouts): switch contentInsetAdjustmentBehavior on ScrollView

Do not auto adjust the ScrollView insets, by disabling contentInsetAdjustmentBehavior property, when ScrollView is used as a root Page element.
```
```
release: cut the 3.2.0 release
```

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: npm, grunt)
* **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Jenkins)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **fix-next**: A fix for a bug in the master branch, that's not yet released
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **release**: Reference commit for the git tag of the release
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests (example scopes: e2e, name-of-the-test-app)

### Scope
The scope should be the name of the affected component in the code.
If the change affects only one of the target platforms (android, ios) that should be specified in the scope.

Sample scopes for the `tns-core-modules` package:

* **android/application**
* **ios/application**
* **action-bar**
* **animations**
* **date-picker**
* **profiling**

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. Describe the changes and provide a migration guide for any code that may be affected.
Sample:
```
feat: Angular 4.2 support

BREAKING CHANGES:


NativeScriptModule should be imported only in the root application
module (usually named AppModule).
ApplicationModule.
All other NgModules in the app (both feature and lazy-loaded ones)
should import the NativeScriptCommonModule instead.
The behaviour is alligned with BrowserModule and CommonModule in web
Angular apps. angular.io/guide/ngmodule-faq#q-browser-vs-common-module
Migration steps:
In all NgModules, instead of the root one, replace:

import { NativeScriptModule } from "nativescript-angular/nativescript.module";
…
@NgModule({
    imports: [
        NativeScriptModule,
    ]
…
})

with: 

import { NativeScriptCommonModule } from "nativescript-angular/common";
…
@NgModule({
    imports: [
        NativeScriptCommonModule,
    ]
…
})
```
The above guidelines are based on the [AngularJS Git Commit Message Conventions][commit-message-format]. A detailed explanation and additional examples can be found in this [document][commit-message-format].

## Where to Start

If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/NativeScript/NativeScript/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).


[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#

## <a name="release"></a> Releasing new versions

Instructions how to release a new version for **NativeScript Core Team Members**.

1. Execute `npm install` to install dependencies:
```bash
npm install
```

2. Add the following to your `.npmrc`:
```
tag-version-prefix=""
message="release: cut the %s release"
```

3. Create new branch based on `master`:
```bash
git checkout -b username/release-version
```

4. Execute [`npm version`](https://docs.npmjs.com/cli/version) to bump the version of `tns-platform-declarations`:
```bash
cd tns-platform-declarations
npm --no-git-tag-version version [patch|minor|major]
cd ..
```

5. Execute [`npm version`](https://docs.npmjs.com/cli/version) to bump the version of `tns-core-modules`, tag the release and update the CHANGELOG.md:
```bash
cd tns-core-modules
npm version [patch|minor|major]
cd ..
```

6. Push all the changes to your branch and open a pull request:
```bash
git push --set-upstream origin username/release-version --tags
```

7. Create `release` branch after the pull request is merged to `master` and publish the packages built on CI to `npm`.
