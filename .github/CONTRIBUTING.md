# Contributing to NativeScript

## Before You Start

Anyone wishing to contribute to the NativeScript project MUST read & sign the [NativeScript Contribution License Agreement](http://www.nativescript.org/cla). The NativeScript team cannot accept pull requests from users who have not signed the CLA first.

## Introduction

These guidelines are here to facilitate your contribution and streamline the process of getting changes merged into this project and released. Any contributions you can make will help tremendously, even if only in the form of an issue report. Following these guidelines will help to streamline the pull request and change submission process.

## Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the "Code Fixes and Enhancements" section).

## Requesting New Features

1. Use Github Issues to submit feature requests.
2. First search for a similar request and extend it if applicable. This way it would be easier for the community to track the features.
2. When a brand new feature requested, try to give as many details on your need as possible. We prefer that you explain a need than explain a technical solution for it. That might trigger a nice conversation on finding the best and broadest technical solution to a specific need.

## Asking for Help

The NativeScript team does *not* provide guaranteed formal support, except to those customers who have purchased a [commercial license for NativeScript](http://www.telerik.com/support/platform/) (Developer, Professional, Business, etc.) or a support-only package from Telerik.com. Please do not create support requests for this project in the issues list for this repo, as these will be immediately closed and you'll be directed to post your question on a community forum.


## Code Fixes and Enhancements

### 1. Log an Issue

Before doing anything else, we ask that you file an issue in the Issues list for this project. First, be sure to check the list to ensure that your issue hasn't already been logged. If you're free and clear, file an issue and provide a detailed description of the bug or feature you're interested in. If you're also planning to work on the issue you're creating, let us know so that we can help and provide feedback. To help us investigate your issue and respond in a timely manner, you can provide is with the following details:
- **Overview of the issue**: Provide a short description of the visible symptoms. If applicable, include error messages, screen shots, and stack traces.
- **Motivation for or use case**: Let us know how this particular issue affects your work.
- **Telerik NativeScript version(s)**: List the current version and build number of the CLI interface, the runtime and the modules. You can get these by checking the package.json files of the respective package. Let us know if you have not observed this behavior in earlier versions and if you consider it a regression.
- **System configuration**: Provide us with relevant system configuration information such as operating system, network connection, proxy usage, etc. Let us know if you have been able to reproduce the issue on multiple setups.
- **Steps to reproduce**: If applicable, submit a step-by-step walkthrough of how to reproduce the issue.
- **Related issues**: If you discover a similar issue in our archive, give us a heads up - it might help us identify the culprit.
- **Suggest a fix**: You are welcome to suggest a bug fix or pinpoint the line of code or the commit that you believe has introduced the issue.

### 2. Fork and Branch

#### Fork Us, Then Create A Topic Branch For Your Work

The work you are doing for your pull request should not be done in the master branch of your forked repository. Create a topic branch for your work. This allows you to isolate the work you are doing from other changes that may be happening.

Github is a smart system, too. If you submit a pull request from a topic branch and we ask you to fix something, pushing a change to your topic branch will automatically update the pull request. 

#### Isolate Your Changes For The Pull Request

See the previous item on creating a topic branch.

If you don't use a topic branch, we may ask you to re-do your pull request on a topic branch. If your pull request contains commits or other changes that are not related to the pull request, we will ask you to re-do your pull request.

#### Branch from "master"

The "master" branch of the NativeScript repository is for continuous contribution. Always create a branch for your work from the "master" branch. This will facilitate easier pull request management.

#### Contribute to the Code Base
Before you submit a Pull Request, consider the following guidelines.

Search GitHub for an open or closed Pull Request that relates to your submission.
Clone the repository.
```bash
    git clone git@github.com:NativeScript/NativeScript.git
```
Initialize the submodules.
```bash
    git submodule update --init --recursive
```
Make your changes in a new git branch. We use the Gitflow branching model so you will have to branch from our master branch.
```bash
    git checkout -b my-fix-branch master
```
Create your patch and include appropriate test cases.
Build your changes locally.
```bash
    grunt
```
Commit your changes and create a descriptive commit message (the commit message is used to generate release notes).
```bash
    git commit -a
```
Push your branch to GitHub.
```bash
    git push origin my-fix-branch
```
In GitHub, send a Pull Request to NativeScript:NativeScript:master.
If we suggest changes, you can modify your branch, rebase, and force a new push to your GitHub repository to update the Pull Request.
```bash
    git rebase master -i
    git push -f
```
That's it! Thank you for your contribution!

When the patch is reviewed and merged, you can safely delete your branch and pull the changes from the main (upstream) repository.

Delete the remote branch on GitHub.
```bash
    git push origin --delete my-fix-branch
```
Check out the master branch.
```bash
    git checkout master -f
```
Delete the local branch.
```bash
    git branch -D my-fix-branch
```
Update your master branch with the latest upstream version.
```bash
    git pull --ff upstream master
```

#### Squash your commits

When you've completed your work on a topic branch, we prefer that you squash your work down into a single commit to make the merge process easier. For information on squashing via an interactive rebase, see [the rebase documentation on GitHub](https://help.github.com/articles/interactive-rebase)

### 3. Submit a Pull Request

See [Github's documentation for pull requests](https://help.github.com/articles/using-pull-requests).

Pull requests are the preferred way to contribute to NativeScript. Any time you can send us a pull request with the changes that you want, we will have an easier time seeing what you are trying to do. But a pull request in itself is not usually sufficient. There needs to be some context and purpose with it, and it should be done against specific branch.

### Provide A Meaningful Description

Similar to reporting an issue, it is very important to provide a meaningful description with your pull requests that alter any code. A good format for these descriptions will include four things:

1. Why: The problem you are facing (in as much detail as is necessary to describe the problem to someone who doesn't know anything about the system you're building)

2. What: A summary of the proposed solution

3. How: A description of how this solution solves the problem, in more detail than item #2

4. Any additional discussion on possible problems this might introduce, questions that you have related to the changes, etc.

Without at least the first 2 items in this list, we won't have any clue why you're changing the code. The first thing we'll ask, then, is that you add that information.

## Code Style

All code contributed to this project should adhere to a consistent style, so please keep these in mind before you submit your Pull Requests:

- Tab indentation, size of 4
- Semicolons are nice. Use them
- Double quotes
- No trailing whitespace
- Declare one variable per var statement
- Declare variables at the top of a scope
- Return early

For a more detailed guide, check the [Coding Convention](https://github.com/NativeScript/NativeScript/blob/master/CodingConvention.md). 
