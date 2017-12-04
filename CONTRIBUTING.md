# Contributing to NativeScript

:+1: First of all, thank you for taking the time to contribute! :+1:

Here are some guides on how to do that:
 - [Code of Conduct](#coc)
 - [Reporting Bugs](#bugs)
 - [Requesting New Features](#features)
 - [Submitting a PR](#pr)

##  <a name="coc"></a> Code of Conduct
Help us keep a healthy and open community. We expect all participants in this project to adhere to the [NativeScript Code Of Conduct](https://github.com/NativeScript/codeofconduct).


## <a name="bugs"></a> Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the [Submitting a PR](#pr) section).

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
    - Write unit tests for your fix or feature. Check out [writing unit tests guide](WritingUnitTests.md).

5. Before you submit your PR:
    - Rebase your changes to the latest master: `git pull --rebase upstream master`.
    - Ensure all unit test are green for Android and iOS. Check [running unit tests](DevelopmentWorkflow.md#running-unit-tests).
    - Ensure your changes pass tslint validation. (run `npm run tslint` in the root of the repo).

6. Push your fork. If you have rebased you might have to use force-push your branch:
```
git push origin <my-fix-branch> --force
```

7. [Submit your pull request](https://github.com/NativeScript/NativeScript/compare). Please, fill in the Pull Request template - it will help us better understand the PR and increase the chances of it getting merged quickly.

It's our turn from there on! We will review the PR and discuss changes you might have to make before merging it! Thanks! 


### Where to Start

If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/NativeScript/NativeScript/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).
