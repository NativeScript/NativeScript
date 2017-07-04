# Contributing to NativeScript

:+1: First of all, thank you for taking the time to contribute! :+1:

Here are some guides on how to do that:
 - [Code of Conduct](#coc)
 - [Reporting Bugs](#bugs)
 - [Requesting New Features](#features)
 - [Asking for Help](#help)
 - [Submitting a PR](#pr)


##  <a name="coc"></a> Code of Conduct
Help us keep a healthy and open community. We expect all participants in this project to adhere to the the [NativeScript Code Of Conduct](https://github.com/NativeScript/codeofconduct).


## <a name="bugs"></a> Reporting Bugs

1. Always update to the most recent master release; the bug may already be resolved.
2. Search for similar issues in the issues list for this repo; it may already be an identified problem.
3. If this is a bug or problem that is clear, simple, and is unlikely to require any discussion -- it is OK to open an issue on GitHub with a reproduction of the bug including workflows and screenshots. If possible, submit a Pull Request with a failing test, entire application or module. If you'd rather take matters into your own hands, fix the bug yourself (jump down to the [Submitting a PR](#pr) section).

## <a name="features"></a> Requesting Features

1. Use Github Issues to submit feature requests.
2. First search for a similar request and extend it if applicable. This way it would be easier for the community to track the features.
3. When a brand new feature requested, try to give as many details on your need as possible. We prefer that you explain a need than explain a technical solution for it. That might trigger a nice conversation on finding the best and broadest technical solution to a specific need.

## <a name="help"></a> Asking for Help

We tend to keep GitHub issues strictly for bug reports and feature request (a.k.a "things you can address with a PR").

If you have a question or need help with your project, start by seeing if anyone else has encountered the scenario on [Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript). If you cannot find any information, try [asking the question yourself](http://stackoverflow.com/questions/ask/advice?). Make sure to add any details needed to recreate the issue and include the `NativeScript` tag, so your question is visible to the NativeScript community.

If you need more help than the Q&A format Stack Overflow can provide, try [joining the NativeScript community Slack](http://developer.telerik.com/wp-login.php?action=slack-invitation). The Slack chat is a great place to get help troubleshooting problems, as well as connect with other NativeScript developers.

## <a name="pr"></a> Submitting a PR

* Read and sign the [NativeScript Contribution License Agreement](http://www.nativescript.org/cla).
* Make sure there is an issue for the bug or feature you will be working on.
* Fork and clone the NativeScript repo:
```bash
git clone https://github.com/<your-git-username>/NativeScript.git
```
* Setup the project (for detailed info check our [development workflow guide](DevelopmentWorkflow.md)):

```bash
#In the repo root
npm install
npm run setup
```

* Create a branch for your PR
```bash
git checkout -b my-fix-branch master
```

* The fun part! Make your code changes

* Follow the [code conventions guide](CodeConvention.md)

* All bugs and features should have unit tests. 

* Before you submit your PR make sure:
    * Rebase your changes to the latest master.
    * All unit test are green for both Android and IOS. Check [running unit tests](DevelopmentWorkflow.md#running-unit-tests).
    * Tslint is passing (run `npm run tslint` in the root of the repo).

* Push your fork and [submit a pull request](https://github.com/NativeScript/NativeScript/compare). Please fill in the Pull Request template - it will help us better understand the PR and increase the chances of it getting merged quickly.

### Where to Start

If you want to contribute, but you are not sure where to start - look for [issues marked with up-for-grabs tag](https://github.com/NativeScript/NativeScript/issues?q=is%3Aopen+is%3Aissue+label%3Aup-for-grabs).
